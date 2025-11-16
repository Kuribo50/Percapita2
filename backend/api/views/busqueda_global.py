"""
Vista de Búsqueda Global del Sistema.

Este módulo implementa un endpoint de búsqueda unificada que permite
buscar en todos los módulos del sistema de forma simultánea.

Endpoints:
    GET /api/busqueda-global/?q={query} - Búsqueda global en todo el sistema
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from api.models import (
    Usuario,
    NuevoUsuario,
    CorteFonasa,
    HpTrakcare,
    Establecimiento,
    LogActividad,
)
from typing import List, Dict, Any


@api_view(['GET'])
def busqueda_global(request):
    """
    Búsqueda global en todo el sistema.

    Query params:
        - q: Término de búsqueda (requerido)
        - limit: Límite de resultados por categoría (default 5)

    Returns:
        {
            "query": "término buscado",
            "total_results": 25,
            "results": {
                "usuarios_sistema": [...],
                "nuevos_usuarios": [...],
                "cortes_fonasa": [...],
                "hp_trakcare": [...],
                "establecimientos": [...],
                "logs": [...]
            }
        }
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Obtener parámetros
    query = request.query_params.get('q', '').strip()
    if not query or len(query) < 2:
        return Response(
            {'detail': 'Se requiere un término de búsqueda de al menos 2 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    limit = request.query_params.get('limit', 5)
    try:
        limit = int(limit)
        limit = min(limit, 20)  # Máximo 20 por categoría
    except ValueError:
        limit = 5

    usuario = request.usuario
    results = {}
    total_results = 0

    # 1. Búsqueda en Usuarios del Sistema (solo admin)
    if usuario.rol == Usuario.ROL_ADMIN:
        usuarios_sistema = Usuario.objects.filter(
            Q(username__icontains=query) |
            Q(nombre_completo__icontains=query) |
            Q(email__icontains=query)
        )[:limit]

        results['usuarios_sistema'] = [
            {
                'id': u.id,
                'tipo': 'usuario_sistema',
                'titulo': u.nombre_completo,
                'subtitulo': f'@{u.username} - {u.rol_display}',
                'url': f'/dashboard/admin/usuarios',
                'icono': 'user-cog',
                'metadata': {
                    'username': u.username,
                    'rol': u.rol,
                    'email': u.email,
                }
            }
            for u in usuarios_sistema
        ]
        total_results += len(results['usuarios_sistema'])

    # 2. Búsqueda en Nuevos Usuarios
    centros_ids = usuario.get_centros_ids()
    nuevos_usuarios_qs = NuevoUsuario.objects.all()

    if centros_ids is not None:  # No es admin
        nuevos_usuarios_qs = nuevos_usuarios_qs.filter(centro_salud_id__in=centros_ids)

    nuevos_usuarios = nuevos_usuarios_qs.filter(
        Q(run__icontains=query) |
        Q(nombre_completo__icontains=query) |
        Q(ficha__icontains=query)
    ).select_related('centro_salud')[:limit]

    results['nuevos_usuarios'] = [
        {
            'id': nu.id,
            'tipo': 'nuevo_usuario',
            'titulo': nu.nombre_completo,
            'subtitulo': f'RUN: {nu.run} - {nu.centro_salud.nombre if nu.centro_salud else "Sin centro"}',
            'url': f'/dashboard/revision-de-usuarios/nuevos-usuarios/gestion/{nu.id}',
            'icono': 'user-plus',
            'metadata': {
                'run': nu.run,
                'estado': nu.estado_inscripcion,
                'ficha': nu.ficha,
                'centro': nu.centro_salud.nombre if nu.centro_salud else None,
            }
        }
        for nu in nuevos_usuarios
    ]
    total_results += len(results['nuevos_usuarios'])

    # 3. Búsqueda en Cortes FONASA
    cortes_qs = CorteFonasa.objects.all()

    if centros_ids is not None:  # No es admin
        cortes_qs = cortes_qs.filter(centro_salud_id__in=centros_ids)

    cortes = cortes_qs.filter(
        Q(run__icontains=query) |
        Q(nombres__icontains=query) |
        Q(apellido_paterno__icontains=query) |
        Q(apellido_materno__icontains=query)
    ).select_related('centro_salud')[:limit]

    results['cortes_fonasa'] = [
        {
            'id': c.id,
            'tipo': 'corte_fonasa',
            'titulo': f'{c.nombres} {c.apellido_paterno} {c.apellido_materno}',
            'subtitulo': f'RUN: {c.run} - {c.centro_salud.nombre if c.centro_salud else "Sin centro"}',
            'url': f'/dashboard/subir-corte/gestion/{c.id}',
            'icono': 'file-text',
            'metadata': {
                'run': c.run,
                'periodo': c.periodo_mes,
                'centro': c.centro_salud.nombre if c.centro_salud else None,
            }
        }
        for c in cortes
    ]
    total_results += len(results['cortes_fonasa'])

    # 4. Búsqueda en HP Trakcare
    hp_trakcare = HpTrakcare.objects.filter(
        Q(run__icontains=query) |
        Q(nombres__icontains=query) |
        Q(apellido_paterno__icontains=query) |
        Q(apellido_materno__icontains=query)
    )[:limit]

    results['hp_trakcare'] = [
        {
            'id': hp.id,
            'tipo': 'hp_trakcare',
            'titulo': f'{hp.nombres} {hp.apellido_paterno} {hp.apellido_materno}',
            'subtitulo': f'RUN: {hp.run} - Ficha: {hp.ficha or "N/A"}',
            'url': f'/dashboard/bases/trakcare',
            'icono': 'database',
            'metadata': {
                'run': hp.run,
                'ficha': hp.ficha,
                'tipo_ingreso': hp.tipo_ingreso,
            }
        }
        for hp in hp_trakcare
    ]
    total_results += len(results['hp_trakcare'])

    # 5. Búsqueda en Establecimientos
    establecimientos = Establecimiento.objects.filter(
        Q(nombre__icontains=query) |
        Q(codigo__icontains=query)
    )[:limit]

    results['establecimientos'] = [
        {
            'id': e.id,
            'tipo': 'establecimiento',
            'titulo': e.nombre,
            'subtitulo': f'Código: {e.codigo}',
            'url': f'/dashboard/configuracion',
            'icono': 'building',
            'metadata': {
                'codigo': e.codigo,
                'sector': e.sector.nombre if e.sector else None,
            }
        }
        for e in establecimientos
    ]
    total_results += len(results['establecimientos'])

    # 6. Búsqueda en Logs (solo admin)
    if usuario.rol == Usuario.ROL_ADMIN:
        logs = LogActividad.objects.filter(
            Q(descripcion__icontains=query) |
            Q(usuario__username__icontains=query) |
            Q(usuario__nombre_completo__icontains=query)
        ).select_related('usuario')[:limit]

        results['logs'] = [
            {
                'id': log.id,
                'tipo': 'log',
                'titulo': log.descripcion,
                'subtitulo': f'{log.usuario.nombre_completo if log.usuario else "Sistema"} - {log.get_accion_display()}',
                'url': f'/dashboard/admin/logs',
                'icono': 'activity',
                'metadata': {
                    'accion': log.accion,
                    'modulo': log.modulo,
                    'timestamp': log.timestamp.isoformat(),
                }
            }
            for log in logs
        ]
        total_results += len(results['logs'])

    return Response({
        'query': query,
        'total_results': total_results,
        'results': results
    })
