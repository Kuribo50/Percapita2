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
from api.models import Usuario, Establecimiento
from typing import List, Dict, Any


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
        if usuario.rol != Usuario.ROL_ADMIN and 'centros_ids' in data:
            centros_ids = data['centros_ids']
            centros = Establecimiento.objects.filter(id__in=centros_ids)
            usuario.centros.set(centros)

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

        # No permitir cambiar el username
        if 'nombre_completo' in data:
            usuario.nombre_completo = data['nombre_completo']
        if 'email' in data:
            usuario.email = data['email']
        if 'rol' in data:
            roles_validos = [Usuario.ROL_ADMIN, Usuario.ROL_INFORMATICO, Usuario.ROL_ADMINISTRATIVO]
            if data['rol'] not in roles_validos:
                return Response(
                    {'detail': f'Rol inválido. Debe ser uno de: {", ".join(roles_validos)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.rol = data['rol']
        if 'activo' in data:
            usuario.activo = data['activo']

        usuario.modificado_por = request.usuario
        usuario.save()

        # Actualizar centros (solo para no-admin)
        if usuario.rol != Usuario.ROL_ADMIN and 'centros_ids' in data:
            centros_ids = data['centros_ids']
            centros = Establecimiento.objects.filter(id__in=centros_ids)
            usuario.centros.set(centros)

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

        username = usuario.username
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

    # Asignar centros
    usuario.centros.set(centros)
    usuario.modificado_por = request.usuario
    usuario.save()

    return Response({
        'mensaje': f'Centros asignados exitosamente a {usuario.username}',
        'centros': [c.nombre for c in centros]
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
