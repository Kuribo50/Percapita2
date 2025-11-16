"""
Modelo de Autenticación y Gestión de Usuarios del Sistema.

Este módulo contiene el modelo de usuarios para autenticación y gestión
del sistema. No utiliza el modelo de usuario de Django por defecto, sino
un modelo personalizado más simple.

Modelo:
    - Usuario: Usuarios del sistema con autenticación básica
"""

from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from django.utils import timezone


class Usuario(models.Model):
    """
    Modelo de usuarios del sistema para autenticación y gestión.

    Este es un modelo de usuario personalizado más simple que el modelo
    de Django por defecto. Maneja autenticación básica con usuario/contraseña
    y permisos de administrador.

    Características:
        - Autenticación con username y password (hasheada)
        - Flag de administrador (es_admin)
        - Estado activo/inactivo
        - Tracking de último acceso

    Campos principales:
        username: Nombre de usuario único para login
        password_hash: Contraseña hasheada (nunca se almacena en texto plano)
        nombre_completo: Nombre completo del usuario
        email: Correo electrónico (opcional)
        es_admin: Indica si tiene permisos de administrador
        activo: Indica si la cuenta está activa

    Métodos importantes:
        set_password(raw_password): Hashea y guarda una contraseña
        check_password(raw_password): Verifica si una contraseña es correcta

    Ejemplo de uso:
        >>> # Crear usuario
        >>> usuario = Usuario(username="jperez", nombre_completo="Juan Pérez")
        >>> usuario.set_password("mipassword123")
        >>> usuario.save()
        >>>
        >>> # Verificar password
        >>> if usuario.check_password("mipassword123"):
        ...     print("Contraseña correcta")
        >>>
        >>> # Actualizar último acceso
        >>> usuario.ultimo_acceso = timezone.now()
        >>> usuario.save()
    """

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
    es_admin = models.BooleanField(
        default=False,
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
    modificado_el = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última modificación"
    )

    class Meta:
        ordering = ['username']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['activo']),
        ]

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

    def __str__(self) -> str:
        return f"{self.nombre_completo} ({self.username})"
