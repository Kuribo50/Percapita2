"""
Vistas para Generación de Reportes PDF.

Este módulo proporciona endpoints para generar reportes
en formato PDF con diferentes tipos de información.

Endpoints:
    GET /api/reportes/estadisticas/ - Reporte de estadísticas generales
    GET /api/reportes/usuarios/ - Listado de usuarios
    GET /api/reportes/logs/ - Reporte de logs de auditoría
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.db.models import Count, Q
from api.models import (
    Usuario,
    NuevoUsuario,
    CorteFonasa,
    LogActividad,
    Establecimiento,
)
from api.utils.pdf_generator import pdf_generator
from datetime import datetime


@api_view(['GET'])
def reporte_estadisticas_pdf(request):
    """
    Genera reporte PDF de estadísticas generales.

    Query params:
        - centro_id: Filtrar por centro específico (opcional)

    Returns:
        PDF file con estadísticas del sistema
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not pdf_generator:
        return Response(
            {'detail': 'Sistema de generación de PDFs no disponible. Instala reportlab.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    usuario = request.usuario
    centro_id = request.query_params.get('centro_id')

    # Obtener datos estadísticos
    try:
        # Filtrar por centros del usuario
        nuevos_usuarios_qs = NuevoUsuario.objects.all()
        centros_ids = usuario.get_centros_ids()

        if centros_ids is not None:  # No es admin
            nuevos_usuarios_qs = nuevos_usuarios_qs.filter(centro_salud_id__in=centros_ids)

        if centro_id:
            nuevos_usuarios_qs = nuevos_usuarios_qs.filter(centro_salud_id=centro_id)

        # Estadísticas generales
        total_usuarios = nuevos_usuarios_qs.count()
        usuarios_validados = nuevos_usuarios_qs.filter(estado_inscripcion='VALIDADO').count()
        usuarios_no_validados = nuevos_usuarios_qs.filter(estado_inscripcion='NO_VALIDADO').count()

        # Nuevos este mes
        now = datetime.now()
        primer_dia_mes = datetime(now.year, now.month, 1)
        nuevos_mes = nuevos_usuarios_qs.filter(fecha_inscripcion__gte=primer_dia_mes).count()

        # Distribución por centro
        por_centro = []
        if centros_ids is None:  # Es admin
            centros = Establecimiento.objects.all()
        else:
            centros = Establecimiento.objects.filter(id__in=centros_ids)

        for centro in centros:
            usuarios_centro = NuevoUsuario.objects.filter(centro_salud=centro)
            por_centro.append({
                'nombre': centro.nombre,
                'total': usuarios_centro.count(),
                'validados': usuarios_centro.filter(estado_inscripcion='VALIDADO').count(),
                'no_validados': usuarios_centro.filter(estado_inscripcion='NO_VALIDADO').count(),
            })

        data = {
            'total_usuarios': total_usuarios,
            'usuarios_validados': usuarios_validados,
            'usuarios_no_validados': usuarios_no_validados,
            'nuevos_mes': nuevos_mes,
            'por_centro': por_centro,
        }

        # Generar PDF
        pdf_buffer = pdf_generator.generate_estadisticas_report(data)

        # Crear respuesta HTTP
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f'estadisticas_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        return Response(
            {'detail': f'Error generando reporte: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def reporte_usuarios_pdf(request):
    """
    Genera reporte PDF con listado de usuarios.

    Query params:
        - centro_id: Filtrar por centro
        - estado: Filtrar por estado (VALIDADO, NO_VALIDADO, etc.)
        - fecha_desde: Filtrar desde fecha
        - fecha_hasta: Filtrar hasta fecha

    Returns:
        PDF file con listado de usuarios
    """
    # Verificar autenticación
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not pdf_generator:
        return Response(
            {'detail': 'Sistema de generación de PDFs no disponible. Instala reportlab.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    usuario = request.usuario

    try:
        # Obtener parámetros
        centro_id = request.query_params.get('centro_id')
        estado = request.query_params.get('estado')
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')

        # Query base
        usuarios_qs = NuevoUsuario.objects.all().select_related('centro_salud')

        # Filtrar por centros del usuario
        centros_ids = usuario.get_centros_ids()
        if centros_ids is not None:
            usuarios_qs = usuarios_qs.filter(centro_salud_id__in=centros_ids)

        # Aplicar filtros
        filters = {}
        if centro_id:
            usuarios_qs = usuarios_qs.filter(centro_salud_id=centro_id)
            filters['Centro'] = Establecimiento.objects.get(id=centro_id).nombre

        if estado:
            usuarios_qs = usuarios_qs.filter(estado_inscripcion=estado)
            filters['Estado'] = estado

        if fecha_desde:
            usuarios_qs = usuarios_qs.filter(fecha_inscripcion__gte=fecha_desde)
            filters['Desde'] = fecha_desde

        if fecha_hasta:
            usuarios_qs = usuarios_qs.filter(fecha_inscripcion__lte=fecha_hasta)
            filters['Hasta'] = fecha_hasta

        # Preparar datos para el reporte
        usuarios_data = []
        for usuario_obj in usuarios_qs[:500]:  # Limitar a 500
            usuarios_data.append({
                'run': usuario_obj.run,
                'nombre_completo': usuario_obj.nombre_completo,
                'centro': usuario_obj.centro_salud.nombre if usuario_obj.centro_salud else 'Sin centro',
                'estado': usuario_obj.estado_inscripcion,
            })

        # Generar PDF
        pdf_buffer = pdf_generator.generate_usuarios_list_report(usuarios_data, filters)

        # Crear respuesta HTTP
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f'usuarios_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        return Response(
            {'detail': f'Error generando reporte: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def reporte_logs_pdf(request):
    """
    Genera reporte PDF de logs de auditoría.

    Solo accesible para administradores.

    Query params:
        - fecha_desde: Filtrar desde fecha
        - fecha_hasta: Filtrar hasta fecha
        - accion: Filtrar por tipo de acción

    Returns:
        PDF file con logs de auditoría
    """
    # Verificar autenticación y permisos
    if not hasattr(request, 'usuario'):
        return Response(
            {'detail': 'No autenticado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if request.usuario.rol != Usuario.ROL_ADMIN:
        return Response(
            {'detail': 'Solo los administradores pueden generar reportes de logs'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not pdf_generator:
        return Response(
            {'detail': 'Sistema de generación de PDFs no disponible. Instala reportlab.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        # Obtener parámetros
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        accion = request.query_params.get('accion')

        # Query base
        logs_qs = LogActividad.objects.all().select_related('usuario')

        # Aplicar filtros
        filters = {}
        if fecha_desde:
            logs_qs = logs_qs.filter(timestamp__gte=fecha_desde)
            filters['Desde'] = fecha_desde

        if fecha_hasta:
            logs_qs = logs_qs.filter(timestamp__lte=fecha_hasta)
            filters['Hasta'] = fecha_hasta

        if accion:
            logs_qs = logs_qs.filter(accion=accion)
            filters['Acción'] = accion

        # Ordenar y limitar
        logs_qs = logs_qs.order_by('-timestamp')[:200]

        # Preparar datos para el reporte
        logs_data = []
        for log in logs_qs:
            logs_data.append({
                'timestamp': log.timestamp.strftime('%d/%m/%Y %H:%M'),
                'usuario': log.usuario.nombre_completo if log.usuario else 'Sistema',
                'accion': log.get_accion_display(),
                'descripcion': log.descripcion[:100],  # Limitar longitud
            })

        # Generar PDF (reutilizando el método de usuarios por ahora)
        # En producción, crearías un método específico para logs
        pdf_buffer = pdf_generator.generate_usuarios_list_report(logs_data, filters)

        # Crear respuesta HTTP
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f'logs_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        return Response(
            {'detail': f'Error generando reporte: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
