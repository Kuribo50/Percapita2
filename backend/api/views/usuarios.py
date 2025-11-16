"""
Vistas para Gestión de Usuarios del Sistema (Solo Admin).

Este módulo contiene las vistas para gestionar usuarios del sistema,
incluyendo creación, edición, eliminación y asignación de centros.

Solo accesible por usuarios con rol ADMIN.

Endpoints:
    GET    /api/usuarios/              - Listar usuarios
    POST   /api/usuarios/              - Crear usuario
    GET    /api/usuarios/{id}/         - Ver detalle de usuario
    PUT    /api/usuarios/{id}/         - Actualizar usuario
    DELETE /api/usuarios/{id}/         - Eliminar usuario
    POST   /api/usuarios/{id}/restablecer-password/  - Restablecer contraseña
    POST   /api/usuarios/{id}/asignar-centros/       - Asignar centros
"""

from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from api.models import Usuario, Establecimiento, LogActividad
from typing import List, Dict, Any


def get_client_ip(request) -> str:
    """Obtiene la IP del cliente desde la request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['GET', 'POST'])
def usuarios_list(request):
    """
    Lista todos los usuarios o crea uno nuevo.

    GET:
        Retorna lista de todos los usuarios del sistema.
        Solo accesible por ADMIN.

    POST:
        Crea un nuevo usuario.
        Solo accesible por ADMIN.

        Body:
            {
                "username": "string",
                "password": "string",
                "nombre_completo": "string",
                "email": "string",
                "rol": "ADMIN|INFORMATICO|ADMINISTRATIVO",
                "centros_ids": [1, 2, 3],
                "activo": true
            }
    """
    # Verificar que el usuario sea admin
    if not hasattr(request, 'usuario') or not request.usuario.puede_gestionar_usuarios():
        return Response(
            {'detail': 'No tienes permisos para gestionar usuarios'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        # Listar usuarios
        usuarios = Usuario.objects.all().order_by('nombre_completo')

        # Serializar usuarios manualmente
        usuarios_data = []
        for usuario in usuarios:
            usuarios_data.append({
                'id': usuario.id,
                'username': usuario.username,
                'nombre_completo': usuario.nombre_completo,
                'email': usuario.email,
                'rol': usuario.rol,
                'rol_display': usuario.rol_display,
                'centros': [
                    {'id': c.id, 'nombre': c.nombre}
                    for c in usuario.centros.all()
                ],
                'centros_nombres': usuario.centros_nombres,
                'activo': usuario.activo,
                'es_admin': usuario.es_admin,
                'ultimo_acceso': usuario.ultimo_acceso,
                'creado_el': usuario.creado_el,
                'creado_por': usuario.creado_por.nombre_completo if usuario.creado_por else None,
            })

        return Response(usuarios_data)

    elif request.method == 'POST':
        # Crear nuevo usuario
        data = request.data

        # Validar campos requeridos
        if not all(k in data for k in ['username', 'password', 'nombre_completo', 'rol']):
            return Response(
                {'detail': 'Faltan campos requeridos: username, password, nombre_completo, rol'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que el username no exista
        if Usuario.objects.filter(username=data['username']).exists():
            return Response(
                {'detail': 'El nombre de usuario ya existe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar rol válido
        roles_validos = [Usuario.ROL_ADMIN, Usuario.ROL_INFORMATICO, Usuario.ROL_ADMINISTRATIVO]
        if data['rol'] not in roles_validos:
            return Response(
                {'detail': f'Rol inválido. Debe ser uno de: {", ".join(roles_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear usuario
        usuario = Usuario(
            username=data['username'],
            nombre_completo=data['nombre_completo'],
            email=data.get('email', ''),
            rol=data['rol'],
            activo=data.get('activo', True),
            creado_por=request.usuario
        )
        usuario.set_password(data['password'])
        usuario.save()

        # Asignar centros si se proporcionan (solo para no-admin)
        centros_asignados = []
        if usuario.rol != Usuario.ROL_ADMIN and 'centros_ids' in data:
            centros_ids = data['centros_ids']
            centros = Establecimiento.objects.filter(id__in=centros_ids)
            usuario.centros.set(centros)
            centros_asignados = [c.nombre for c in centros]

        # Registrar en log de auditoría
        LogActividad.registrar(
            usuario=request.usuario,
            accion=LogActividad.ACCION_CREAR,
            modulo=LogActividad.MODULO_USUARIOS,
            descripcion=f'Creó el usuario {usuario.username} ({usuario.nombre_completo}) con rol {usuario.rol_display}',
            objeto_tipo='Usuario',
            objeto_id=usuario.id,
            objeto_str=str(usuario),
            cambios={
                'username': usuario.username,
                'nombre_completo': usuario.nombre_completo,
                'rol': usuario.rol,
                'centros': centros_asignados,
                'activo': usuario.activo,
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response(
            {
                'id': usuario.id,
                'username': usuario.username,
                'nombre_completo': usuario.nombre_completo,
                'rol': usuario.rol,
                'rol_display': usuario.rol_display,
                'mensaje': 'Usuario creado exitosamente'
            },
            status=status.HTTP_201_CREATED
        )


@api_view(['GET', 'PUT', 'DELETE'])
def usuario_detail(request, pk):
    """
    Obtiene, actualiza o elimina un usuario específico.

    GET:
        Retorna los detalles de un usuario.

    PUT:
        Actualiza un usuario existente.
        Body:
            {
                "nombre_completo": "string",
                "email": "string",
                "rol": "ADMIN|INFORMATICO|ADMINISTRATIVO",
                "centros_ids": [1, 2, 3],
                "activo": true
            }

    DELETE:
        Elimina un usuario (solo si no tiene registros asociados).
    """
    # Verificar permisos
    if not hasattr(request, 'usuario') or not request.usuario.puede_gestionar_usuarios():
        return Response(
            {'detail': 'No tienes permisos para gestionar usuarios'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Obtener usuario
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response(
            {'detail': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        # Retornar detalles
        return Response({
            'id': usuario.id,
            'username': usuario.username,
            'nombre_completo': usuario.nombre_completo,
            'email': usuario.email,
            'rol': usuario.rol,
            'rol_display': usuario.rol_display,
            'centros': [
                {'id': c.id, 'nombre': c.nombre}
                for c in usuario.centros.all()
            ],
            'centros_nombres': usuario.centros_nombres,
            'activo': usuario.activo,
            'es_admin': usuario.es_admin,
            'ultimo_acceso': usuario.ultimo_acceso,
            'creado_el': usuario.creado_el,
            'creado_por': usuario.creado_por.nombre_completo if usuario.creado_por else None,
        })

    elif request.method == 'PUT':
        # Actualizar usuario
        data = request.data

        # Guardar valores anteriores para el log
        cambios = {}

        # No permitir cambiar el username
        if 'nombre_completo' in data and data['nombre_completo'] != usuario.nombre_completo:
            cambios['nombre_completo'] = {'antes': usuario.nombre_completo, 'despues': data['nombre_completo']}
            usuario.nombre_completo = data['nombre_completo']
        if 'email' in data and data['email'] != usuario.email:
            cambios['email'] = {'antes': usuario.email, 'despues': data['email']}
            usuario.email = data['email']
        if 'rol' in data and data['rol'] != usuario.rol:
            roles_validos = [Usuario.ROL_ADMIN, Usuario.ROL_INFORMATICO, Usuario.ROL_ADMINISTRATIVO]
            if data['rol'] not in roles_validos:
                return Response(
                    {'detail': f'Rol inválido. Debe ser uno de: {", ".join(roles_validos)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cambios['rol'] = {'antes': usuario.rol, 'despues': data['rol']}
            usuario.rol = data['rol']
        if 'activo' in data and data['activo'] != usuario.activo:
            cambios['activo'] = {'antes': usuario.activo, 'despues': data['activo']}
            usuario.activo = data['activo']

        usuario.modificado_por = request.usuario
        usuario.save()

        # Actualizar centros (solo para no-admin)
        if usuario.rol != Usuario.ROL_ADMIN and 'centros_ids' in data:
            centros_ids = data['centros_ids']
            centros = Establecimiento.objects.filter(id__in=centros_ids)
            usuario.centros.set(centros)

        # Registrar en log si hubo cambios
        if cambios:
            LogActividad.registrar(
                usuario=request.usuario,
                accion=LogActividad.ACCION_EDITAR,
                modulo=LogActividad.MODULO_USUARIOS,
                descripcion=f'Actualizó el usuario {usuario.username} ({usuario.nombre_completo})',
                objeto_tipo='Usuario',
                objeto_id=usuario.id,
                objeto_str=str(usuario),
                cambios=cambios,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

        return Response({
            'id': usuario.id,
            'username': usuario.username,
            'nombre_completo': usuario.nombre_completo,
            'rol': usuario.rol,
            'rol_display': usuario.rol_display,
            'mensaje': 'Usuario actualizado exitosamente'
        })

    elif request.method == 'DELETE':
        # Eliminar usuario
        # Verificar que no sea el propio usuario
        if usuario.id == request.usuario.id:
            return Response(
                {'detail': 'No puedes eliminar tu propio usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar info para el log antes de eliminar
        username = usuario.username
        nombre_completo = usuario.nombre_completo
        usuario_id = usuario.id

        # Registrar en log antes de eliminar
        LogActividad.registrar(
            usuario=request.usuario,
            accion=LogActividad.ACCION_ELIMINAR,
            modulo=LogActividad.MODULO_USUARIOS,
            descripcion=f'Eliminó el usuario {username} ({nombre_completo})',
            objeto_tipo='Usuario',
            objeto_id=usuario_id,
            objeto_str=f'{nombre_completo} ({username})',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        usuario.delete()

        return Response({
            'mensaje': f'Usuario {username} eliminado exitosamente'
        })


@api_view(['POST'])
def restablecer_password(request, pk):
    """
    Restablece la contraseña de un usuario (Solo ADMIN).

    POST:
        Body:
            {
                "nueva_password": "string"
            }
    """
    # Verificar permisos
    if not hasattr(request, 'usuario') or not request.usuario.puede_restablecer_password():
        return Response(
            {'detail': 'No tienes permisos para restablecer contraseñas'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Obtener usuario
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response(
            {'detail': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Validar nueva contraseña
    if 'nueva_password' not in request.data:
        return Response(
            {'detail': 'Se requiere el campo nueva_password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    nueva_password = request.data['nueva_password']

    # Validar longitud mínima
    if len(nueva_password) < 6:
        return Response(
            {'detail': 'La contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Restablecer contraseña
    usuario.set_password(nueva_password)
    usuario.modificado_por = request.usuario
    usuario.save()

    # Registrar en log
    LogActividad.registrar(
        usuario=request.usuario,
        accion=LogActividad.ACCION_RESTABLECER_PASSWORD,
        modulo=LogActividad.MODULO_USUARIOS,
        descripcion=f'Restableció la contraseña del usuario {usuario.username} ({usuario.nombre_completo})',
        objeto_tipo='Usuario',
        objeto_id=usuario.id,
        objeto_str=str(usuario),
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    return Response({
        'mensaje': f'Contraseña restablecida exitosamente para {usuario.username}'
    })


@api_view(['POST'])
def asignar_centros(request, pk):
    """
    Asigna centros a un usuario (Solo ADMIN).

    POST:
        Body:
            {
                "centros_ids": [1, 2, 3]
            }
    """
    # Verificar permisos
    if not hasattr(request, 'usuario') or not request.usuario.puede_gestionar_usuarios():
        return Response(
            {'detail': 'No tienes permisos para asignar centros'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Obtener usuario
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response(
            {'detail': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    # No se pueden asignar centros a admin
    if usuario.rol == Usuario.ROL_ADMIN:
        return Response(
            {'detail': 'Los administradores tienen acceso a todos los centros automáticamente'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validar centros_ids
    if 'centros_ids' not in request.data:
        return Response(
            {'detail': 'Se requiere el campo centros_ids'},
            status=status.HTTP_400_BAD_REQUEST
        )

    centros_ids = request.data['centros_ids']

    # Validar que los centros existan
    centros = Establecimiento.objects.filter(id__in=centros_ids)
    if centros.count() != len(centros_ids):
        return Response(
            {'detail': 'Algunos centros especificados no existen'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Guardar centros anteriores
    centros_anteriores = list(usuario.centros.values_list('nombre', flat=True))

    # Asignar centros
    usuario.centros.set(centros)
    usuario.modificado_por = request.usuario
    usuario.save()

    centros_nuevos = [c.nombre for c in centros]

    # Registrar en log
    LogActividad.registrar(
        usuario=request.usuario,
        accion=LogActividad.ACCION_ASIGNAR_CENTROS,
        modulo=LogActividad.MODULO_USUARIOS,
        descripcion=f'Asignó centros al usuario {usuario.username} ({usuario.nombre_completo})',
        objeto_tipo='Usuario',
        objeto_id=usuario.id,
        objeto_str=str(usuario),
        cambios={
            'centros': {
                'antes': centros_anteriores,
                'despues': centros_nuevos
            }
        },
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    return Response({
        'mensaje': f'Centros asignados exitosamente a {usuario.username}',
        'centros': centros_nuevos
    })


@api_view(['GET'])
def roles_disponibles(request):
    """
    Retorna la lista de roles disponibles en el sistema.

    GET:
        Returns:
            [
                {"value": "ADMIN", "label": "Administrador"},
                {"value": "INFORMATICO", "label": "Informático"},
                {"value": "ADMINISTRATIVO", "label": "Administrativo"}
            ]
    """
    roles = [
        {'value': rol[0], 'label': rol[1]}
        for rol in Usuario.ROLES
    ]
    return Response(roles)
