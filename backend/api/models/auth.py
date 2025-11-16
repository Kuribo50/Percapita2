"""
Modelo de Autenticación y Gestión de Usuarios del Sistema con Roles.

Este módulo contiene el modelo de usuarios con sistema de roles y
permisos basados en centros de salud asignados.

Modelo:
    - Usuario: Usuarios del sistema con roles y centros asignados
    - UsuarioCentro: Relación muchos-a-muchos entre usuarios y centros
"""

from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from django.utils import timezone


class Usuario(models.Model):
    """
    Modelo de usuarios del sistema con roles y centros asignados.

    Sistema de Roles:
        - ADMIN: Administrador total del sistema
          * Gestiona usuarios
          * Asigna centros
          * Restablece contraseñas
          * Administra cortes
          * Ve todos los centros

        - INFORMATICO: Usuario informático
          * Ve solo sus centros asignados
          * Gestiona cortes de sus centros
          * Genera reportes

        - ADMINISTRATIVO: Usuario administrativo
          * Ve solo sus centros asignados
          * Revisa usuarios de sus centros
          * Gestiona inscripciones

    Campos principales:
        username: Nombre de usuario único para login
        password_hash: Contraseña hasheada (nunca se almacena en texto plano)
        nombre_completo: Nombre completo del usuario
        email: Correo electrónico (opcional)
        rol: Rol del usuario (ADMIN, INFORMATICO, ADMINISTRATIVO)
        centros: Centros de salud asignados (many-to-many)
        es_admin: Indica si tiene permisos de administrador (auto-calculado)
        activo: Indica si la cuenta está activa

    Métodos importantes:
        set_password(raw_password): Hashea y guarda una contraseña
        check_password(raw_password): Verifica si una contraseña es correcta
        tiene_acceso_centro(centro): Verifica si tiene acceso a un centro
        get_centros_ids(): Obtiene lista de IDs de centros asignados
    """

    # Constantes de roles
    ROL_ADMIN = 'ADMIN'
    ROL_INFORMATICO = 'INFORMATICO'
    ROL_ADMINISTRATIVO = 'ADMINISTRATIVO'

    ROLES = (
        (ROL_ADMIN, 'Administrador'),
        (ROL_INFORMATICO, 'Informático'),
        (ROL_ADMINISTRATIVO, 'Administrativo'),
    )

    # Campos básicos
    username = models.CharField(
        max_length=150,
        unique=True,
        db_index=True,
        help_text="Nombre de usuario único para login"
    )
    password_hash = models.CharField(
        max_length=255,
        help_text="Contraseña hasheada (nunca en texto plano)"
    )
    nombre_completo = models.CharField(
        max_length=255,
        help_text="Nombre completo del usuario"
    )
    email = models.EmailField(
        blank=True,
        help_text="Correo electrónico del usuario"
    )

    # Sistema de roles
    rol = models.CharField(
        max_length=20,
        choices=ROLES,
        default=ROL_ADMINISTRATIVO,
        help_text="Rol del usuario en el sistema"
    )

    # Relación con centros de salud (many-to-many)
    # Los admins tienen acceso a todos los centros automáticamente
    centros = models.ManyToManyField(
        'Establecimiento',
        blank=True,
        related_name='usuarios',
        help_text="Centros de salud asignados al usuario"
    )

    # Flags de permisos
    es_admin = models.BooleanField(
        default=False,
        editable=False,  # Se calcula automáticamente desde el rol
        help_text="Indica si el usuario tiene permisos de administrador"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la cuenta está activa y puede iniciar sesión"
    )

    # Metadatos
    ultimo_acceso = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora del último acceso al sistema"
    )
    creado_el = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Fecha y hora de creación de la cuenta"
    )
    creado_por = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios_creados',
        help_text="Usuario que creó esta cuenta"
    )
    modificado_el = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última modificación"
    )
    modificado_por = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios_modificados',
        help_text="Último usuario que modificó esta cuenta"
    )

    class Meta:
        ordering = ['nombre_completo']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['rol']),
            models.Index(fields=['activo']),
        ]

    def save(self, *args, **kwargs):
        """
        Sobrescribe save para actualizar automáticamente es_admin según el rol.
        """
        self.es_admin = (self.rol == self.ROL_ADMIN)
        super().save(*args, **kwargs)

    def set_password(self, raw_password: str):
        """
        Establece la contraseña del usuario (hasheada).

        Utiliza el sistema de hashing de Django para almacenar la contraseña
        de forma segura. NUNCA almacena contraseñas en texto plano.

        Args:
            raw_password: Contraseña en texto plano

        Ejemplo:
            >>> usuario = Usuario(username="jperez")
            >>> usuario.set_password("mipassword123")
            >>> usuario.save()
        """
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        """
        Verifica si la contraseña proporcionada es correcta.

        Compara la contraseña en texto plano con el hash almacenado.

        Args:
            raw_password: Contraseña en texto plano a verificar

        Returns:
            True si la contraseña es correcta, False en caso contrario

        Ejemplo:
            >>> usuario = Usuario.objects.get(username="jperez")
            >>> if usuario.check_password("mipassword123"):
            ...     print("Login exitoso")
            ... else:
            ...     print("Contraseña incorrecta")
        """
        return check_password(raw_password, self.password_hash)

    def tiene_acceso_centro(self, centro_id: int) -> bool:
        """
        Verifica si el usuario tiene acceso a un centro específico.

        Los administradores siempre tienen acceso a todos los centros.
        Los demás roles solo tienen acceso a sus centros asignados.

        Args:
            centro_id: ID del centro a verificar

        Returns:
            True si tiene acceso, False en caso contrario

        Ejemplo:
            >>> if usuario.tiene_acceso_centro(centro_id=1):
            ...     # Mostrar datos del centro
            ...     pass
        """
        if self.rol == self.ROL_ADMIN:
            return True
        return self.centros.filter(id=centro_id).exists()

    def get_centros_ids(self) -> list:
        """
        Obtiene la lista de IDs de centros a los que tiene acceso.

        Los administradores devuelven None (acceso a todos).
        Los demás roles devuelven la lista de sus centros asignados.

        Returns:
            None si es admin (acceso total), lista de IDs en caso contrario

        Ejemplo:
            >>> centros_ids = usuario.get_centros_ids()
            >>> if centros_ids is None:
            ...     # Admin: puede ver todos
            ...     queryset = CorteFonasa.objects.all()
            >>> else:
            ...     # Filtrar por centros asignados
            ...     queryset = CorteFonasa.objects.filter(centro_salud__in=centros_ids)
        """
        if self.rol == self.ROL_ADMIN:
            return None  # Acceso a todos los centros
        return list(self.centros.values_list('id', flat=True))

    def puede_gestionar_usuarios(self) -> bool:
        """
        Verifica si el usuario puede gestionar otros usuarios.

        Solo los ADMIN pueden crear, editar y eliminar usuarios.

        Returns:
            True si puede gestionar usuarios, False en caso contrario
        """
        return self.rol == self.ROL_ADMIN

    def puede_restablecer_password(self) -> bool:
        """
        Verifica si el usuario puede restablecer contraseñas de otros.

        Solo los ADMIN pueden restablecer contraseñas.

        Returns:
            True si puede restablecer contraseñas, False en caso contrario
        """
        return self.rol == self.ROL_ADMIN

    def puede_administrar_cortes(self) -> bool:
        """
        Verifica si el usuario puede administrar cortes FONASA.

        Solo ADMIN e INFORMATICO pueden administrar cortes.

        Returns:
            True si puede administrar cortes, False en caso contrario
        """
        return self.rol in [self.ROL_ADMIN, self.ROL_INFORMATICO]

    @property
    def rol_display(self) -> str:
        """
        Obtiene el nombre legible del rol.

        Returns:
            Nombre del rol en español
        """
        return dict(self.ROLES).get(self.rol, self.rol)

    @property
    def centros_nombres(self) -> list:
        """
        Obtiene los nombres de los centros asignados.

        Returns:
            Lista de nombres de centros
        """
        if self.rol == self.ROL_ADMIN:
            return ['Todos los centros']
        return list(self.centros.values_list('nombre', flat=True))

    def __str__(self) -> str:
        return f"{self.nombre_completo} ({self.rol_display})"
