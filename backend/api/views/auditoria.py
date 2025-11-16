"""
Vistas para Sistema de Auditoría y Notificaciones.

Este módulo contiene las vistas para:
- Consultar logs de actividad del sistema
- Gestionar notificaciones de usuarios

Endpoints:
    GET    /api/logs/                  - Listar logs (con filtros)
    GET    /api/logs/{id}/             - Ver detalle de log
    GET    /api/notificaciones/        - Listar notificaciones del usuario
    POST   /api/notificaciones/{id}/marcar-leida/  - Marcar como leída
    POST   /api/notificaciones/marcar-todas-leidas/ - Marcar todas como leídas
    GET    /api/notificaciones/count/  - Contar no leídas
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from api.models import LogActividad, Notificacion, Usuario
from datetime import datetime, timedelta
from typing import Optional


def get_client_ip(request) -> str:
    """
    Obtiene la IP del cliente desde la request.

    Args:
        request: HttpRequest object

    Returns:
        IP address del cliente
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['GET'])
def logs_list(request):
    """
    Lista logs de actividad con filtros opcionales.

    Query params:
        - usuario_id: Filtrar por usuario
        - accion: Filtrar por tipo de acción
        - modulo: Filtrar por módulo
        - fecha_desde: Filtrar desde fecha (YYYY-MM-DD)
        - fecha_hasta: Filtrar hasta fecha (YYYY-MM-DD)
        - search: Búsqueda en descripción
        - limit: Número de resultados (default 50, max 500)

    Solo accesible por ADMIN.
    """
    # Verificar que el usuario sea admin
    if not hasattr(request, 'usuario') or request.usuario.rol != Usuario.ROL_ADMIN:
        return Response(
            {'detail': 'Solo los administradores pueden ver logs del sistema'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Comenzar con todos los logs
    queryset = LogActividad.objects.all().select_related('usuario')

    # Filtrar por usuario
    usuario_id = request.query_params.get('usuario_id')
    if usuario_id:
        queryset = queryset.filter(usuario_id=usuario_id)

    # Filtrar por acción
    accion = request.query_params.get('accion')
    if accion:
        queryset = queryset.filter(accion=accion)

    # Filtrar por módulo
    modulo = request.query_params.get('modulo')
    if modulo:
        queryset = queryset.filter(modulo=modulo)

    # Filtrar por rango de fechas
    fecha_desde = request.query_params.get('fecha_desde')
    if fecha_desde:
        try:
            fecha_desde_dt = datetime.strptime(fecha_desde, '%Y-%m-%d')
            queryset = queryset.filter(timestamp__gte=fecha_desde_dt)
        except ValueError:
            pass

    fecha_hasta = request.query_params.get('fecha_hasta')
    if fecha_hasta:
        try:
            fecha_hasta_dt = datetime.strptime(fecha_hasta, '%Y-%m-%d')
            # Incluir todo el día
            fecha_hasta_dt = fecha_hasta_dt.replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(timestamp__lte=fecha_hasta_dt)
        except ValueError:
            pass

    # Búsqueda en descripción
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(descripcion__icontains=search)

    # Limitar resultados
    limit = request.query_params.get('limit', 50)
    try:
        limit = int(limit)
        limit = min(limit, 500)  # Máximo 500
    except ValueError:
        limit = 50

    # Ordenar por más recientes primero
    queryset = queryset.order_by('-timestamp')[:limit]

    # Serializar logs
    logs_data = []
    for log in queryset:
        logs_data.append({
            'id': log.id,
            'usuario': {
                'id': log.usuario.id if log.usuario else None,
                'username': log.usuario.username if log.usuario else 'Sistema',
                'nombre_completo': log.usuario.nombre_completo if log.usuario else 'Sistema',
            } if log.usuario else {'username': 'Sistema', 'nombre_completo': 'Sistema'},
            'accion': log.accion,
            'accion_display': log.get_accion_display(),
            'modulo': log.modulo,
            'modulo_display': log.get_modulo_display(),
            'descripcion': log.descripcion,
            'objeto_tipo': log.objeto_tipo,
            'objeto_id': log.objeto_id,
            'objeto_str': log.objeto_str,
            'cambios': log.cambios,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'timestamp': log.timestamp.isoformat(),
        })

    return Response({
        'count': len(logs_data),
        'results': logs_data
    })


@api_view(['GET'])
def log_detail(request, pk):
    """
    Obtiene el detalle de un log específico.

    Solo accesible por ADMIN.
    """
    # Verificar que el usuario sea admin
    if not hasattr(request, 'usuario') or request.usuario.rol != Usuario.ROL_ADMIN:
        return Response(
            {'detail': 'Solo los administradores pueden ver logs del sistema'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Obtener log
    try:
        log = LogActividad.objects.select_related('usuario').get(pk=pk)
    except LogActividad.DoesNotExist:
        return Response(
            {'detail': 'Log no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Serializar log
    return Response({
        'id': log.id,
        'usuario': {
            'id': log.usuario.id if log.usuario else None,
            'username': log.usuario.username if log.usuario else 'Sistema',
            'nombre_completo': log.usuario.nombre_completo if log.usuario else 'Sistema',
        } if log.usuario else {'username': 'Sistema', 'nombre_completo': 'Sistema'},
        'accion': log.accion,
        'accion_display': log.get_accion_display(),
        'modulo': log.modulo,
        'modulo_display': log.get_modulo_display(),
        'descripcion': log.descripcion,
        'objeto_tipo': log.objeto_tipo,
        'objeto_id': log.objeto_id,
        'objeto_str': log.objeto_str,
        'cambios': log.cambios,
        'ip_address': log.ip_address,
        'user_agent': log.user_agent,
        'timestamp': log.timestamp.isoformat(),
    })


@api_view(['GET'])
def notificaciones_list(request):
    """
    Lista las notificaciones del usuario actual.

    Query params:
        - leidas: 'true' para solo leídas, 'false' para solo no leídas (opcional)
        - limit: Número de resultados (default 50)
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Comenzar con notificaciones del usuario
    queryset = Notificacion.objects.filter(usuario=request.usuario)

    # Filtrar por leídas/no leídas
    leidas = request.query_params.get('leidas')
    if leidas is not None:
        leidas_bool = leidas.lower() == 'true'
        queryset = queryset.filter(leida=leidas_bool)

    # Limitar resultados
    limit = request.query_params.get('limit', 50)
    try:
        limit = int(limit)
    except ValueError:
        limit = 50

    # Ordenar por más recientes primero
    queryset = queryset.order_by('-timestamp')[:limit]

    # Serializar notificaciones
    notificaciones_data = []
    for notif in queryset:
        notificaciones_data.append({
            'id': notif.id,
            'tipo': notif.tipo,
            'titulo': notif.titulo,
            'mensaje': notif.mensaje,
            'leida': notif.leida,
            'url': notif.url,
            'datos': notif.datos,
            'timestamp': notif.timestamp.isoformat(),
        })

    return Response({
        'count': len(notificaciones_data),
        'results': notificaciones_data
    })


@api_view(['POST'])
def marcar_notificacion_leida(request, pk):
    """
    Marca una notificación como leída.
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Obtener notificación (solo del usuario actual)
    try:
        notificacion = Notificacion.objects.get(pk=pk, usuario=request.usuario)
    except Notificacion.DoesNotExist:
        return Response(
            {'detail': 'Notificación no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Marcar como leída
    notificacion.marcar_leida()

    return Response({
        'mensaje': 'Notificación marcada como leída',
        'id': notificacion.id
    })


@api_view(['POST'])
def marcar_todas_leidas(request):
    """
    Marca todas las notificaciones del usuario como leídas.
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Actualizar todas las notificaciones no leídas
    count = Notificacion.objects.filter(
        usuario=request.usuario,
        leida=False
    ).update(leida=True)

    return Response({
        'mensaje': f'{count} notificaciones marcadas como leídas',
        'count': count
    })


@api_view(['GET'])
def notificaciones_no_leidas_count(request):
    """
    Retorna el número de notificaciones no leídas del usuario.
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Contar notificaciones no leídas
    count = Notificacion.objects.filter(
        usuario=request.usuario,
        leida=False
    ).count()

    return Response({
        'count': count
    })


@api_view(['GET'])
def acciones_disponibles(request):
    """
    Retorna la lista de acciones disponibles para filtros.
    """
    acciones = [
        {'value': accion[0], 'label': accion[1]}
        for accion in LogActividad.ACCIONES
    ]
    return Response(acciones)


@api_view(['GET'])
def modulos_disponibles(request):
    """
    Retorna la lista de módulos disponibles para filtros.
    """
    modulos = [
        {'value': modulo[0], 'label': modulo[1]}
        for modulo in LogActividad.MODULOS
    ]
    return Response(modulos)
