from datetime import date, datetime
from typing import Dict, List, Tuple

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q, F, Value
from django.db.models.functions import Replace, Trim, Upper
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import CorteFonasa, HpTrakcare, normalize_run, NuevoUsuario, ValidacionCorte, Catalogo, HistorialCarga
from .serializers import (
    CorteFonasaDetailSerializer,
    CorteFonasaRecordSerializer,
    HpTrakcareDetailSerializer,
    HpTrakcareRecordSerializer,
    NuevoUsuarioSerializer,
    ValidacionCorteSerializer,
    CatalogoSerializer,
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
    "codGenero",
    "nombreCentro",
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

VALIDATED_MOTIVOS = {
    "MANTIENE INSCRIPCION",
    "INSCRITO A FONASA",
    "MIGRADO A FONASA",
    "MIGRADOS A FONASA",
    "TRASLADO POSITIVO",
    "NUEVO USUARIO",
    "NUEVO INSCRITO",
}

NON_VALIDATED_MOTIVOS = {
    "TRASLADO NEGATIVO",
    "RECHAZO PROVISIONAL",
    "RECHAZOS PROVISIONAL",
    "RECHAZO PREVISIONAL",
    "RECHAZOS PREVISIONAL",
    "RECHAZO FALLECIDO",
    "RECHAZOS FALLECIDO",
    "RECHAZADO FALLECIDO",
    "RECHAZADOS FALLECIDO",
    "RECHAZADO PREVISIONAL",
    "RECHAZADOS PREVISIONAL",
}


def _format_month_label(year: int, month: int) -> str:
    if 1 <= month <= 12:
        return f"{MONTH_NAMES_ES[month - 1]} {year}"
    return f"{year}-{month:02d}"


def _format_month_key(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def _safe_str(value: str | None) -> str:
    return (value or "").strip()


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


def _normalize_motivo_expression(field_name: str = "motivo"):
    expr = Upper(Trim(F(field_name)))
    replacements = {
        "Á": "A",
        "À": "A",
        "Â": "A",
        "Ä": "A",
        "Ã": "A",
        "É": "E",
        "È": "E",
        "Ê": "E",
        "Ë": "E",
        "Í": "I",
        "Ì": "I",
        "Î": "I",
        "Ï": "I",
        "Ó": "O",
        "Ò": "O",
        "Ô": "O",
        "Ö": "O",
        "Õ": "O",
        "Ú": "U",
        "Ù": "U",
        "Û": "U",
        "Ü": "U",
        "Ñ": "N",
        "Ç": "C",
        "�": "O",
    }
    for source, target in replacements.items():
        expr = Replace(expr, Value(source), Value(target))

    # Reduce espacios duplicados que pueden venir de los archivos originales.
    expr = Replace(expr, Value("  "), Value(" "))
    expr = Replace(expr, Value("  "), Value(" "))
    return expr


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
        "codGenero": instance.cod_genero,
        "nombreCentro": instance.nombre_centro,
        "motivo": instance.motivo,
    }


def _build_trakcare_payload(instance: HpTrakcare) -> Dict[str, str | None]:
    return {
        "id": instance.id,
        "codFamilia": instance.cod_familia,
        "relacionParentezco": instance.relacion_parentezco,
        "idTrakcare": instance.id_trakcare,
        "etnia": instance.etnia,
        "codRegistro": instance.cod_registro,
        "nacionalidad": instance.nacionalidad,
        "RUN": instance.run,
        "apPaterno": instance.ap_paterno,
        "apMaterno": instance.ap_materno,
        "nombre": instance.nombre,
        "genero": instance.genero,
        "fechaNacimiento": instance.fecha_nacimiento.isoformat() if instance.fecha_nacimiento else "",
        "edad": instance.edad,
        "direccion": instance.direccion,
        "telefono": instance.telefono,
        "telefonoCelular": instance.telefono_celular,
        "TelefonoRecado": instance.telefono_recado,
        "servicioSalud": instance.servicio_salud,
        "centroInscripcion": instance.centro_inscripcion,
        "sector": instance.sector,
        "prevision": instance.prevision,
        "planTrakcare": instance.plan_trakcare,
        "praisTrakcare": instance.prais_trakcare,
        "fechaIncorporacion": instance.fecha_incorporacion.isoformat() if instance.fecha_incorporacion else "",
        "fechaUltimaModif": instance.fecha_ultima_modif.isoformat() if instance.fecha_ultima_modif else "",
        "fechaDefuncion": instance.fecha_defuncion.isoformat() if instance.fecha_defuncion else "",
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

        annotated_queryset = queryset.annotate(
            motivo_normalized=_normalize_motivo_expression()
        )

        validated_filter = Q(motivo_normalized__in=VALIDATED_MOTIVOS)
        non_validated_filter = Q(motivo_normalized__in=NON_VALIDATED_MOTIVOS)

        total_count = annotated_queryset.count()
        validated_count = annotated_queryset.filter(validated_filter).count()
        non_validated_count = annotated_queryset.filter(non_validated_filter).count()

        all_param = request.query_params.get("all", "").lower()
        include_all = all_param in {"1", "true", "yes"}

        try:
            offset = max(int(request.query_params.get("offset", "0")), 0)
        except ValueError:
            offset = 0

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

        ordered_queryset = queryset.order_by("-fecha_corte", "run")
        if limit_value == 0:
            data_queryset = ordered_queryset[offset:]
        else:
            data_queryset = ordered_queryset[offset : offset + limit_value]

        rows = [_build_corte_payload(instance) for instance in data_queryset]

        grouped = (
            annotated_queryset.values("fecha_corte__year", "fecha_corte__month")
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

        return Response(
            {
                "columns": CORTE_COLUMNS,
                "rows": rows,
                "total": total_count,
                "validated": validated_count,
                "non_validated": non_validated_count,
                "summary": summary,
            }
        )

    records = request.data.get("records")
    if not isinstance(records, list) or not records:
        return Response(
            {"detail": "'records' debe ser una lista con datos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = CorteFonasaRecordSerializer(data=records, many=True)
    serializer.is_valid(raise_exception=True)

    created = 0
    updated = 0
    skipped: List[Dict[str, str]] = []

    replace_mode = request.query_params.get("replace", "").lower() in {"1", "true", "yes"}

    prepared_records: List[Tuple[Dict[str, str], date | None]] = []
    months_to_replace: set[Tuple[int, int]] = set()

    for record in serializer.validated_data:
        fecha_corte = _parse_date(record.get("fehcaCorte"))
        prepared_records.append((record, fecha_corte))
        if replace_mode and fecha_corte:
            months_to_replace.add((fecha_corte.year, fecha_corte.month))

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

            defaults = {
                "nombres": _safe_str(record.get("nombres")),
                "ap_paterno": _safe_str(record.get("apPaterno")),
                "ap_materno": _safe_str(record.get("apMaterno")),
                "fecha_nacimiento": _parse_date(record.get("fechaNacimiento")),
                "genero": _safe_str(record.get("genero")),
                "tramo": _safe_str(record.get("tramo")),
                "cod_genero": _safe_str(record.get("codGenero")),
                "nombre_centro": _safe_str(record.get("nombreCentro")),
                "motivo": _safe_str(record.get("motivo")),
            }

            _, created_flag = CorteFonasa.objects.update_or_create(
                run=run_clean,
                fecha_corte=fecha_corte,
                defaults=defaults,
            )

            if created_flag:
                created += 1
            else:
                updated += 1

    totals_queryset = CorteFonasa.objects.all().annotate(
        motivo_normalized=_normalize_motivo_expression()
    )
    validated_filter = Q(motivo_normalized__in=VALIDATED_MOTIVOS)
    non_validated_filter = Q(motivo_normalized__in=NON_VALIDATED_MOTIVOS)

    total_records = totals_queryset.count()
    total_validated = totals_queryset.filter(validated_filter).count()
    total_non_validated = totals_queryset.filter(non_validated_filter).count()

    return Response(
        {
            "created": created,
            "updated": updated,
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
    
    # Serializar resultados
    serializer = NuevoUsuarioSerializer(queryset, many=True)
    
    return Response({
        "usuarios": serializer.data,
        "estadisticas": {
            "total": total,
            "pendientes": pendientes,
            "validados": validados,
            "noValidados": no_validados,
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
            "noValidados": total_no_validados
        },
        "historicoMeses": meses_data
    }, status=status.HTTP_200_OK)


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
                
                if corte and corte.motivo in VALIDATED_MOTIVOS:
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

@api_view(["GET", "POST"])
def catalogos_list(request):
    """
    GET: Lista catálogos con filtro por tipo
    POST: Crea un nuevo catálogo
    """
    if request.method == "POST":
        serializer = CatalogoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        catalogo = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # GET - Listar con filtros
    queryset = Catalogo.objects.filter(activo=True)
    
    # Filtro por tipo
    tipo = request.query_params.get("tipo")
    if tipo:
        queryset = queryset.filter(tipo=tipo.upper())
    
    serializer = CatalogoSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def catalogo_detail(request, pk: int):
    """
    GET: Obtiene detalle de un catálogo
    PATCH: Actualiza un catálogo
    DELETE: Elimina (desactiva) un catálogo
    """
    try:
        catalogo = Catalogo.objects.get(pk=pk)
    except Catalogo.DoesNotExist:
        return Response(
            {"detail": "Catálogo no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "DELETE":
        # Desactivar en lugar de eliminar
        catalogo.activo = False
        catalogo.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == "GET":
        serializer = CatalogoSerializer(catalogo)
        return Response(serializer.data)
    
    # PATCH
    serializer = CatalogoSerializer(catalogo, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def catalogos_por_tipo(request):
    """
    Obtiene todos los catálogos organizados por tipo
    """
    tipos = ['ETNIA', 'NACIONALIDAD', 'SECTOR', 'SUBSECTOR', 'ESTABLECIMIENTO']
    resultado = {}
    
    for tipo in tipos:
        catalogos = Catalogo.objects.filter(tipo=tipo, activo=True)
        serializer = CatalogoSerializer(catalogos, many=True)
        resultado[tipo.lower()] = serializer.data
    
    return Response(resultado, status=status.HTTP_200_OK)


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
                base_resumen_queryset = (
                    CorteFonasa.objects.filter(periodos_query)
                    .annotate(motivo_normalized=_normalize_motivo_expression())
                )
                resumen_validated_filter = Q(motivo_normalized__in=VALIDATED_MOTIVOS)
                resumen_non_validated_filter = Q(
                    motivo_normalized__in=NON_VALIDATED_MOTIVOS
                )

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
        data = request.data
        
        # Obtener IP del cliente
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Crear registro de historial
        historial = HistorialCarga.objects.create(
            tipo_carga=data.get('tipo_carga'),
            nombre_archivo=data.get('nombre_archivo'),
            usuario=data.get('usuario', 'Anónimo'),
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

