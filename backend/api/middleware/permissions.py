"""
Middleware de Permisos y Filtrado por Centro.

Este middleware aplica automáticamente filtros por centro según el rol
del usuario autenticado. Los usuarios no-admin solo ven datos de sus
centros asignados.

Funcionalidades:
    - Inyecta automáticamente el usuario en las request
    - Proporciona helpers para filtrado por centro
    - Valida permisos de escritura
"""

from typing import Optional, List
from django.http import HttpRequest
from api.models import Usuario


class CentrosPermissionsMixin:
    """
    Mixin para aplicar filtros de centros en ViewSets.

    Uso:
        class MiViewSet(CentrosPermissionsMixin, viewsets.ModelViewSet):
            queryset = MiModelo.objects.all()
            centro_field = 'centro_salud'  # Campo que relaciona con centro

            def get_queryset(self):
                qs = super().get_queryset()
                return self.filtrar_por_centros_usuario(qs)
    """

    centro_field = 'centro_salud'  # Sobreescribir en cada ViewSet

    def filtrar_por_centros_usuario(self, queryset):
        """
        Filtra el queryset por los centros del usuario.

        Args:
            queryset: QuerySet a filtrar

        Returns:
            QuerySet filtrado por centros del usuario
        """
        usuario = self.get_usuario_actual()
        if not usuario:
            return queryset.none()

        # Admin ve todo
        if usuario.rol == Usuario.ROL_ADMIN:
            return queryset

        # Otros roles: solo sus centros
        centros_ids = usuario.get_centros_ids()
        if not centros_ids:
            return queryset.none()

        # Aplicar filtro dinámico según el campo configurado
        filter_kwargs = {f'{self.centro_field}__in': centros_ids}
        return queryset.filter(**filter_kwargs)

    def get_usuario_actual(self) -> Optional[Usuario]:
        """
        Obtiene el usuario actual de la request.

        Returns:
            Usuario actual o None si no está autenticado
        """
        # Obtener de la request (inyectado por middleware de autenticación)
        if hasattr(self.request, 'usuario'):
            return self.request.usuario
        return None

    def puede_crear(self) -> bool:
        """
        Verifica si el usuario puede crear registros.

        Returns:
            True si tiene permisos de creación
        """
        usuario = self.get_usuario_actual()
        if not usuario:
            return False

        # Admin puede crear siempre
        if usuario.rol == Usuario.ROL_ADMIN:
            return True

        # Informático puede crear en sus centros
        if usuario.rol == Usuario.ROL_INFORMATICO:
            return True

        # Administrativo solo puede crear nuevos usuarios, no cortes
        return False

    def puede_editar(self, obj) -> bool:
        """
        Verifica si el usuario puede editar un objeto específico.

        Args:
            obj: Objeto a editar

        Returns:
            True si tiene permisos de edición
        """
        usuario = self.get_usuario_actual()
        if not usuario:
            return False

        # Admin puede editar siempre
        if usuario.rol == Usuario.ROL_ADMIN:
            return True

        # Verificar si el objeto pertenece a un centro asignado
        if hasattr(obj, self.centro_field):
            centro_id = getattr(obj, self.centro_field + '_id', None)
            if centro_id:
                return usuario.tiene_acceso_centro(centro_id)

        return False

    def puede_eliminar(self, obj) -> bool:
        """
        Verifica si el usuario puede eliminar un objeto.

        Args:
            obj: Objeto a eliminar

        Returns:
            True si tiene permisos de eliminación
        """
        usuario = self.get_usuario_actual()
        if not usuario:
            return False

        # Solo admin puede eliminar
        return usuario.rol == Usuario.ROL_ADMIN


def get_centros_disponibles_usuario(usuario: Usuario) -> List[int]:
    """
    Obtiene los IDs de centros disponibles para un usuario.

    Args:
        usuario: Usuario del que obtener centros

    Returns:
        Lista de IDs de centros o None si es admin (todos)
    """
    if not usuario:
        return []

    if usuario.rol == Usuario.ROL_ADMIN:
        # Admin puede ver todos - retornar None indica "sin filtro"
        return None

    return usuario.get_centros_ids()


def usuario_tiene_permiso_admin(usuario: Optional[Usuario]) -> bool:
    """
    Verifica si el usuario tiene permisos de administrador.

    Args:
        usuario: Usuario a verificar

    Returns:
        True si es administrador
    """
    if not usuario:
        return False
    return usuario.rol == Usuario.ROL_ADMIN


def usuario_puede_administrar_cortes(usuario: Optional[Usuario]) -> bool:
    """
    Verifica si el usuario puede administrar cortes.

    Args:
        usuario: Usuario a verificar

    Returns:
        True si puede administrar cortes
    """
    if not usuario:
        return False
    return usuario.puede_administrar_cortes()
