"""
Vistas de Búsqueda de Usuarios y Familias.

Este módulo contiene las vistas para buscar usuarios por RUN y buscar familias
completas en el sistema.

Funcionalidad:
    - Búsqueda integral de un usuario por RUN en todas las tablas
    - Búsqueda de grupo familiar completo por RUN de un miembro
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import CorteFonasa, HpTrakcare, NuevoUsuario, normalize_run
from .utils import is_validated_corte, format_month_label


@api_view(["GET"])
def buscar_usuario(request):
    """
    Busca un usuario por RUT y retorna toda la información relacionada.

    Busca en todas las tablas del sistema:
    - Datos de CorteFonasa (todos los registros por mes)
    - Datos de HpTrakcare
    - Datos de NuevoUsuario
    - Observaciones asociadas
    - Estado de validación por mes

    Parámetros:
        run (str): RUN del usuario a buscar (query parameter)

    Returns:
        Response con:
            - run: RUN normalizado buscado
            - encontrado: Boolean indicando si se encontró
            - cortes_por_mes: Lista de registros agrupados por mes
            - hp_trakcare: Datos de HP Trakcare (si existen)
            - nuevos_usuarios: Lista de registros de nuevos usuarios
            - total_meses: Total de meses con registros
            - total_nuevos_usuarios: Total de registros de nuevos usuarios

    Ejemplo:
        GET /api/buscar-usuario/?run=12345678-9
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
        mes_label = format_month_label(corte.fecha_corte.year, corte.fecha_corte.month)

        if mes_key not in cortes_por_mes:
            cortes_por_mes[mes_key] = {
                "mes": mes_label,
                "fecha_corte": corte.fecha_corte.isoformat(),
                "registros": [],
                "validado": None,
                "observaciones": []
            }

        # Determinar si está validado
        es_validado = is_validated_corte(corte.aceptado_rechazado, corte.motivo)

        # Actualizar estado de validación del mes
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

    Retorna todos los usuarios que comparten el mismo cod_familia en HpTrakcare,
    junto con información resumida de sus cortes FONASA.

    Parámetros:
        run (str): RUN de cualquier miembro de la familia (query parameter)

    Returns:
        Response con:
            - run: RUN normalizado buscado
            - encontrado: Boolean indicando si se encontró la familia
            - cod_familia: Código de familia
            - total_miembros: Total de miembros encontrados
            - miembros: Lista de miembros con información resumida

    Ejemplo:
        GET /api/buscar-familia/?run=12345678-9
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
            tiene_validados = is_validated_corte(ultimo_corte.aceptado_rechazado, ultimo_corte.motivo)

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
