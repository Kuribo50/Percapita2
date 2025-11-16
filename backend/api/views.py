from datetime import date, datetime
import json
from typing import Dict, List, Tuple
import hashlib

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Q, Max
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from .models import (
    CorteFonasa,
    HpTrakcare,
    HistorialCarga,
    CorteFonasaObservacion,
    NuevoUsuario,
    ValidacionCorte,
    Etnia,
    Nacionalidad,
    Sector,
    Subsector,
    Establecimiento,
    normalize_motivo,
    normalize_run,
)
from .serializers import (
    CorteFonasaDetailSerializer,
    CorteFonasaRecordSerializer,
    HpTrakcareDetailSerializer,
    HpTrakcareRecordSerializer,
    NuevoUsuarioSerializer,
    NuevoUsuarioRecordSerializer,
    ValidacionCorteSerializer,
    CorteFonasaObservacionSerializer,
    EtniaSerializer,
    NacionalidadSerializer,
    SectorSerializer,
    SubsectorSerializer,
    EstablecimientoSerializer,
    HistorialCargaSerializer,
)


CORTE_COLUMNS = [
    "run",
    "nombres",
    "apPaterno",
    "apMaterno",
    "fechaNacimiento",
    "genero",
    "tramo",
    "fehcaCorte",
    "nombreCentro",
    "centroDeProcedencia",
    "comunaDeProcedencia",
    "centroActual",
    "comunaActual",
    "aceptadoRechazado",
    "motivo",
]

TRAKCARE_COLUMNS = [
    "codFamilia",
    "relacionParentezco",
    "idTrakcare",
    "etnia",
    "codRegistro",
    "nacionalidad",
    "RUN",
    "apPaterno",
    "apMaterno",
    "nombre",
    "genero",
    "fechaNacimiento",
    "edad",
    "direccion",
    "telefono",
    "telefonoCelular",
    "TelefonoRecado",
    "servicioSalud",
    "centroInscripcion",
    "sector",
    "prevision",
    "planTrakcare",
    "praisTrakcare",
    "fechaIncorporacion",
    "fechaUltimaModif",
    "fechaDefuncion",
]

MONTH_NAMES_ES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
]

# Solo los 3 motivos que realmente aparecen en el sistema
NON_VALIDATED_MOTIVOS = {
    "TRASLADO NEGATIVO",
    "RECHAZADO PREVISIONAL",
    "RECHAZADO FALLECIDO",
}


def _is_validated_corte(aceptado_rechazado: str, motivo: str) -> bool:
    """
    Determina si un registro del corte FONASA está validado.
    
    Valores posibles en aceptadoRechazado:
    - "ACEPTADO" -> VALIDADO
    - "RECHAZADO" -> NO VALIDADO
    - "INGRESO RECHAZO SIMULTÁNEO" -> NO VALIDADO (es un rechazo)
    - Vacío o None -> Revisar motivo
    
    Lógica:
    1. Si aceptadoRechazado == "ACEPTADO" -> SÍ validado
    2. Si aceptadoRechazado contiene "RECHAZADO" o "RECHAZO" -> NO validado
    3. Si el motivo está en NON_VALIDATED_MOTIVOS -> NO validado
    4. Si el motivo contiene "FALLECIDO" -> NO validado (caso especial)
    5. Por defecto -> SÍ validado
    """
    if not aceptado_rechazado:
        aceptado_upper = ""
    else:
        aceptado_upper = str(aceptado_rechazado).upper().strip()
    
    motivo_norm = normalize_motivo(motivo or "")
    
    # Prioridad 1: Revisar aceptadoRechazado exactamente
    # ACEPTADO -> Validado
    if aceptado_upper == "ACEPTADO":
        return True
    
    # RECHAZADO o INGRESO RECHAZO SIMULTÁNEO -> No validado
    if "RECHAZADO" in aceptado_upper or "RECHAZO" in aceptado_upper:
        return False
    
    # Prioridad 2: Revisar motivo normalizado
    if motivo_norm in NON_VALIDATED_MOTIVOS:
        return False
    
    # Caso especial: fallecidos no están validados
    if "FALLECIDO" in motivo_norm:
        return False
    
    # Por defecto, si no hay indicación clara, se considera validado
    return True


def _format_month_label(year: int, month: int) -> str:
    if 1 <= month <= 12:
        return f"{MONTH_NAMES_ES[month - 1]} {year}"
    return f"{year}-{month:02d}"


def _format_month_key(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def _safe_str(value, *, max_length: int | None = None) -> str:
    text = "" if value is None else str(value).strip()
    if max_length is not None:
        return text[:max_length]
    return text
def _parse_date(value: str | None) -> date | None:
    if not value:
        return None

    if isinstance(value, datetime):
        return value.date()

    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except (ValueError, TypeError):
            continue
    return None


def _parse_int(value: str | None) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def get_rut_from_token(token: str | None) -> str | None:
    """Extrae el RUN del token base64 enviado desde el frontend."""
    if not token:
        return None
    
    try:
        import base64
        # Remover el prefijo "Bearer " si existe
        if token.startswith("Bearer "):
            token = token[7:]
        
        # Decodificar el base64
        decoded = base64.b64decode(token).decode('utf-8')
        payload = json.loads(decoded)
        return payload.get('rut')
    except Exception:
        return None


def _parse_month(month_param: str | None) -> Tuple[int, int] | None:
    if not month_param:
        return None
    try:
        parts = month_param.split("-")
        if len(parts) != 2:
            return None
        year = int(parts[0])
        month = int(parts[1])
        if 1 <= month <= 12:
            return year, month
    except (TypeError, ValueError):
        return None
    return None


def _motivo_priority(value: str | None) -> int:
    normalized = normalize_motivo(value)
    if normalized in NON_VALIDATED_MOTIVOS:
        return 2
    return 0


def _build_corte_payload(instance: CorteFonasa) -> Dict[str, str | None]:
    return {
        "id": instance.id,
        "run": instance.run,
        "nombres": instance.nombres,
        "apPaterno": instance.ap_paterno,
        "apMaterno": instance.ap_materno,
        "fechaNacimiento": instance.fecha_nacimiento.isoformat() if instance.fecha_nacimiento else "",
        "genero": instance.genero,
        "tramo": instance.tramo,
        "fehcaCorte": instance.fecha_corte.isoformat(),
        "nombreCentro": instance.nombre_centro,
        "centroDeProcedencia": instance.centro_de_procedencia,
        "comunaDeProcedencia": instance.comuna_de_procedencia,
        "centroActual": instance.centro_actual,
        "comunaActual": instance.comuna_actual,
        "aceptadoRechazado": instance.aceptado_rechazado,
        "motivo": instance.motivo,
        "isValidated": _is_validated_corte(instance.aceptado_rechazado, instance.motivo),
    }


def _build_trakcare_payload(instance: HpTrakcare) -> Dict[str, str | int | None]:
    """Construye un payload serializable con los datos principales de HP Trakcare."""

    etnia = instance.etnia
    nacionalidad = instance.nacionalidad
    centro_inscripcion = instance.centro_inscripcion
    sector = instance.sector

    return {
        "id": instance.id,
        "codFamilia": instance.cod_familia or None,
        "relacionParentezco": instance.relacion_parentezco or None,
        "idTrakcare": instance.id_trakcare or None,
        "codRegistro": instance.cod_registro or None,
        "RUN": instance.run or None,
        "apPaterno": instance.ap_paterno or None,
        "apMaterno": instance.ap_materno or None,
        "nombre": instance.nombre or None,
        "genero": instance.genero or None,
        "fechaNacimiento": instance.fecha_nacimiento.isoformat() if instance.fecha_nacimiento else None,
        "edad": instance.edad,
        "direccion": instance.direccion or None,
        "telefono": instance.telefono or None,
        "telefonoCelular": instance.telefono_celular or None,
        "TelefonoRecado": instance.telefono_recado or None,
        "telefonoRecado": instance.telefono_recado or None,
        "servicioSalud": instance.servicio_salud or None,
        "prevision": instance.prevision or None,
        "planTrakcare": instance.plan_trakcare or None,
        "praisTrakcare": instance.prais_trakcare or None,
        "fechaIncorporacion": instance.fecha_incorporacion.isoformat() if instance.fecha_incorporacion else None,
        "fechaUltimaModif": instance.fecha_ultima_modif.isoformat() if instance.fecha_ultima_modif else None,
        "fechaDefuncion": instance.fecha_defuncion.isoformat() if instance.fecha_defuncion else None,
        # Relaciones normalizadas
        "etnia": etnia.nombre if etnia else None,
        "nacionalidad": nacionalidad.nombre if nacionalidad else None,
        "centroInscripcion": centro_inscripcion.nombre if centro_inscripcion else None,
        "sector": sector.nombre if sector else None,
    }


def _check_admin_password(request) -> Tuple[bool, Response | None]:
    expected = getattr(settings, "ADMIN_DELETE_PASSWORD", "")
    if not expected:
        return True, None

    provided = None
    if hasattr(request, "data") and isinstance(request.data, dict):
        provided = request.data.get("admin_password")
    if not provided:
        provided = request.query_params.get("admin_password")

    if provided != expected:
        return False, Response({"detail": "Contraseña de administrador incorrecta."}, status=status.HTTP_403_FORBIDDEN)

    return True, None


def _validar_nuevos_usuarios_con_corte():
    """
    Valida automáticamente los nuevos usuarios contra el último corte disponible.
    Se ejecuta cada vez que se sube un nuevo corte.
    """
    # Obtener el último corte disponible
    ultimo_corte = CorteFonasa.objects.order_by('-fecha_corte').first()
    if not ultimo_corte:
        return
    
    fecha_corte = ultimo_corte.fecha_corte
    mes_corte = fecha_corte.month
    anio_corte = fecha_corte.year
    
    # Calcular el mes anterior (los usuarios que deberían estar en este corte)
    mes_anterior = mes_corte - 1 if mes_corte > 1 else 12
    anio_anterior = anio_corte if mes_corte > 1 else anio_corte - 1
    
    # Obtener usuarios pendientes del mes anterior
    usuarios_pendientes = NuevoUsuario.objects.filter(
        periodo_mes=mes_anterior,
        periodo_anio=anio_anterior,
        estado='PENDIENTE'
    )
    
    # Contador de validaciones
    validados = 0
    no_validados = 0
    fallecidos = 0
    
    # Validar cada usuario contra el corte
    for usuario in usuarios_pendientes:
        run_usuario = normalize_run(usuario.run)
        
        # Buscar el RUN en el corte de este mes
        try:
            registro_corte = CorteFonasa.objects.get(
                run=run_usuario,
                fecha_corte=fecha_corte
            )
			
            # Usar la nueva lógica de validación
            motivo_normalizado = (registro_corte.motivo_normalizado or '').upper()
            
            # Primero verificar si está fallecido (prioridad máxima)
            if 'FALLECIDO' in motivo_normalizado:
                usuario.estado = 'FALLECIDO'
                fallecidos += 1
            # Luego usar la función de validación que revisa aceptadoRechazado primero
            elif not _is_validated_corte(registro_corte.aceptado_rechazado, registro_corte.motivo):
                usuario.estado = 'NO_VALIDADO'
                no_validados += 1
            else:
                usuario.estado = 'VALIDADO'
                validados += 1
			
            usuario.save()
			
        except CorteFonasa.DoesNotExist:
            # Si no está en el corte, permanece pendiente
            pass
    
    # Crear o actualizar registro de validación si hubo cambios
    if validados > 0 or no_validados > 0 or fallecidos > 0:
        ValidacionCorte.objects.update_or_create(
            periodo_mes=mes_anterior,
            periodo_anio=anio_anterior,
            fecha_corte=fecha_corte,
            defaults={
                'total_usuarios': usuarios_pendientes.count(),
                'usuarios_validados': validados,
                'usuarios_no_validados': no_validados + fallecidos,
                'usuarios_pendientes': usuarios_pendientes.filter(estado='PENDIENTE').count(),
                'procesado_el': timezone.now(),
            }
        )


@api_view(["GET", "POST", "DELETE"])
def upload_corte_fonasa(request):
    if request.method == "DELETE":
        is_valid, error_response = _check_admin_password(request)
        if not is_valid:
            return error_response

        month_filter = _parse_month(request.query_params.get("month"))
        queryset = CorteFonasa.objects.all()
        if month_filter:
            year, month = month_filter
            queryset = queryset.filter(fecha_corte__year=year, fecha_corte__month=month)

        deleted_count, _ = queryset.delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)

    if request.method == "GET":
        month_filter = _parse_month(request.query_params.get("month"))
        search_term = _safe_str(request.query_params.get("search"))
        centro = _safe_str(request.query_params.get("centro"))
        # Soporte para múltiples centros separados por coma
        centros = request.query_params.get("centros")
        # Nuevo parámetro para filtrar solo validados o no validados
        validated_only = request.query_params.get("validated_only", "").lower() in {"1", "true", "yes"}
        non_validated_only = request.query_params.get("non_validated_only", "").lower() in {"1", "true", "yes"}

        queryset = CorteFonasa.objects.all()
        if month_filter:
            year, month = month_filter
            queryset = queryset.filter(fecha_corte__year=year, fecha_corte__month=month)
        if search_term:
            queryset = queryset.filter(
                Q(run__icontains=search_term)
                | Q(nombres__icontains=search_term)
                | Q(ap_paterno__icontains=search_term)
                | Q(ap_materno__icontains=search_term)
            )
        # Filtro opcional por centro (nombre del centro en el corte FONASA)
        if centro:
            queryset = queryset.filter(Q(nombre_centro__icontains=centro))
        # Filtro por múltiples centros
        elif centros:
            centros_list = [c.strip() for c in centros.split(",") if c.strip()]
            if centros_list:
                queryset = queryset.filter(nombre_centro__in=centros_list)

        # Calcular estadísticas con la nueva lógica
        total_count = queryset.count()
        
        # Filtro mejorado basado en los 3 valores posibles:
        # NO VALIDADOS: 
        #   - aceptadoRechazado = "RECHAZADO"
        #   - aceptadoRechazado = "INGRESO RECHAZO SIMULTÁNEO" (contiene "RECHAZO")
        #   - O motivo en NON_VALIDATED_MOTIVOS
        #   - O motivo contiene "FALLECIDO"
        non_validated_filter = (
            Q(aceptado_rechazado__icontains="RECHAZADO") | 
            Q(aceptado_rechazado__icontains="RECHAZO") |
            Q(motivo_normalizado__in=NON_VALIDATED_MOTIVOS) |
            Q(motivo_normalizado__icontains="FALLECIDO")
        )
        
        # VALIDADOS: aceptadoRechazado = "ACEPTADO" Y NO está en los rechazados
        validated_filter = (
            Q(aceptado_rechazado__iexact="ACEPTADO") & 
            ~non_validated_filter
        )

        # Aplicar filtro de validados/no validados si se solicita
        if validated_only:
            queryset = queryset.filter(validated_filter)
        elif non_validated_only:
            queryset = queryset.filter(non_validated_filter)

        validated_count = queryset.filter(validated_filter).count()
        non_validated_count = queryset.filter(non_validated_filter).count()

        all_param = request.query_params.get("all", "").lower()
        include_all = all_param in {"1", "true", "yes"}

        try:
            offset = max(int(request.query_params.get("offset", "0")), 0)
        except ValueError:
            offset = 0

        # Determinar si solo queremos el summary sin datos
        summary_only = request.query_params.get("summary_only", "").lower() in {"1", "true", "yes"}

        limit_value: int
        if include_all:
            limit_value = 0
        else:
            limit_param = request.query_params.get("limit")
            try:
                parsed_limit = int(limit_param) if limit_param is not None else 500
            except (TypeError, ValueError):
                parsed_limit = 500
            limit_value = max(parsed_limit, 0)

        # OPTIMIZACIÓN: Cache para usuarios validados cuando se pide all=true
        cache_key = None
        use_cache = validated_only and include_all and not month_filter and not search_term and not centro and not centros
        
        if use_cache:
            # Generar cache key basado en última actualización
            last_update = CorteFonasa.objects.filter(validated_filter).aggregate(
                max_fecha=Max('fecha_corte')
            )['max_fecha']
            
            if last_update:
                cache_key = f"validated_users_all_{last_update.strftime('%Y%m%d')}_v2"
                cached_response = cache.get(cache_key)
                
                if cached_response:
                    print(f"✅ Cache HIT para usuarios validados: {cache_key}")
                    return Response(cached_response)
                else:
                    print(f"⚠️ Cache MISS para usuarios validados: {cache_key}")

        # Si solo queremos el summary, no traemos rows
        if summary_only:
            rows = []
        else:
            ordered_queryset = queryset.order_by("-fecha_corte", "run")
            if limit_value == 0:
                data_queryset = ordered_queryset[offset:]
            else:
                data_queryset = ordered_queryset[offset : offset + limit_value]

            rows = [_build_corte_payload(instance) for instance in data_queryset]

        grouped = (
            queryset.values("fecha_corte__year", "fecha_corte__month")
            .annotate(
                total=Count("id"),
                validated=Count("id", filter=validated_filter),
                non_validated=Count("id", filter=non_validated_filter),
            )
            .order_by("-fecha_corte__year", "-fecha_corte__month")
        )

        summary = [
            {
                "month": _format_month_key(item["fecha_corte__year"], item["fecha_corte__month"]),
                "label": _format_month_label(item["fecha_corte__year"], item["fecha_corte__month"]),
                "total": item["total"],
                "validated": item["validated"],
                "nonValidated": item["non_validated"],
            }
            for item in grouped
        ]

        # Si hay filtro de centros, también devolver datos agrupados por centro
        by_centro = []
        if centros:
            centros_list = [c.strip() for c in centros.split(",") if c.strip()]
            if centros_list:
                # Agrupar por centro y mes
                grouped_by_centro = (
                    queryset.filter(nombre_centro__in=centros_list)
                    .values("nombre_centro", "fecha_corte__year", "fecha_corte__month")
                    .annotate(
                        total=Count("id"),
                        validated=Count("id", filter=validated_filter),
                        non_validated=Count("id", filter=non_validated_filter),
                    )
                    .order_by("nombre_centro", "-fecha_corte__year", "-fecha_corte__month")
                )
                
                # Organizar por centro
                centros_data = {}
                for item in grouped_by_centro:
                    centro_name = item["nombre_centro"]
                    if centro_name not in centros_data:
                        centros_data[centro_name] = []
                    
                    centros_data[centro_name].append({
                        "month": _format_month_key(item["fecha_corte__year"], item["fecha_corte__month"]),
                        "label": _format_month_label(item["fecha_corte__year"], item["fecha_corte__month"]),
                        "total": item["total"],
                        "validated": item["validated"],
                        "nonValidated": item["non_validated"],
                    })
                
                by_centro = [
                    {
                        "centro": centro,
                        "data": data
                    }
                    for centro, data in centros_data.items()
                ]

        response_data = {
            "columns": CORTE_COLUMNS,
            "rows": rows,
            "total": total_count,
            "validated": validated_count,
            "non_validated": non_validated_count,
            "summary": summary,
            "by_centro": by_centro,  # Nuevo campo con datos por centro
        }

        # Guardar en cache si aplica
        if use_cache and cache_key and rows:
            # Cache por 10 minutos (600 segundos)
            cache.set(cache_key, response_data, timeout=600)
            print(f"💾 Datos guardados en cache: {cache_key} ({len(rows)} registros)")

        return Response(response_data)

    records = request.data.get("records")
    if not isinstance(records, list) or not records:
        return Response(
            {"detail": "'records' debe ser una lista con datos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = CorteFonasaRecordSerializer(data=records, many=True)
    serializer.is_valid(raise_exception=True)

    created = 0
    skipped: List[Dict[str, str]] = []

    replace_mode = request.query_params.get("replace", "").lower() in {"1", "true", "yes"}

    prepared_records: List[Tuple[Dict[str, str], date | None]] = []
    months_to_replace: set[Tuple[int, int]] = set()

    for record in serializer.validated_data:
        fecha_corte = _parse_date(record.get("fehcaCorte"))
        prepared_records.append((record, fecha_corte))
        if replace_mode and fecha_corte:
            months_to_replace.add((fecha_corte.year, fecha_corte.month))

    prepared_records.sort(key=lambda item: _motivo_priority(item[0].get("motivo")))

    with transaction.atomic():
        if replace_mode and months_to_replace:
            for year, month in months_to_replace:
                CorteFonasa.objects.filter(
                    fecha_corte__year=year, fecha_corte__month=month
                ).delete()

        for index, (record, fecha_corte) in enumerate(prepared_records):
            run_clean = normalize_run(record.get("run"))

            if not run_clean or not fecha_corte:
                skipped.append({"index": index, "motivo": "RUN o fecha de corte inválidos"})
                continue

            motivo_value = _safe_str(record.get("motivo"))

            defaults = {
                "nombres": _safe_str(record.get("nombres")),
                "ap_paterno": _safe_str(record.get("apPaterno")),
                "ap_materno": _safe_str(record.get("apMaterno")),
                "fecha_nacimiento": _parse_date(record.get("fechaNacimiento")),
                "genero": _safe_str(record.get("genero")),
                "tramo": _safe_str(record.get("tramo")),
                "nombre_centro": _safe_str(record.get("nombreCentro")),
                "centro_de_procedencia": _safe_str(record.get("centroDeProcedencia")),
                "comuna_de_procedencia": _safe_str(record.get("comunaDeProcedencia")),
                "nombre_centro_actual": _safe_str(record.get("nombreCentroActual")),
                "centro_actual": _safe_str(record.get("centroActual")),
                "comuna_actual": _safe_str(record.get("comunaActual")),
                "aceptado_rechazado": _safe_str(record.get("aceptadoRechazado"), max_length=255),
                "motivo": motivo_value,
                "motivo_normalizado": normalize_motivo(motivo_value),
            }

            # Crear el registro directamente (permite duplicados de RUN en el mismo mes)
            CorteFonasa.objects.create(
                run=run_clean,
                fecha_corte=fecha_corte,
                **defaults,
            )
            created += 1

        # Validación automática de nuevos usuarios cuando se sube un corte
        if months_to_replace or created > 0:
            _validar_nuevos_usuarios_con_corte()

    # Calcular estadísticas usando la nueva lógica de validación
    total_records = CorteFonasa.objects.count()
    total_validated = 0
    total_non_validated = 0
    
    for corte in CorteFonasa.objects.all().iterator():
        if _is_validated_corte(corte.aceptado_rechazado, corte.motivo):
            total_validated += 1
        else:
            total_non_validated += 1

    return Response(
        {
            "created": created,
            "invalid": len(skipped),
            "invalid_rows": skipped[:20],
            "total": total_records,
            "validated": total_validated,
            "non_validated": total_non_validated,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST", "DELETE"])
def upload_hp_trakcare(request):
    if request.method == "DELETE":
        is_valid, error_response = _check_admin_password(request)
        if not is_valid:
            return error_response

        month_filter = _parse_month(request.query_params.get("month"))
        queryset = HpTrakcare.objects.all()
        if month_filter:
            year, month = month_filter
            queryset = queryset.filter(
                fecha_incorporacion__year=year, fecha_incorporacion__month=month
            )

        deleted_count, _ = queryset.delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)

    if request.method == "GET":
        month_filter = _parse_month(request.query_params.get("month"))
        search_term = _safe_str(request.query_params.get("search"))

        queryset = HpTrakcare.objects.all()
        if month_filter:
            year, month = month_filter
            queryset = queryset.filter(
                fecha_incorporacion__year=year, fecha_incorporacion__month=month
            )
        if search_term:
            queryset = queryset.filter(
                Q(run__icontains=search_term)
                | Q(nombre__icontains=search_term)
                | Q(ap_paterno__icontains=search_term)
                | Q(ap_materno__icontains=search_term)
                | Q(cod_registro__icontains=search_term)
            )

        total_count = queryset.count()

        all_param = request.query_params.get("all", "").lower()
        include_all = all_param in {"1", "true", "yes"}

        try:
            offset = max(int(request.query_params.get("offset", "0")), 0)
        except ValueError:
            offset = 0

        if include_all:
            limit_value = 0
        else:
            limit_param = request.query_params.get("limit")
            try:
                parsed_limit = int(limit_param) if limit_param is not None else 500
            except (TypeError, ValueError):
                parsed_limit = 500
            limit_value = max(parsed_limit, 0)

        ordered_queryset = queryset.order_by("run", "nombre")
        if limit_value == 0:
            data_queryset = ordered_queryset[offset:]
        else:
            data_queryset = ordered_queryset[offset : offset + limit_value]

        rows = [_build_trakcare_payload(instance) for instance in data_queryset]

        grouped = (
            queryset.values("fecha_incorporacion__year", "fecha_incorporacion__month")
            .annotate(total=Count("id"))
            .order_by("-fecha_incorporacion__year", "-fecha_incorporacion__month")
        )

        summary = [
            {
                "month": _format_month_key(item["fecha_incorporacion__year"], item["fecha_incorporacion__month"]),
                "label": _format_month_label(item["fecha_incorporacion__year"], item["fecha_incorporacion__month"]),
                "total": item["total"],
            }
            for item in grouped
            if item["fecha_incorporacion__year"] and item["fecha_incorporacion__month"]
        ]

        return Response(
            {
                "columns": TRAKCARE_COLUMNS,
                "rows": rows,
                "total": total_count,
                "summary": summary,
            }
        )

    records = request.data.get("records")
    if not isinstance(records, list) or not records:
        return Response(
            {"detail": "'records' debe ser una lista con datos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = HpTrakcareRecordSerializer(data=records, many=True)
    serializer.is_valid(raise_exception=True)

    created = 0
    updated = 0
    skipped: List[Dict[str, str]] = []

    replace_mode = request.query_params.get("replace", "").lower() in {"1", "true", "yes"}

    with transaction.atomic():
        if replace_mode:
            HpTrakcare.objects.all().delete()

        for index, record in enumerate(serializer.validated_data):
            run_clean = normalize_run(record.get("RUN") or record.get("run"))
            if not run_clean:
                skipped.append({"index": index, "motivo": "RUN inválido"})
                continue

            cod_registro_raw = _safe_str(record.get("codRegistro"))
            if not cod_registro_raw:
                cod_registro_raw = _safe_str(record.get("idTrakcare"))
            if not cod_registro_raw:
                cod_registro_raw = f"{run_clean}-{index}"

            defaults = {
                "cod_familia": _safe_str(record.get("codFamilia")),
                "relacion_parentezco": _safe_str(record.get("relacionParentezco")),
                "id_trakcare": _safe_str(record.get("idTrakcare")),
                "etnia": _safe_str(record.get("etnia")),
                "nacionalidad": _safe_str(record.get("nacionalidad")),
                "ap_paterno": _safe_str(record.get("apPaterno")),
                "ap_materno": _safe_str(record.get("apMaterno")),
                "nombre": _safe_str(record.get("nombre")),
                "genero": _safe_str(record.get("genero")),
                "fecha_nacimiento": _parse_date(record.get("fechaNacimiento")),
                "edad": _parse_int(record.get("edad")),
                "direccion": _safe_str(record.get("direccion")),
                "telefono": _safe_str(record.get("telefono")),
                "telefono_celular": _safe_str(record.get("telefonoCelular")),
                "telefono_recado": _safe_str(record.get("TelefonoRecado")),
                "servicio_salud": _safe_str(record.get("servicioSalud")),
                "centro_inscripcion": _safe_str(record.get("centroInscripcion")),
                "sector": _safe_str(record.get("sector")),
                "prevision": _safe_str(record.get("prevision")),
                "plan_trakcare": _safe_str(record.get("planTrakcare")),
                "prais_trakcare": _safe_str(record.get("praisTrakcare")),
                "fecha_incorporacion": _parse_date(record.get("fechaIncorporacion")),
                "fecha_ultima_modif": _parse_date(record.get("fechaUltimaModif")),
                "fecha_defuncion": _parse_date(record.get("fechaDefuncion")),
            }

            _, created_flag = HpTrakcare.objects.update_or_create(
                run=run_clean,
                cod_registro=cod_registro_raw,
                defaults={
                    **defaults,
                    "cod_registro": cod_registro_raw,
                },
            )

            if created_flag:
                created += 1
            else:
                updated += 1

    total_records = HpTrakcare.objects.count()

    return Response(
        {
            "created": created,
            "updated": updated,
            "invalid": len(skipped),
            "invalid_rows": skipped[:20],
            "total": total_records,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "PATCH", "DELETE"])
def corte_fonasa_detail(request, pk: int):
    try:
        instance = CorteFonasa.objects.get(pk=pk)
    except CorteFonasa.DoesNotExist:
        return Response({"detail": "Registro no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "GET":
        return Response(_build_corte_payload(instance))

    serializer = CorteFonasaDetailSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    instance.refresh_from_db()
    return Response(_build_corte_payload(instance), status=status.HTTP_200_OK)


@api_view(["GET"])
def corte_fonasa_historial_mensual(request):
    """
    Obtiene el historial mensual de apariciones de un usuario en los cortes FONASA.
    
    Parámetros:
    - run: RUN del usuario (requerido)
    
    Retorna un array de objetos con la información de cada mes donde el usuario apareció.
    """
    run_param = request.query_params.get("run")
    
    if not run_param:
        return Response(
            {"detail": "Parámetro 'run' es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Normalizar el RUN
    run_normalizado = normalize_run(run_param)
    
    # Obtener todos los registros del usuario en los cortes FONASA, ordenados por fecha descendente
    cortes_usuario = CorteFonasa.objects.filter(run=run_normalizado).order_by('-fecha_corte')
    
    if not cortes_usuario.exists():
        return Response([], status=status.HTTP_200_OK)
    
    # Generar historial
    historial = []
    meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    
    # Agrupar por mes/año para evitar duplicados
    registros_por_periodo = {}
    for corte in cortes_usuario:
        periodo_key = f"{corte.fecha_corte.year}-{corte.fecha_corte.month:02d}"
        if periodo_key not in registros_por_periodo:
            registros_por_periodo[periodo_key] = corte
    
    # Procesar cada periodo único
    for periodo_key in sorted(registros_por_periodo.keys(), reverse=True):
        corte = registros_por_periodo[periodo_key]
        year = corte.fecha_corte.year
        month = corte.fecha_corte.month
        mes_str = f"{meses[month - 1]} {year}"
        
        # Determinar estado basado en motivo
        motivo_rechazado = corte.motivo_normalizado in NON_VALIDATED_MOTIVOS if corte.motivo_normalizado else False
        
        if motivo_rechazado:
            estado = "RECHAZADO"
        else:
            estado = "VALIDADO"
        
        historial.append({
            "mes": month,
            "anio": year,
            "mesStr": mes_str,
            "estado": estado,
            "tipoRegistro": "corte",
            "nombreCompleto": corte.nombre_completo,
            "tramo": corte.tramo,
            "genero": corte.genero,
            "motivo": corte.motivo,
            "fechaCorte": corte.fecha_corte.isoformat(),
            "centroDeProcedencia": corte.centro_de_procedencia or None,
            "centroActual": corte.centro_actual or None,
            "aceptadoRechazado": corte.aceptado_rechazado or None,
        })
    
    return Response(historial, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def hp_trakcare_detail(request, pk: int):
    try:
        instance = HpTrakcare.objects.get(pk=pk)
    except HpTrakcare.DoesNotExist:
        return Response({"detail": "Registro no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "GET":
        return Response(_build_trakcare_payload(instance))

    serializer = HpTrakcareDetailSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    instance.refresh_from_db()
    return Response(_build_trakcare_payload(instance), status=status.HTTP_200_OK)


@api_view(["GET"])
def hp_trakcare_buscar(request):
    """Busca un registro de HP Trakcare por RUN"""
    run = request.query_params.get('run', '').strip()
    
    if not run:
        return Response(
            {"detail": "El parámetro 'run' es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Normalizar el RUN
    from .models import normalize_run
    run_normalizado = normalize_run(run)
    
    try:
        instance = HpTrakcare.objects.filter(run=run_normalizado).first()

        if not instance:
            return Response(
                {"detail": "No se encontró registro en HP Trakcare para este RUN"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(_build_trakcare_payload(instance))

    except Exception as e:
        return Response(
            {"detail": f"Error al buscar registro: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# NUEVOS USUARIOS - Gestión de usuarios que llegan antes del corte
# ============================================================================

@api_view(["GET", "POST"])
def nuevos_usuarios_list(request):
    """
    GET: Lista usuarios nuevos con filtros por periodo y estado
    POST: Registra un nuevo usuario
    """
    if request.method == "POST":
        serializer = NuevoUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # GET - Listar con filtros
    queryset = NuevoUsuario.objects.all()
    
    # Filtro por periodo
    periodo_mes = request.query_params.get("periodoMes")
    periodo_anio = request.query_params.get("periodoAnio")
    
    if periodo_mes and periodo_anio:
        try:
            queryset = queryset.filter(
                periodo_mes=int(periodo_mes),
                periodo_anio=int(periodo_anio)
            )
        except ValueError:
            pass
    
    # Filtro por estado
    estado = request.query_params.get("estado")
    if estado:
        queryset = queryset.filter(estado=estado.upper())
    
    # Búsqueda por RUN o nombre
    search_term = request.query_params.get("search")
    if search_term:
        queryset = queryset.filter(
            Q(run__icontains=search_term) |
            Q(nombre_completo__icontains=search_term)
        )
    
    # Estadísticas
    total = queryset.count()
    pendientes = queryset.filter(estado="PENDIENTE").count()
    validados = queryset.filter(estado="VALIDADO").count()
    no_validados = queryset.filter(estado="NO_VALIDADO").count()
    fallecidos = queryset.filter(estado="FALLECIDO").count()
    
    # Serializar resultados
    serializer = NuevoUsuarioSerializer(queryset, many=True)
    
    return Response({
        "usuarios": serializer.data,
        "estadisticas": {
            "total": total,
            "pendientes": pendientes,
            "validados": validados,
            "noValidados": no_validados,
            "fallecidos": fallecidos,
        }
    }, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def nuevo_usuario_detail(request, pk: int):
    """
    GET: Obtiene detalle de un usuario
    PATCH: Actualiza un usuario
    DELETE: Elimina un usuario
    """
    try:
        usuario = NuevoUsuario.objects.get(pk=pk)
    except NuevoUsuario.DoesNotExist:
        return Response(
            {"detail": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "DELETE":
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = NuevoUsuarioSerializer(usuario)
        return Response(serializer.data)
    
    # PATCH
    serializer = NuevoUsuarioSerializer(usuario, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def marcar_usuario_revisado(request, pk: int):
    """
    Marca un usuario como revisado con información de revisión
    """
    try:
        usuario = NuevoUsuario.objects.get(pk=pk)
    except NuevoUsuario.DoesNotExist:
        return Response(
            {"detail": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Obtener datos de la request
    revisado_manualmente = request.data.get('revisadoManualmente', False)
    observaciones_trakcare = request.data.get('observacionesTrakcare', '')
    checklist_trakcare = request.data.get('checklistTrakcare', {})
    revisado_por = request.data.get('revisadoPor', request.user.username if request.user.is_authenticated else 'Sistema')
    
    # Actualizar campos de revisión
    usuario.revisado = True
    usuario.revisado_manualmente = revisado_manualmente
    usuario.revisado_por = revisado_por
    usuario.revisado_el = timezone.now()
    usuario.observaciones_trakcare = observaciones_trakcare
    usuario.checklist_trakcare = checklist_trakcare
    usuario.save()
    
    # Retornar el usuario actualizado
    serializer = NuevoUsuarioSerializer(usuario)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def nuevos_usuarios_estadisticas(request):
    """
    Obtiene estadísticas generales de nuevos usuarios
    """
    # Estadísticas del mes actual
    now = timezone.now()
    mes_actual = now.month
    anio_actual = now.year
    
    usuarios_mes_actual = NuevoUsuario.objects.filter(
        periodo_mes=mes_actual,
        periodo_anio=anio_actual
    ).count()
    
    # Estadísticas globales
    total_usuarios = NuevoUsuario.objects.count()
    total_pendientes = NuevoUsuario.objects.filter(estado="PENDIENTE").count()
    total_validados = NuevoUsuario.objects.filter(estado="VALIDADO").count()
    total_no_validados = NuevoUsuario.objects.filter(estado="NO_VALIDADO").count()
    total_fallecidos = NuevoUsuario.objects.filter(estado="FALLECIDO").count()
    
    # Últimos 6 meses
    meses_data = []
    for i in range(5, -1, -1):
        mes = mes_actual - i
        anio = anio_actual
        
        if mes <= 0:
            mes += 12
            anio -= 1
        
        count = NuevoUsuario.objects.filter(
            periodo_mes=mes,
            periodo_anio=anio
        ).count()
        
        meses_data.append({
            "mes": mes,
            "anio": anio,
            "periodo": _format_month_label(anio, mes),
            "total": count
        })
    
    return Response({
        "mesActual": {
            "mes": mes_actual,
            "anio": anio_actual,
            "periodo": _format_month_label(anio_actual, mes_actual),
            "total": usuarios_mes_actual
        },
        "totales": {
            "total": total_usuarios,
            "pendientes": total_pendientes,
            "validados": total_validados,
            "noValidados": total_no_validados,
            "fallecidos": total_fallecidos
        },
        "historicoMeses": meses_data
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
def nuevos_usuarios_historial(request):
    """
    Obtiene el historial mensual de un usuario basado SOLO en los cortes subidos.

    Estados posibles:
    - VALIDADO (Verde): Usuario aparece en corte FONASA con motivo válido (mantiene inscripción)
    - RECHAZADO (Rojo): Usuario aparece en corte FONASA pero con motivo de rechazo
    - INSCRIPCION (Azul): Usuario nuevo inscrito pero no aparece en el corte
    - AUSENTE (Gris): Usuario no aparece en el corte ni está inscrito

    Solo muestra meses donde hay cortes FONASA subidos en el sistema.
    """
    run_param = request.query_params.get("run")

    if not run_param:
        return Response(
            {"detail": "Parámetro 'run' es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Normalizar el RUN
    run_normalizado = normalize_run(run_param)

    # Obtener todas las fechas de cortes disponibles en el sistema (únicas por mes/año)
    cortes_disponibles = CorteFonasa.objects.values('fecha_corte').distinct().order_by('-fecha_corte')

    if not cortes_disponibles.exists():
        return Response([], status=status.HTTP_200_OK)

    # Crear conjunto de periodos únicos (año-mes) de cortes disponibles
    periodos_cortes = set()
    for corte in cortes_disponibles:
        fecha = corte['fecha_corte']
        key = f"{fecha.year}-{fecha.month:02d}"
        periodos_cortes.add(key)

    # Obtener todos los registros de NuevoUsuario del usuario
    nuevos_usuarios_dict = {}
    nuevos_usuarios = NuevoUsuario.objects.filter(run=run_normalizado)
    for registro in nuevos_usuarios:
        key = f"{registro.periodo_anio}-{registro.periodo_mes:02d}"
        nuevos_usuarios_dict[key] = registro

    # Obtener todos los cortes FONASA del usuario
    cortes_usuario_dict = {}
    cortes_usuario = CorteFonasa.objects.filter(run=run_normalizado)
    for corte in cortes_usuario:
        key = f"{corte.fecha_corte.year}-{corte.fecha_corte.month:02d}"
        cortes_usuario_dict[key] = corte

    # Generar historial solo para meses donde hay cortes disponibles
    historial = []
    meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    # Procesar cada periodo de corte disponible
    for periodo_key in sorted(periodos_cortes, reverse=True):
        year, month = periodo_key.split('-')
        anio = int(year)
        mes = int(month)
        mes_str = f"{meses[mes - 1]} {anio}"

        # Verificar si el usuario tiene un NuevoUsuario para este periodo
        nuevo_usuario = nuevos_usuarios_dict.get(periodo_key)

        # Verificar si el usuario aparece en el corte FONASA de este periodo
        corte_fonasa = cortes_usuario_dict.get(periodo_key)

        if corte_fonasa:
            # El usuario aparece en el corte FONASA
            # Verificar si el motivo es de rechazo
            motivo_rechazado = corte_fonasa.motivo_normalizado in NON_VALIDATED_MOTIVOS

            if motivo_rechazado:
                # RECHAZADO - aparece en corte pero con motivo de rechazo
                estado = "RECHAZADO"
            else:
                # VALIDADO - aparece en corte con inscripción válida
                estado = "VALIDADO"

            historial.append({
                "mes": mes,
                "anio": anio,
                "mesStr": mes_str,
                "estado": estado,
                "tipoRegistro": "corte",
                "centro": corte_fonasa.nombre_centro or (corte_fonasa.centro_salud.nombre if corte_fonasa.centro_salud else None),
                "nombreCompleto": corte_fonasa.nombre_completo,
                "tramo": corte_fonasa.tramo,
                "genero": corte_fonasa.genero,
                "motivo": corte_fonasa.motivo,
                "fechaCorte": corte_fonasa.fecha_corte.isoformat(),
                "validadoManualmente": nuevo_usuario.estado == "VALIDADO" if nuevo_usuario else False,
                # Nuevos campos de procedencia y destino
                "centroDeProcedencia": corte_fonasa.centro_de_procedencia or None,
                "comunaDeProcedencia": corte_fonasa.comuna_de_procedencia or None,
                "centroActual": corte_fonasa.centro_actual or None,
                "comunaActual": corte_fonasa.comuna_actual or None,
                "aceptadoRechazado": corte_fonasa.aceptado_rechazado or None,
            })
        elif nuevo_usuario:
            # El usuario NO aparece en el corte pero está inscrito como NuevoUsuario
            # INSCRIPCION (nuevo usuario esperando validación)
            historial.append({
                "mes": mes,
                "anio": anio,
                "mesStr": mes_str,
                "estado": "INSCRIPCION",
                "tipoRegistro": "nuevo_usuario",
                "centro": nuevo_usuario.centro,
                "establecimiento": nuevo_usuario.establecimiento.nombre if nuevo_usuario.establecimiento else None,
                "sector": nuevo_usuario.sector.nombre if nuevo_usuario.sector else None,
                "codigoPercapita": nuevo_usuario.codigo_percapita,
                "fechaInscripcion": nuevo_usuario.fecha_inscripcion.isoformat() if nuevo_usuario.fecha_inscripcion else None,
                "observaciones": nuevo_usuario.observaciones,
                "estadoValidacion": nuevo_usuario.estado,
            })
        else:
            # El usuario NO aparece en el corte NI está inscrito
            # AUSENTE
            historial.append({
                "mes": mes,
                "anio": anio,
                "mesStr": mes_str,
                "estado": "AUSENTE",
                "tipoRegistro": None,
            })

    return Response(historial, status=status.HTTP_200_OK)


@api_view(["GET"])
def exportar_nuevos_usuarios(request):
    """
    Exporta los nuevos usuarios a formato JSON
    Permite filtros por periodo y estado
    """
    queryset = NuevoUsuario.objects.all()
    
    # Filtros opcionales
    periodo_mes = request.query_params.get("periodoMes")
    periodo_anio = request.query_params.get("periodoAnio")
    estado = request.query_params.get("estado")
    
    if periodo_mes:
        queryset = queryset.filter(periodo_mes=periodo_mes)
    if periodo_anio:
        queryset = queryset.filter(periodo_anio=periodo_anio)
    if estado:
        queryset = queryset.filter(estado=estado)
    
    serializer = NuevoUsuarioSerializer(queryset, many=True)
    
    return Response({
        "count": queryset.count(),
        "usuarios": serializer.data
    }, status=status.HTTP_200_OK)


@api_view(["GET", "POST", "DELETE"])
def upload_nuevos_usuarios(request):
    """
    Endpoint para carga masiva de nuevos usuarios desde CSV.
    
    POST: Procesa una lista de registros de nuevos usuarios
    - records: lista de objetos con estructura del CSV
    - replace: si es true, elimina registros del periodo antes de insertar
    
    GET: Retorna lista de registros existentes (con filtros opcionales)
    
    DELETE: Elimina registros de un periodo específico
    """
    if request.method == "DELETE":
        is_valid, error_response = _check_admin_password(request)
        if not is_valid:
            return error_response

        periodo_mes = request.query_params.get("periodoMes")
        periodo_anio = request.query_params.get("periodoAnio")
        
        queryset = NuevoUsuario.objects.all()
        if periodo_mes and periodo_anio:
            try:
                queryset = queryset.filter(
                    periodo_mes=int(periodo_mes),
                    periodo_anio=int(periodo_anio)
                )
            except ValueError:
                return Response(
                    {"detail": "Periodo inválido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        deleted_count, _ = queryset.delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)

    if request.method == "GET":
        # Retornar lista de registros con filtros opcionales
        periodo_mes = request.query_params.get("periodoMes")
        periodo_anio = request.query_params.get("periodoAnio")
        search_term = _safe_str(request.query_params.get("search"))
        
        queryset = NuevoUsuario.objects.all()
        
        if periodo_mes and periodo_anio:
            try:
                queryset = queryset.filter(
                    periodo_mes=int(periodo_mes),
                    periodo_anio=int(periodo_anio)
                )
            except ValueError:
                pass
        
        if search_term:
            queryset = queryset.filter(
                Q(run__icontains=search_term) |
                Q(nombre_completo__icontains=search_term)
            )
        
        total_count = queryset.count()
        serializer = NuevoUsuarioSerializer(queryset, many=True)
        
        return Response({
            "total": total_count,
            "usuarios": serializer.data
        }, status=status.HTTP_200_OK)

    # POST - Carga masiva
    records = request.data.get("records")
    if not isinstance(records, list) or not records:
        return Response(
            {"detail": "'records' debe ser una lista con datos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = NuevoUsuarioRecordSerializer(data=records, many=True)
    serializer.is_valid(raise_exception=True)

    created = 0
    updated = 0
    skipped: List[Dict[str, str]] = []
    
    replace_mode = request.query_params.get("replace", "").lower() in {"1", "true", "yes"}
    
    # Preparar registros y detectar periodos a reemplazar
    prepared_records: List[Dict[str, str]] = []
    periods_to_replace: set[Tuple[int, int]] = set()
    
    for record in serializer.validated_data:
        fecha_inscripcion = _parse_date(record.get("fecha"))
        if fecha_inscripcion and replace_mode:
            periods_to_replace.add((fecha_inscripcion.year, fecha_inscripcion.month))
        prepared_records.append(record)
    
    with transaction.atomic():
        # Si está en modo replace, eliminar registros del periodo
        if replace_mode and periods_to_replace:
            for year, month in periods_to_replace:
                NuevoUsuario.objects.filter(
                    periodo_anio=year,
                    periodo_mes=month
                ).delete()
        
        for index, record in enumerate(prepared_records):
            run_clean = normalize_run(record.get("run"))
            fecha_inscripcion = _parse_date(record.get("fecha"))
            
            if not run_clean or not fecha_inscripcion:
                skipped.append({
                    "index": index,
                    "motivo": "RUN o fecha inválidos",
                    "run": record.get("run")
                })
                continue
            
            # Buscar catálogos por nombre o código
            nacionalidad_obj = None
            nacionalidad_str = _safe_str(record.get("nacionalidad"))
            if nacionalidad_str:
                try:
                    nacionalidad_obj = Nacionalidad.objects.filter(
                        Q(nombre__iexact=nacionalidad_str) | 
                        Q(codigo__iexact=nacionalidad_str)
                    ).first()
                except Exception:
                    pass
            
            etnia_obj = None
            etnia_str = _safe_str(record.get("etnia"))
            if etnia_str:
                try:
                    etnia_obj = Etnia.objects.filter(
                        Q(nombre__iexact=etnia_str) | 
                        Q(codigo__iexact=etnia_str)
                    ).first()
                except Exception:
                    pass
            
            sector_obj = None
            sector_str = _safe_str(record.get("sector"))
            if sector_str:
                try:
                    sector_obj = Sector.objects.filter(
                        Q(nombre__iexact=sector_str) | 
                        Q(codigo__iexact=sector_str)
                    ).first()
                except Exception:
                    pass
            
            subsector_obj = None
            subsector_str = _safe_str(record.get("subsector"))
            if subsector_str:
                try:
                    subsector_obj = Subsector.objects.filter(
                        Q(nombre__iexact=subsector_str) | 
                        Q(codigo__iexact=subsector_str)
                    ).first()
                except Exception:
                    pass
            
            # Crear/actualizar el registro
            defaults = {
                "nombres": _safe_str(record.get("nombres")),
                "apellido_paterno": _safe_str(record.get("apellidoPaterno")),
                "apellido_materno": _safe_str(record.get("apellidoMaterno")),
                "fecha_inscripcion": fecha_inscripcion,
                "periodo_mes": fecha_inscripcion.month,
                "periodo_anio": fecha_inscripcion.year,
                "nacionalidad": nacionalidad_obj,
                "etnia": etnia_obj,
                "sector": sector_obj,
                "subsector": subsector_obj,
                "codigo_percapita": _safe_str(record.get("codPercapita")),
                "codigo_sector": _safe_str(record.get("codigoSector")),
                "centro": _safe_str(record.get("centro")),
                "observaciones": _safe_str(record.get("observaciones")),
                "estado": _safe_str(record.get("estado")) or "PENDIENTE",
            }
            
            _, created_flag = NuevoUsuario.objects.update_or_create(
                run=run_clean,
                periodo_mes=fecha_inscripcion.month,
                periodo_anio=fecha_inscripcion.year,
                defaults=defaults,
            )
            
            if created_flag:
                created += 1
            else:
                updated += 1
    
    total_records = NuevoUsuario.objects.count()
    
    return Response(
        {
            "created": created,
            "updated": updated,
            "invalid": len(skipped),
            "invalid_rows": skipped[:20],
            "total": total_records,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def validar_contra_corte(request):
    """
    Compara los nuevos usuarios de un periodo con el corte de FONASA
    y actualiza el estado de validación.
    
    Espera:
    - periodoMes: mes del periodo a validar
    - periodoAnio: año del periodo a validar
    - fechaCorte: fecha del corte con el que comparar (formato YYYY-MM-DD)
    """
    periodo_mes = request.data.get("periodoMes")
    periodo_anio = request.data.get("periodoAnio")
    fecha_corte_str = request.data.get("fechaCorte")
    
    if not all([periodo_mes, periodo_anio, fecha_corte_str]):
        return Response(
            {"detail": "Faltan parámetros requeridos: periodoMes, periodoAnio, fechaCorte"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        periodo_mes = int(periodo_mes)
        periodo_anio = int(periodo_anio)
        fecha_corte = datetime.strptime(fecha_corte_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return Response(
            {"detail": "Formato de parámetros inválido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener usuarios del periodo
    usuarios = NuevoUsuario.objects.filter(
        periodo_mes=periodo_mes,
        periodo_anio=periodo_anio
    )
    
    if not usuarios.exists():
        return Response(
            {"detail": "No hay usuarios registrados para este periodo"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Crear o actualizar registro de validación
    with transaction.atomic():
        validacion, created = ValidacionCorte.objects.update_or_create(
            periodo_mes=periodo_mes,
            periodo_anio=periodo_anio,
            fecha_corte=fecha_corte,
            defaults={
                "procesado_por": request.data.get("procesadoPor", ""),
            }
        )
        
        # Comparar cada usuario con el corte
        validados = 0
        no_validados = 0
        pendientes = 0
        
        for usuario in usuarios:
            # Buscar el RUN en el corte de FONASA
            existe_en_corte = CorteFonasa.objects.filter(
                run=usuario.run,
                fecha_corte=fecha_corte
            ).exists()
            
            if existe_en_corte:
                # Verificar el motivo
                corte = CorteFonasa.objects.filter(
                    run=usuario.run,
                    fecha_corte=fecha_corte
                ).first()
                
                if corte:
                    if corte.motivo_normalizado in NON_VALIDATED_MOTIVOS:
                        usuario.estado = "NO_VALIDADO"
                        no_validados += 1
                    else:
                        usuario.estado = "VALIDADO"
                        validados += 1
                else:
                    usuario.estado = "NO_VALIDADO"
                    no_validados += 1
            else:
                # No está en el corte
                usuario.estado = "NO_VALIDADO"
                no_validados += 1
            
            usuario.validacion = validacion
            usuario.save()
        
        # Actualizar estadísticas de la validación
        validacion.total_usuarios = usuarios.count()
        validacion.usuarios_validados = validados
        validacion.usuarios_no_validados = no_validados
        validacion.usuarios_pendientes = usuarios.filter(estado="PENDIENTE").count()
        validacion.save()
    
    serializer = ValidacionCorteSerializer(validacion)
    
    return Response({
        "validacion": serializer.data,
        "mensaje": f"Validación completada. {validados} validados, {no_validados} no validados"
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
def validaciones_list(request):
    """
    Lista todas las validaciones realizadas
    """
    queryset = ValidacionCorte.objects.all()
    
    # Filtro por periodo
    periodo_mes = request.query_params.get("periodoMes")
    periodo_anio = request.query_params.get("periodoAnio")
    
    if periodo_mes and periodo_anio:
        try:
            queryset = queryset.filter(
                periodo_mes=int(periodo_mes),
                periodo_anio=int(periodo_anio)
            )
        except ValueError:
            pass
    
    serializer = ValidacionCorteSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def validacion_detail(request, pk: int):
    """
    Detalle de una validación específica
    """
    try:
        validacion = ValidacionCorte.objects.get(pk=pk)
    except ValidacionCorte.DoesNotExist:
        return Response(
            {"detail": "Validación no encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ValidacionCorteSerializer(validacion)
    
    # Incluir usuarios relacionados
    usuarios = NuevoUsuario.objects.filter(validacion=validacion)
    usuarios_serializer = NuevoUsuarioSerializer(usuarios, many=True)
    
    return Response({
        "validacion": serializer.data,
        "usuarios": usuarios_serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# CATÁLOGOS - Gestión de catálogos configurables
# ============================================================================
# ==================== ENDPOINTS DE CATÁLOGOS ====================

@api_view(["GET"])
def catalogos_all(request):
    """
    GET: Obtiene todos los catálogos organizados (activos e inactivos)
    """
    return Response({
        "etnias": EtniaSerializer(Etnia.objects.all().order_by("nombre"), many=True).data,
        "nacionalidades": NacionalidadSerializer(Nacionalidad.objects.all().order_by("nombre"), many=True).data,
        "sectores": SectorSerializer(Sector.objects.all().order_by("nombre"), many=True).data,
        "subsectores": SubsectorSerializer(Subsector.objects.all().order_by("nombre"), many=True).data,
        "establecimientos": EstablecimientoSerializer(Establecimiento.objects.all().order_by("nombre"), many=True).data,
    }, status=status.HTTP_200_OK)


# Etnias
@api_view(["GET", "POST"])
def etnias_list(request):
    """GET: Lista etnias | POST: Crea nueva etnia"""
    if request.method == "POST":
        serializer = EtniaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    queryset = Etnia.objects.all().order_by("nombre")
    serializer = EtniaSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def etnia_detail(request, pk: int):
    """GET: Detalle | PATCH: Actualiza/Activa/Desactiva | DELETE: Elimina permanentemente o desactiva"""
    try:
        etnia = Etnia.objects.get(pk=pk)
    except Etnia.DoesNotExist:
        return Response({"detail": "Etnia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "DELETE":
        # Si se especifica permanent=true, eliminar permanentemente
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            etnia.delete()
        else:
            etnia.activo = False
            etnia.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = EtniaSerializer(etnia)
        return Response(serializer.data)
    
    serializer = EtniaSerializer(etnia, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


# Nacionalidades
@api_view(["GET", "POST"])
def nacionalidades_list(request):
    """GET: Lista nacionalidades | POST: Crea nueva nacionalidad"""
    if request.method == "POST":
        serializer = NacionalidadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    queryset = Nacionalidad.objects.all().order_by("nombre")
    serializer = NacionalidadSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def nacionalidad_detail(request, pk: int):
    """GET: Detalle | PATCH: Actualiza/Activa/Desactiva | DELETE: Elimina permanentemente o desactiva"""
    try:
        nacionalidad = Nacionalidad.objects.get(pk=pk)
    except Nacionalidad.DoesNotExist:
        return Response({"detail": "Nacionalidad no encontrada"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "DELETE":
        # Si se especifica permanent=true, eliminar permanentemente
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            nacionalidad.delete()
        else:
            nacionalidad.activo = False
            nacionalidad.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = NacionalidadSerializer(nacionalidad)
        return Response(serializer.data)
    
    serializer = NacionalidadSerializer(nacionalidad, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


# Sectores
@api_view(["GET", "POST"])
def sectores_list(request):
    """GET: Lista sectores | POST: Crea nuevo sector"""
    if request.method == "POST":
        serializer = SectorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    queryset = Sector.objects.all().order_by("nombre")
    serializer = SectorSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def sector_detail(request, pk: int):
    """GET: Detalle | PATCH: Actualiza/Activa/Desactiva | DELETE: Elimina permanentemente o desactiva"""
    try:
        sector = Sector.objects.get(pk=pk)
    except Sector.DoesNotExist:
        return Response({"detail": "Sector no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "DELETE":
        # Si se especifica permanent=true, eliminar permanentemente
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            sector.delete()
        else:
            sector.activo = False
            sector.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = SectorSerializer(sector)
        return Response(serializer.data)
    
    serializer = SectorSerializer(sector, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


# Subsectores
@api_view(["GET", "POST"])
def subsectores_list(request):
    """GET: Lista subsectores | POST: Crea nuevo subsector"""
    if request.method == "POST":
        serializer = SubsectorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    queryset = Subsector.objects.all().order_by("nombre")
    serializer = SubsectorSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def subsector_detail(request, pk: int):
    """GET: Detalle | PATCH: Actualiza/Activa/Desactiva | DELETE: Elimina permanentemente o desactiva"""
    try:
        subsector = Subsector.objects.get(pk=pk)
    except Subsector.DoesNotExist:
        return Response({"detail": "Subsector no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "DELETE":
        # Si se especifica permanent=true, eliminar permanentemente
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            subsector.delete()
        else:
            subsector.activo = False
            subsector.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = SubsectorSerializer(subsector)
        return Response(serializer.data)
    
    serializer = SubsectorSerializer(subsector, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


# Establecimientos
@api_view(["GET", "POST"])
def establecimientos_list(request):
    """GET: Lista establecimientos | POST: Crea nuevo establecimiento"""
    if request.method == "POST":
        serializer = EstablecimientoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    queryset = Establecimiento.objects.all().order_by("nombre")
    serializer = EstablecimientoSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def establecimiento_detail(request, pk: int):
    """GET: Detalle | PATCH: Actualiza/Activa/Desactiva | DELETE: Elimina permanentemente o desactiva"""
    try:
        establecimiento = Establecimiento.objects.get(pk=pk)
    except Establecimiento.DoesNotExist:
        return Response({"detail": "Establecimiento no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "DELETE":
        # Si se especifica permanent=true, eliminar permanentemente
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            establecimiento.delete()
        else:
            establecimiento.activo = False
            establecimiento.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = EstablecimientoSerializer(establecimiento)
        return Response(serializer.data)
    
    serializer = EstablecimientoSerializer(establecimiento, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# HISTORIAL DE CARGAS
# ============================================================================

@api_view(["GET", "POST"])
def historial_cargas(request):
    """
    GET: Obtiene el historial de cargas con filtros opcionales
    POST: Registra una nueva carga en el historial
    """
    if request.method == "GET":
        # Obtener parámetros de filtrado
        tipo_carga = request.GET.get("tipo")
        usuario = request.GET.get("usuario")
        periodo = request.GET.get("periodo")  # Formato esperado: YYYY-MM
        limit_param = request.GET.get("limit", 50)

        # Construir queryset con filtros
        queryset = HistorialCarga.objects.all()

        if tipo_carga:
            queryset = queryset.filter(tipo_carga=tipo_carga)

        if usuario:
            queryset = queryset.filter(usuario__icontains=usuario)

        filtro_periodo: Q | None = None
        if periodo:
            try:
                periodo = periodo.strip()
                year_str, month_str = periodo.split("-", 1)
                periodo_year = int(year_str)
                periodo_month = int(month_str)
                filtro_periodo = Q(periodo_anio=periodo_year, periodo_mes=periodo_month) | Q(
                    fecha_corte__year=periodo_year,
                    fecha_corte__month=periodo_month,
                )
                queryset = queryset.filter(filtro_periodo)
            except (ValueError, AttributeError):
                pass

        # Limitar resultados y cargar objetos
        try:
            limit_value = max(int(limit_param), 1)
        except (ValueError, TypeError):
            limit_value = 50

        registros = list(queryset[:limit_value])

        # Determinar el estado de cada carga
        # Estados posibles:
        # - NUEVO: Primera y única carga de ese periodo
        # - ACTIVO: Carga más reciente del periodo (puede tener reemplazo=True si sobrescribió)
        # - ELIMINADO: Carga antigua reemplazada por una más reciente
        cargas_por_periodo: dict[tuple[str, int | None, int | None], list] = {}
        
        for registro in registros:
            # Crear clave única por tipo y periodo
            if registro.tipo_carga == "CORTE_FONASA":
                key = (registro.tipo_carga, registro.periodo_anio, registro.periodo_mes)
            else:  # HP_TRAKCARE u otros
                # Para HP Trakcare, agrupamos por mes de carga
                key = (registro.tipo_carga, registro.fecha_carga.year, registro.fecha_carga.month)
            
            if key not in cargas_por_periodo:
                cargas_por_periodo[key] = []
            cargas_por_periodo[key].append(registro)
        
        # Determinar el estado de cada registro
        for registro in registros:
            if registro.tipo_carga == "CORTE_FONASA":
                key = (registro.tipo_carga, registro.periodo_anio, registro.periodo_mes)
            else:
                key = (registro.tipo_carga, registro.fecha_carga.year, registro.fecha_carga.month)
            
            cargas_mismo_periodo = cargas_por_periodo.get(key, [])
            # Ordenar por fecha de carga (más reciente primero)
            cargas_mismo_periodo.sort(key=lambda x: x.fecha_carga, reverse=True)
            
            if len(cargas_mismo_periodo) == 1:
                # Es el único registro de este periodo
                registro.estado_carga = "NUEVO"
            elif cargas_mismo_periodo[0].id == registro.id:
                # Es el más reciente del periodo
                # Si tiene reemplazo=True, significa que sobrescribió datos anteriores
                if registro.reemplazo:
                    registro.estado_carga = "SOBRESCRITO"  # Sobrescribió al anterior
                else:
                    registro.estado_carga = "ACTIVO"  # Es actual pero no reemplazó
            else:
                # Fue eliminado/reemplazado por una carga más reciente
                registro.estado_carga = "ELIMINADO"

        # Calcular estadísticas de validación para cortes Fonasa
        # Cada corte se identifica por su año/mes de fecha_corte
        periodos_requeridos: set[tuple[int, int]] = set()
        for registro in registros:
            registro.validados = 0
            registro.no_validados = 0
            registro.total_periodo = 0

            if registro.tipo_carga != "CORTE_FONASA":
                continue

            # La fecha_corte define el mes específico de este corte
            if registro.fecha_corte:
                year = registro.fecha_corte.year
                month = registro.fecha_corte.month
                periodos_requeridos.add((year, month))
                registro._periodo_key = (year, month)  # type: ignore[attr-defined]

        if periodos_requeridos:
            # Crear query para buscar registros del mismo mes/año
            periodos_query = Q()
            for year, month in periodos_requeridos:
                periodos_query |= Q(fecha_corte__year=year, fecha_corte__month=month)

            if periodos_query:
                base_resumen_queryset = CorteFonasa.objects.filter(periodos_query)
                resumen_non_validated_filter = Q(
                    motivo_normalizado__in=NON_VALIDATED_MOTIVOS
                )
                resumen_validated_filter = ~resumen_non_validated_filter

                # Agrupar por año/mes de fecha_corte
                resumen = (
                    base_resumen_queryset
                    .values("fecha_corte__year", "fecha_corte__month")
                    .annotate(
                        validados=Count("id", filter=resumen_validated_filter),
                        no_validados=Count("id", filter=resumen_non_validated_filter),
                        total=Count("id"),
                    )
                )

                # Crear mapa usando (año, mes) como clave
                resumen_map = {
                    (item["fecha_corte__year"], item["fecha_corte__month"]): item
                    for item in resumen
                }

                for registro in registros:
                    if getattr(registro, "tipo_carga", None) != "CORTE_FONASA":
                        continue

                    periodo_key = getattr(registro, "_periodo_key", None)
                    if periodo_key and periodo_key in resumen_map:
                        data = resumen_map[periodo_key]
                        registro.validados = data.get("validados", 0)
                        registro.no_validados = data.get("no_validados", 0)
                        registro.total_periodo = data.get("total", 0)

        serializer = HistorialCargaSerializer(registros, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        # Registrar nueva carga
        # Validar autenticación (requiere token)
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(
                {"detail": "Autenticación requerida"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        data = request.data
        
        # Obtener IP del cliente
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Determinar responsable de la carga desde el usuario autenticado
        usuario_nombre = 'Anónimo'
        
        # Intentar obtener del token
        token = auth_header.replace("Bearer ", "")
        rut_del_token = get_rut_from_token(token)
        if rut_del_token:
            usuario_nombre = rut_del_token
        elif request.user and request.user.is_authenticated:
            usuario_nombre = (
                getattr(request.user, "nombre_completo", "")
                or request.user.get_full_name()
                or request.user.get_username()
                or usuario_nombre
            )

        # Crear registro de historial
        historial = HistorialCarga.objects.create(
            tipo_carga=data.get('tipo_carga'),
            nombre_archivo=data.get('nombre_archivo'),
            usuario=usuario_nombre,
            periodo_mes=data.get('periodo_mes'),
            periodo_anio=data.get('periodo_anio'),
            fecha_corte=data.get('fecha_corte'),
            total_registros=data.get('total_registros', 0),
            registros_creados=data.get('registros_creados', 0),
            registros_actualizados=data.get('registros_actualizados', 0),
            registros_invalidos=data.get('registros_invalidos', 0),
            estado=data.get('estado', 'EXITOSO'),
            reemplazo=data.get('reemplazo', False),
            observaciones=data.get('observaciones', ''),
            tiempo_procesamiento=data.get('tiempo_procesamiento'),
            ip_address=ip_address,
        )
        
        serializer = HistorialCargaSerializer(historial)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def centros_disponibles(request):
    """
    Retorna la lista de centros únicos del último corte disponible.
    Los centros vienen del campo nombre_centro de CorteFonasa.
    """
    # Obtener el último corte
    ultimo_corte = CorteFonasa.objects.order_by("-fecha_corte").values("fecha_corte").first()
    
    if not ultimo_corte:
        return Response({"centros": []}, status=status.HTTP_200_OK)
    
    fecha_corte = ultimo_corte["fecha_corte"]
    
    # Obtener centros únicos de ese corte
    centros = (
        CorteFonasa.objects
        .filter(fecha_corte=fecha_corte)
        .exclude(nombre_centro="")
        .exclude(nombre_centro__isnull=True)
        .values_list("nombre_centro", flat=True)
        .distinct()
        .order_by("nombre_centro")
    )
    
    # Obtener visibilidad desde catálogos de establecimientos (antes centros de salud)
    centros_catalogos = {
        cat.nombre: cat.activo 
        for cat in Establecimiento.objects.all()
    }
    
    # Combinar datos
    centros_con_estado = []
    for centro in centros:
        centros_con_estado.append({
            "nombre": centro,
            "visible": centros_catalogos.get(centro, True)  # Por defecto visible
        })
    
    return Response({
        "centros": centros_con_estado,
        "fecha_corte": fecha_corte
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def validar_nuevos_usuarios_lote(request):
    """
    Endpoint optimizado para validar múltiples usuarios en un solo request.
    
    POST body:
    {
        "usuarios": [
            {"id": 1, "run": "12345678-9", "fechaInscripcion": "2024-10-15"},
            ...
        ]
    }
    
    Response:
    {
        "resultados": [
            {
                "id": 1,
                "estado": "VALIDADO",
                "actualizado": true,
                "existeEnCorte": true
            },
            ...
        ],
        "totalProcesados": 100,
        "totalActualizados": 50
    }
    """
    usuarios = request.data.get("usuarios", [])
    
    if not isinstance(usuarios, list) or not usuarios:
        return Response(
            {"detail": "'usuarios' debe ser una lista con datos"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    # Obtener último corte disponible
    ultimo_corte = (
        CorteFonasa.objects.all()
        .values("fecha_corte__year", "fecha_corte__month")
        .annotate(total=Count("id"))
        .order_by("-fecha_corte__year", "-fecha_corte__month")
        .first()
    )
    
    if not ultimo_corte:
        return Response(
            {"detail": "No hay cortes FONASA disponibles"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    ultimo_corte_fecha = date(
        ultimo_corte["fecha_corte__year"],
        ultimo_corte["fecha_corte__month"],
        1
    )
    
    # Extraer todos los RUNs para buscar en una sola query
    runs_a_buscar = [normalize_run(u.get("run", "")) for u in usuarios if u.get("run")]
    
    # Buscar todos los RUNs en el corte en UNA sola query
    corte_dict = {}
    if runs_a_buscar:
        registros_corte = CorteFonasa.objects.filter(
            run__in=runs_a_buscar
        ).values("run", "motivo", "motivo_normalizado", "aceptado_rechazado")
        
        # Crear diccionario para búsqueda rápida
        for registro in registros_corte:
            run_norm = normalize_run(registro["run"])
            if run_norm not in corte_dict:
                corte_dict[run_norm] = registro
    
    resultados = []
    usuarios_a_actualizar = []
    
    for usuario_data in usuarios:
        usuario_id = usuario_data.get("id")
        run = usuario_data.get("run", "")
        fecha_inscripcion_str = usuario_data.get("fechaInscripcion")
        
        if not usuario_id or not run or not fecha_inscripcion_str:
            continue
        
        run_normalizado = normalize_run(run)
        
        # Parsear fecha de inscripción
        fecha_inscripcion = _parse_date(fecha_inscripcion_str)
        if not fecha_inscripcion:
            continue
        
        fecha_inscripcion_comparar = date(
            fecha_inscripcion.year,
            fecha_inscripcion.month,
            1
        )
        
        # Determinar estado
        if fecha_inscripcion_comparar > ultimo_corte_fecha:
            nuevo_estado = "PENDIENTE"
            existe_en_corte = False
        else:
            registro_corte = corte_dict.get(run_normalizado)
            existe_en_corte = bool(registro_corte)
            
            if registro_corte:
                # PRIMERO verificar aceptado_rechazado
                aceptado_rechazado = (registro_corte.get("aceptado_rechazado") or "").upper()
                motivo_normalizado = (registro_corte.get("motivo_normalizado") or "").upper()
                
                # Lógica de validación basada en aceptado_rechazado
                if "FALLECIDO" in motivo_normalizado or "FALLECIDO" in aceptado_rechazado:
                    nuevo_estado = "FALLECIDO"
                elif "RECHAZADO" in aceptado_rechazado:
                    nuevo_estado = "NO_VALIDADO"
                elif "ACEPTADO" in aceptado_rechazado or "MANTIENE" in aceptado_rechazado:
                    nuevo_estado = "VALIDADO"
                else:
                    # Fallback a motivo_normalizado si aceptado_rechazado está vacío
                    if any(m in motivo_normalizado for m in NON_VALIDATED_MOTIVOS):
                        nuevo_estado = "NO_VALIDADO"
                    else:
                        nuevo_estado = "VALIDADO"
            else:
                # Usuario inscrito antes del último corte pero NO aparece en corte
                nuevo_estado = "NO_VALIDADO"
        
        # Obtener estado actual
        try:
            usuario_obj = NuevoUsuario.objects.get(id=usuario_id)
            estado_actual = usuario_obj.estado
            
            if estado_actual != nuevo_estado:
                usuarios_a_actualizar.append({
                    "id": usuario_id,
                    "estado": nuevo_estado
                })
                actualizado = True
            else:
                actualizado = False
                
        except NuevoUsuario.DoesNotExist:
            actualizado = False
        
        resultados.append({
            "id": usuario_id,
            "estado": nuevo_estado,
            "actualizado": actualizado,
            "existeEnCorte": existe_en_corte,
        })
    
    # Actualizar todos los usuarios en una transacción
    total_actualizados = 0
    if usuarios_a_actualizar:
        with transaction.atomic():
            for update_data in usuarios_a_actualizar:
                NuevoUsuario.objects.filter(id=update_data["id"]).update(
                    estado=update_data["estado"]
                )
                total_actualizados += 1
    
    return Response(
        {
            "resultados": resultados,
            "totalProcesados": len(resultados),
            "totalActualizados": total_actualizados,
            "ultimoCorte": {
                "mes": ultimo_corte["fecha_corte__month"],
                "anio": ultimo_corte["fecha_corte__year"],
            }
        },
        status=status.HTTP_200_OK,
    )


# ============================================================================
# ADMINISTRACIÓN DE USUARIOS
# ============================================================================

@api_view(["GET", "POST"])
def usuarios_list(request):
    """
    GET: Lista todos los usuarios
    POST: Crea un nuevo usuario
    """
    if request.method == "POST":
        from .models import Usuario
        from django.contrib.auth.hashers import make_password
        
        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        rol = data.get("rol", "OPERADOR")
        
        if not all([username, email, password]):
            return Response(
                {"detail": "username, email y password son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si el usuario ya existe
        if Usuario.objects.filter(username=username).exists():
            return Response(
                {"detail": "El nombre de usuario ya existe"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Usuario.objects.filter(email=email).exists():
            return Response(
                {"detail": "El email ya está registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario = Usuario.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            nombre_completo=data.get("nombre_completo", ""),
            rol=rol,
            activo=data.get("activo", True)
        )
        
        return Response({
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "nombreCompleto": usuario.nombre_completo,
            "rol": usuario.rol,
            "activo": usuario.activo,
            "creadoEl": usuario.creado_el.isoformat(),
        }, status=status.HTTP_201_CREATED)
    
    # GET - Listar usuarios
    from .models import Usuario
    usuarios = Usuario.objects.all().order_by("-creado_el")
    
    data = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "nombreCompleto": u.nombre_completo,
        "rol": u.rol,
        "activo": u.activo,
        "ultimoAcceso": u.ultimo_acceso.isoformat() if u.ultimo_acceso else None,
        "creadoEl": u.creado_el.isoformat(),
    } for u in usuarios]
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def usuario_detail(request, pk: int):
    """
    GET: Detalle de un usuario
    PATCH: Actualiza un usuario
    DELETE: Desactiva o elimina un usuario
    """
    from .models import Usuario
    
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response(
            {"detail": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "DELETE":
        permanent = request.query_params.get("permanent", "").lower() in {"true", "1"}
        if permanent:
            usuario.delete()
        else:
            usuario.activo = False
            usuario.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        return Response({
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "nombreCompleto": usuario.nombre_completo,
            "rol": usuario.rol,
            "activo": usuario.activo,
            "ultimoAcceso": usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None,
            "creadoEl": usuario.creado_el.isoformat(),
        })
    
    # PATCH - Actualizar usuario
    if "username" in request.data:
        username = request.data["username"]
        if Usuario.objects.filter(username=username).exclude(pk=pk).exists():
            return Response(
                {"detail": "El nombre de usuario ya existe"},
                status=status.HTTP_400_BAD_REQUEST
            )
        usuario.username = username
    
    if "email" in request.data:
        email = request.data["email"]
        if Usuario.objects.filter(email=email).exclude(pk=pk).exists():
            return Response(
                {"detail": "El email ya está registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        usuario.email = email
    
    if "nombreCompleto" in request.data:
        usuario.nombre_completo = request.data["nombreCompleto"]
    
    if "rol" in request.data:
        usuario.rol = request.data["rol"]
    
    if "activo" in request.data:
        usuario.activo = request.data["activo"]
    
    usuario.save()
    
    return Response({
        "id": usuario.id,
        "username": usuario.username,
        "email": usuario.email,
        "nombreCompleto": usuario.nombre_completo,
        "rol": usuario.rol,
        "activo": usuario.activo,
        "ultimoAcceso": usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None,
        "creadoEl": usuario.creado_el.isoformat(),
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def cambiar_password(request, pk: int):
    """
    Permite a un administrador cambiar la contraseña de cualquier usuario
    """
    from .models import Usuario
    from django.contrib.auth.hashers import make_password
    
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response(
            {"detail": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    nueva_password = request.data.get("nuevaPassword")
    if not nueva_password:
        return Response(
            {"detail": "nuevaPassword es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar longitud mínima
    if len(nueva_password) < 6:
        return Response(
            {"detail": "La contraseña debe tener al menos 6 caracteres"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    usuario.password = make_password(nueva_password)
    usuario.save()
    
    return Response({
        "mensaje": f"Contraseña actualizada exitosamente para {usuario.username}"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def usuarios_no_validados_list(request):
    """
    Lista todos los usuarios no validados (Rechazados y No Validados) del corte FONASA.
    """
    # Validar autenticación (requiere token)
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response(
            {"detail": "Autenticación requerida"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    # Filtrar usuarios con estado Rechazado o No Validado
    usuarios = CorteFonasa.objects.filter(
        Q(aceptado_rechazado__icontains="Rechaz")
        | Q(aceptado_rechazado__icontains="No Validado")
        | Q(aceptado_rechazado__icontains="Rechazo")
    ).select_related("centro_salud").order_by("-fecha_corte", "run")
    
    # Serializar los datos
    data = []
    for usuario in usuarios:
        estado_raw = (usuario.aceptado_rechazado or "").strip()
        estado_upper = estado_raw.upper()
        estado_categoria = "otro"
        if "RECHAZ" in estado_upper:
            estado_categoria = "rechazado"
        elif "NO VALIDADO" in estado_upper:
            estado_categoria = "no_validado"

        motivo_original = (usuario.motivo or "").strip()
        motivo_normalizado = normalize_motivo(motivo_original) if motivo_original else ""

        mes_corte = ""
        if usuario.fecha_corte:
            mes_corte = MONTH_NAMES_ES[usuario.fecha_corte.month - 1]

        data.append(
            {
                "id": usuario.id,
                "run": usuario.run,
                "nombre": f"{usuario.nombres} {usuario.ap_paterno} {usuario.ap_materno}".strip(),
                "centro_salud": usuario.centro_salud.nombre if usuario.centro_salud else usuario.nombre_centro,
                "centro_actual": usuario.centro_actual or usuario.nombre_centro,
                "rut_centro_procedencia": usuario.rut_centro_procedencia or None,
                "rut_centro_actual": usuario.rut_centro_actual or None,
                "nombre_centro_actual": usuario.nombre_centro_actual or None,
                "genero": usuario.genero,
                "nacionalidad": "",  # No está en el modelo actual
                "tramo": usuario.tramo,
                "estado_validacion": estado_raw,
                "estado_categoria": estado_categoria,
                "mes": mes_corte,
                "ano": usuario.fecha_corte.year if usuario.fecha_corte else None,
                "motivo_rechazo": motivo_original if estado_categoria == "rechazado" else "",
                "motivo_no_validado": motivo_original if estado_categoria == "no_validado" else "",
                "motivo_original": motivo_original,
                "motivo_normalizado": motivo_normalizado,
                "creadoEl": usuario.creado_el.isoformat() if usuario.creado_el else None,
                "fecha_corte": usuario.fecha_corte.isoformat() if usuario.fecha_corte else None,
            }
        )
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def usuario_no_validado_detail(request, pk):
    """
    Detalle de un usuario no validado del corte FONASA.
    """
    try:
        usuario = CorteFonasa.objects.select_related('centro_salud').get(pk=pk)
    except CorteFonasa.DoesNotExist:
        return Response(
            {"detail": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    data = {
        'id': usuario.id,
        'run': usuario.run,
        'nombres': usuario.nombres,
        'ap_paterno': usuario.ap_paterno,
        'ap_materno': usuario.ap_materno,
        'fecha_nacimiento': usuario.fecha_nacimiento,
        'genero': usuario.genero,
        'tramo': usuario.tramo,
        'fecha_corte': usuario.fecha_corte,
        'centro_salud': usuario.centro_salud.nombre if usuario.centro_salud else usuario.nombre_centro,
        'centro_de_procedencia': usuario.centro_de_procedencia,
        'comuna_de_procedencia': usuario.comuna_de_procedencia,
        'centro_actual': usuario.centro_actual,
        'comuna_actual': usuario.comuna_actual,
        'aceptado_rechazado': usuario.aceptado_rechazado,
        'motivo': usuario.motivo,
        'motivo_normalizado': usuario.motivo_normalizado,
        'creado_el': usuario.creado_el,
    }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@parser_classes([MultiPartParser, FormParser])
def usuario_no_validado_observaciones(request, run: str):
    """Listado, creación de observaciones asociadas a un RUN de corte FONASA."""
    
    # Validar autenticación (requiere token)
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response(
            {"detail": "Autenticación requerida"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    normalized_run = normalize_run(run)
    if not normalized_run:
        return Response(
            {"detail": "RUN inválido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cortes_qs = (
        CorteFonasa.objects.filter(run=normalized_run)
        .order_by("-fecha_corte", "-id")
        .select_related("centro_salud")
    )

    if not cortes_qs.exists():
        return Response(
            {"detail": "No se encontró información para el RUN indicado."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        observaciones = (
            CorteFonasaObservacion.objects.filter(corte__in=cortes_qs)
            .select_related("corte", "autor", "corte__centro_salud")
            .order_by("-created_at")
        )
        serializer = CorteFonasaObservacionSerializer(
            observaciones,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST - crear una observación
    estado_revision = (request.data.get("estadoRevision") or "").strip().upper()
    if not estado_revision:
        return Response(
            {"detail": "estadoRevision es requerido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    estado_valid_values = {
        choice[0] for choice in CorteFonasaObservacion.EstadoRevision.choices
    }
    if estado_revision not in estado_valid_values:
        return Response(
            {"detail": "estadoRevision no es válido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    corte_id = request.data.get("corteId")
    corte_obj = None
    if corte_id:
        try:
            corte_obj = cortes_qs.get(id=corte_id)
        except CorteFonasa.DoesNotExist:
            return Response(
                {"detail": "El corte seleccionado no corresponde al RUN indicado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        corte_obj = cortes_qs.first()

    titulo = (request.data.get("titulo") or "").strip()
    texto = (request.data.get("texto") or "").strip()
    adjunto = request.FILES.get("adjunto")

    if not titulo and not texto and not adjunto:
        return Response(
            {"detail": "Debe ingresar un título, comentario o adjuntar un archivo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    metadata_raw = request.data.get("metadata")
    metadata_value = None
    if metadata_raw:
        if isinstance(metadata_raw, (dict, list)):
            metadata_value = metadata_raw
        else:
            try:
                metadata_value = json.loads(metadata_raw)
            except (TypeError, ValueError):
                metadata_value = None

    # Obtener el nombre/RUT del usuario del token
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace("Bearer ", "")
    autor_nombre = get_rut_from_token(token) or "Desconocido"

    observacion = CorteFonasaObservacion(
        corte=corte_obj,
        autor=request.user if request.user and request.user.is_authenticated else None,
        autor_nombre=autor_nombre,
        estado_revision=estado_revision,
        tipo=CorteFonasaObservacion.TipoObservacion.MANUAL,
        titulo=titulo,
        texto=texto,
    )

    if metadata_value is not None:
        observacion.metadata = metadata_value

    if adjunto:
        observacion.adjunto = adjunto

    observacion.save()

    serializer = CorteFonasaObservacionSerializer(
        observacion,
        context={"request": request},
    )
    return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(["DELETE", "PATCH"])
@parser_classes([MultiPartParser, FormParser])
def usuario_no_validado_observacion_detail(request, run: str, observacion_id: int):
    """Eliminar o actualizar una observación específica."""
    
    # Validar que hay un token (autenticación requerida)
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response(
            {"detail": "Autenticación requerida"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    
    normalized_run = normalize_run(run)
    if not normalized_run:
        return Response(
            {"detail": "RUN inválido"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        observacion = CorteFonasaObservacion.objects.select_related("corte", "autor").get(
            id=observacion_id,
            corte__run=normalized_run
        )
    except CorteFonasaObservacion.DoesNotExist:
        return Response(
            {"detail": "Observación no encontrada"},
            status=status.HTTP_404_NOT_FOUND,
        )
    
    # Para este MVP, permitir cualquiera que tenga un token válido
    # En producción, deberías validar el JWT y obtener el usuario real
    
    if request.method == "DELETE":
        observacion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # PATCH - actualizar observación
    estado_revision = (request.data.get("estadoRevision") or "").strip().upper()
    if estado_revision:
        estado_valid_values = {
            choice[0] for choice in CorteFonasaObservacion.EstadoRevision.choices
        }
        if estado_revision not in estado_valid_values:
            return Response(
                {"detail": "estadoRevision no es válido"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        observacion.estado_revision = estado_revision
    
    titulo = request.data.get("titulo")
    if titulo is not None:
        observacion.titulo = titulo.strip()
    
    texto = request.data.get("texto")
    if texto is not None:
        observacion.texto = texto.strip()
    
    adjunto = request.FILES.get("adjunto")
    if adjunto:
        observacion.adjunto = adjunto
    
    metadata_raw = request.data.get("metadata")
    if metadata_raw:
        if isinstance(metadata_raw, (dict, list)):
            observacion.metadata = metadata_raw
        else:
            try:
                observacion.metadata = json.loads(metadata_raw)
            except (TypeError, ValueError):
                pass
    
    observacion.save()
    
    serializer = CorteFonasaObservacionSerializer(
        observacion,
        context={"request": request},
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


# =============================================================================
# BUSCAR USUARIO
# =============================================================================

@api_view(["GET"])
def buscar_usuario(request):
    """
    Busca un usuario por RUT y retorna toda la información relacionada:
    - Datos de CorteFonasa (todos los registros por mes)
    - Datos de HpTrakcare
    - Datos de NuevoUsuario (si no se encuentra en otras tablas)
    - Observaciones
    - Estado de validación por mes
    """
    run = request.query_params.get("run", "").strip()
    
    if not run:
        return Response(
            {"detail": "El parámetro 'run' es requerido"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    normalized_run = normalize_run(run)
    if not normalized_run:
        return Response(
            {"detail": "RUN inválido"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    # Buscar datos en CorteFonasa
    cortes = CorteFonasa.objects.filter(run=normalized_run).select_related(
        'centro_salud'
    ).prefetch_related('observaciones').order_by('-fecha_corte')
    
    # Buscar datos en HpTrakcare
    hp_records = HpTrakcare.objects.filter(run=normalized_run).select_related(
        'etnia', 'nacionalidad', 'centro_inscripcion', 'sector'
    )
    
    # Buscar datos en NuevoUsuario
    nuevos_usuarios = NuevoUsuario.objects.filter(run=normalized_run).select_related(
        'nacionalidad', 'etnia', 'sector', 'subsector', 'establecimiento'
    ).order_by('-periodo_anio', '-periodo_mes')
    
    # Agrupar cortes por mes y calcular validación
    cortes_por_mes = {}
    for corte in cortes:
        mes_key = f"{corte.fecha_corte.year}-{corte.fecha_corte.month:02d}"
        mes_label = _format_month_label(corte.fecha_corte.year, corte.fecha_corte.month)
        
        if mes_key not in cortes_por_mes:
            cortes_por_mes[mes_key] = {
                "mes": mes_label,
                "fecha_corte": corte.fecha_corte.isoformat(),
                "registros": [],
                "validado": None,
                "observaciones": []
            }
        
        # Determinar si está validado
        es_validado = _is_validated_corte(corte.aceptado_rechazado, corte.motivo)
        
        # Actualizar estado de validación del mes (si hay al menos uno validado, el mes se considera validado)
        if cortes_por_mes[mes_key]["validado"] is None:
            cortes_por_mes[mes_key]["validado"] = es_validado
        elif es_validado:
            cortes_por_mes[mes_key]["validado"] = True
        
        # Agregar registro
        corte_data = {
            "id": corte.id,
            "run": corte.run,
            "nombres": corte.nombres,
            "ap_paterno": corte.ap_paterno,
            "ap_materno": corte.ap_materno,
            "nombre_completo": corte.nombre_completo,
            "fecha_nacimiento": corte.fecha_nacimiento.isoformat() if corte.fecha_nacimiento else None,
            "genero": corte.genero,
            "tramo": corte.tramo,
            "centro_salud": corte.centro_salud.nombre if corte.centro_salud else corte.nombre_centro,
            "nombre_centro": corte.nombre_centro or (corte.centro_salud.nombre if corte.centro_salud else None),
            "centro_procedencia": corte.centro_de_procedencia,
            "comuna_procedencia": corte.comuna_de_procedencia,
            "centro_actual": corte.nombre_centro_actual or corte.centro_actual,
            "comuna_actual": corte.comuna_actual,
            "aceptado_rechazado": corte.aceptado_rechazado,
            "motivo": corte.motivo,
            "validado": es_validado,
        }
        cortes_por_mes[mes_key]["registros"].append(corte_data)
        
        # Agregar observaciones del corte
        for obs in corte.observaciones.all():
            obs_data = {
                "id": obs.id,
                "corte_id": corte.id,
                "titulo": obs.titulo,
                "texto": obs.texto,
                "estado_revision": obs.estado_revision,
                "tipo": obs.tipo,
                "autor_nombre": obs.autor_nombre,
                "created_at": obs.created_at.isoformat(),
                "adjunto": request.build_absolute_uri(obs.adjunto.url) if obs.adjunto else None,
            }
            cortes_por_mes[mes_key]["observaciones"].append(obs_data)
    
    # Convertir a lista ordenada
    cortes_por_mes_list = [
        {"mes_key": key, **value} 
        for key, value in sorted(cortes_por_mes.items(), reverse=True)
    ]
    
    # Serializar datos de HpTrakcare
    hp_data = None
    if hp_records.exists():
        hp = hp_records.first()
        hp_data = {
            "id": hp.id,
            "cod_familia": hp.cod_familia,
            "relacion_parentezco": hp.relacion_parentezco,
            "id_trakcare": hp.id_trakcare,
            "cod_registro": hp.cod_registro,
            "run": hp.run,
            "ap_paterno": hp.ap_paterno,
            "ap_materno": hp.ap_materno,
            "nombre": hp.nombre,
            "nombre_completo": hp.nombre_completo,
            "fecha_nacimiento": hp.fecha_nacimiento.isoformat() if hp.fecha_nacimiento else None,
            "genero": hp.genero,
            "edad": hp.edad,
            "direccion": hp.direccion,
            "telefono": hp.telefono,
            "telefono_celular": hp.telefono_celular,
            "telefono_recado": hp.telefono_recado,
            "servicio_salud": hp.servicio_salud,
            "etnia": hp.etnia.nombre if hp.etnia else None,
            "nacionalidad": hp.nacionalidad.nombre if hp.nacionalidad else None,
            "centro_inscripcion": hp.centro_inscripcion.nombre if hp.centro_inscripcion else None,
            "sector": hp.sector.nombre if hp.sector else None,
            "prevision": hp.prevision,
            "plan_trakcare": hp.plan_trakcare,
            "prais_trakcare": hp.prais_trakcare,
            "fecha_incorporacion": hp.fecha_incorporacion.isoformat() if hp.fecha_incorporacion else None,
            "fecha_ultima_modif": hp.fecha_ultima_modif.isoformat() if hp.fecha_ultima_modif else None,
            "fecha_defuncion": hp.fecha_defuncion.isoformat() if hp.fecha_defuncion else None,
            "esta_vivo": hp.esta_vivo,
        }
    
    # Serializar datos de NuevoUsuario
    nuevos_usuarios_data = []
    for nuevo in nuevos_usuarios:
        nuevo_data = {
            "id": nuevo.id,
            "run": nuevo.run,
            "nombre_completo": nuevo.nombre_completo,
            "nombres": nuevo.nombres,
            "apellido_paterno": nuevo.apellido_paterno,
            "apellido_materno": nuevo.apellido_materno,
            "fecha_inscripcion": nuevo.fecha_inscripcion.isoformat() if nuevo.fecha_inscripcion else None,
            "periodo": nuevo.periodo_str,
            "periodo_mes": nuevo.periodo_mes,
            "periodo_anio": nuevo.periodo_anio,
            "nacionalidad": nuevo.nacionalidad.nombre if nuevo.nacionalidad else None,
            "etnia": nuevo.etnia.nombre if nuevo.etnia else None,
            "sector": nuevo.sector.nombre if nuevo.sector else None,
            "subsector": nuevo.subsector.nombre if nuevo.subsector else None,
            "centro": nuevo.centro,
            "establecimiento": nuevo.establecimiento.nombre if nuevo.establecimiento else None,
            "codigo_percapita": nuevo.codigo_percapita,
            "estado": nuevo.estado,
            "estado_display": nuevo.get_estado_display(),
            "revisado": nuevo.revisado,
            "revisado_manualmente": nuevo.revisado_manualmente,
            "revisado_por": nuevo.revisado_por,
            "revisado_el": nuevo.revisado_el.isoformat() if nuevo.revisado_el else None,
            "observaciones": nuevo.observaciones,
            "observaciones_trakcare": nuevo.observaciones_trakcare,
            "creado_el": nuevo.creado_el.isoformat() if nuevo.creado_el else None,
            "creado_por": nuevo.creado_por,
        }
        nuevos_usuarios_data.append(nuevo_data)
    
    # Respuesta completa
    response_data = {
        "run": normalized_run,
        "encontrado": len(cortes) > 0 or hp_records.exists() or nuevos_usuarios.exists(),
        "cortes_por_mes": cortes_por_mes_list,
        "hp_trakcare": hp_data,
        "nuevos_usuarios": nuevos_usuarios_data,
        "total_meses": len(cortes_por_mes_list),
        "total_nuevos_usuarios": len(nuevos_usuarios_data),
    }
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def buscar_familia(request):
    """
    Busca todos los miembros de una familia por RUT.
    Retorna todos los usuarios que comparten el mismo cod_familia en HpTrakcare.
    """
    run = request.query_params.get("run", "").strip()

    if not run:
        return Response(
            {"detail": "El parámetro 'run' es requerido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    normalized_run = normalize_run(run)
    if not normalized_run:
        return Response(
            {"detail": "RUN inválido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Buscar el registro principal en HpTrakcare
    hp_principal = HpTrakcare.objects.filter(run=normalized_run).select_related(
        'etnia', 'nacionalidad', 'centro_inscripcion', 'sector'
    ).first()

    if not hp_principal or not hp_principal.cod_familia:
        return Response(
            {
                "run": normalized_run,
                "encontrado": False,
                "mensaje": "No se encontró registro en HP Trakcare o no tiene código de familia",
                "cod_familia": None,
                "miembros": []
            },
            status=status.HTTP_200_OK,
        )

    # Buscar todos los miembros de la familia
    miembros_familia = HpTrakcare.objects.filter(
        cod_familia=hp_principal.cod_familia
    ).select_related(
        'etnia', 'nacionalidad', 'centro_inscripcion', 'sector'
    ).order_by('relacion_parentezco', 'run')

    # Serializar cada miembro con información resumida de cortes
    miembros_data = []
    for miembro in miembros_familia:
        # Obtener resumen de cortes para este miembro
        cortes_count = CorteFonasa.objects.filter(run=miembro.run).count()
        ultimo_corte = CorteFonasa.objects.filter(run=miembro.run).order_by('-fecha_corte').first()

        # Determinar si tiene cortes validados
        tiene_validados = False
        if ultimo_corte:
            tiene_validados = _is_validated_corte(ultimo_corte.aceptado_rechazado, ultimo_corte.motivo)

        miembro_data = {
            "id": miembro.id,
            "cod_familia": miembro.cod_familia,
            "relacion_parentezco": miembro.relacion_parentezco,
            "run": miembro.run,
            "nombre_completo": miembro.nombre_completo,
            "nombre": miembro.nombre,
            "ap_paterno": miembro.ap_paterno,
            "ap_materno": miembro.ap_materno,
            "fecha_nacimiento": miembro.fecha_nacimiento.isoformat() if miembro.fecha_nacimiento else None,
            "genero": miembro.genero,
            "edad": miembro.edad,
            "direccion": miembro.direccion,
            "telefono": miembro.telefono,
            "telefono_celular": miembro.telefono_celular,
            "centro_inscripcion": miembro.centro_inscripcion.nombre if miembro.centro_inscripcion else None,
            "sector": miembro.sector.nombre if miembro.sector else None,
            "esta_vivo": miembro.esta_vivo,
            "es_principal": miembro.run == normalized_run,
            # Información de cortes
            "total_cortes": cortes_count,
            "ultimo_corte": ultimo_corte.fecha_corte.isoformat() if ultimo_corte else None,
            "tiene_validados": tiene_validados,
        }
        miembros_data.append(miembro_data)

    response_data = {
        "run": normalized_run,
        "encontrado": True,
        "cod_familia": hp_principal.cod_familia,
        "total_miembros": len(miembros_data),
        "miembros": miembros_data,
    }

    return Response(response_data, status=status.HTTP_200_OK)


