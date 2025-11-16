"""
Sistema de Auditoría y Registro de Actividades.

Este módulo registra todas las acciones importantes realizadas en el sistema,
permitiendo rastrear quién hizo qué, cuándo y desde dónde.

Modelos:
    - LogActividad: Registro de acciones del sistema
    - Notificacion: Notificaciones para usuarios
"""

from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
import json


class LogActividad(models.Model):
    """
    Registro de auditoría de actividades del sistema.

    Rastrea todas las acciones importantes realizadas por usuarios,
    incluyendo creación, edición y eliminación de registros.

    Campos:
        usuario: Usuario que realizó la acción
        accion: Tipo de acción realizada
        modulo: Módulo del sistema afectado
        descripcion: Descripción legible de la acción
        objeto_tipo: Tipo de objeto afectado
        objeto_id: ID del objeto afectado
        objeto_str: Representación string del objeto
        cambios: Cambios realizados (JSON)
        ip_address: IP desde donde se realizó la acción
        user_agent: Navegador/dispositivo usado
        timestamp: Fecha y hora de la acción

    Ejemplo:
        >>> log = LogActividad.objects.create(
        ...     usuario=usuario,
        ...     accion='CREAR',
        ...     modulo='USUARIOS',
        ...     descripcion='Creó el usuario jperez',
        ...     objeto_tipo='Usuario',
        ...     objeto_id=123,
        ...     ip_address='192.168.1.1'
        ... )
    """

    # Tipos de acciones
    ACCION_LOGIN = 'LOGIN'
    ACCION_LOGOUT = 'LOGOUT'
    ACCION_CREAR = 'CREAR'
    ACCION_EDITAR = 'EDITAR'
    ACCION_ELIMINAR = 'ELIMINAR'
    ACCION_VER = 'VER'
    ACCION_EXPORTAR = 'EXPORTAR'
    ACCION_IMPORTAR = 'IMPORTAR'
    ACCION_VALIDAR = 'VALIDAR'
    ACCION_RESTABLECER_PASSWORD = 'RESTABLECER_PASSWORD'
    ACCION_ASIGNAR_CENTROS = 'ASIGNAR_CENTROS'

    ACCIONES = (
        (ACCION_LOGIN, 'Inicio de sesión'),
        (ACCION_LOGOUT, 'Cierre de sesión'),
        (ACCION_CREAR, 'Crear'),
        (ACCION_EDITAR, 'Editar'),
        (ACCION_ELIMINAR, 'Eliminar'),
        (ACCION_VER, 'Ver'),
        (ACCION_EXPORTAR, 'Exportar'),
        (ACCION_IMPORTAR, 'Importar'),
        (ACCION_VALIDAR, 'Validar'),
        (ACCION_RESTABLECER_PASSWORD, 'Restablecer contraseña'),
        (ACCION_ASIGNAR_CENTROS, 'Asignar centros'),
    )

    # Módulos del sistema
    MODULO_USUARIOS = 'USUARIOS'
    MODULO_CORTES = 'CORTES'
    MODULO_NUEVOS_USUARIOS = 'NUEVOS_USUARIOS'
    MODULO_HP_TRAKCARE = 'HP_TRAKCARE'
    MODULO_VALIDACIONES = 'VALIDACIONES'
    MODULO_CATALOGOS = 'CATALOGOS'
    MODULO_SISTEMA = 'SISTEMA'

    MODULOS = (
        (MODULO_USUARIOS, 'Usuarios del Sistema'),
        (MODULO_CORTES, 'Cortes FONASA'),
        (MODULO_NUEVOS_USUARIOS, 'Nuevos Usuarios'),
        (MODULO_HP_TRAKCARE, 'HP Trakcare'),
        (MODULO_VALIDACIONES, 'Validaciones'),
        (MODULO_CATALOGOS, 'Catálogos'),
        (MODULO_SISTEMA, 'Sistema'),
    )

    # Campos principales
    usuario = models.ForeignKey(
        'Usuario',
        on_delete=models.SET_NULL,
        null=True,
        related_name='logs',
        help_text="Usuario que realizó la acción"
    )
    accion = models.CharField(
        max_length=50,
        choices=ACCIONES,
        db_index=True,
        help_text="Tipo de acción realizada"
    )
    modulo = models.CharField(
        max_length=50,
        choices=MODULOS,
        db_index=True,
        help_text="Módulo del sistema afectado"
    )
    descripcion = models.TextField(
        help_text="Descripción legible de la acción"
    )

    # Información del objeto afectado
    objeto_tipo = models.CharField(
        max_length=100,
        blank=True,
        help_text="Tipo de objeto afectado (ej: Usuario, CorteFonasa)"
    )
    objeto_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID del objeto afectado"
    )
    objeto_str = models.CharField(
        max_length=500,
        blank=True,
        help_text="Representación string del objeto"
    )

    # Detalles de cambios
    cambios = models.JSONField(
        null=True,
        blank=True,
        help_text="Cambios realizados (antes/después)"
    )

    # Información de conexión
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP desde donde se realizó la acción"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="Navegador/dispositivo usado"
    )

    # Timestamp
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Fecha y hora de la acción"
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Log de Actividad'
        verbose_name_plural = 'Logs de Actividad'
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['usuario', '-timestamp']),
            models.Index(fields=['accion', '-timestamp']),
            models.Index(fields=['modulo', '-timestamp']),
        ]

    @staticmethod
    def registrar(usuario, accion, modulo, descripcion, **kwargs):
        """
        Método estático para registrar una actividad.

        Args:
            usuario: Usuario que realizó la acción
            accion: Tipo de acción (usar constantes ACCION_*)
            modulo: Módulo afectado (usar constantes MODULO_*)
            descripcion: Descripción de la acción
            **kwargs: Campos opcionales (objeto_tipo, objeto_id, cambios, etc.)

        Returns:
            Instancia de LogActividad creada

        Ejemplo:
            >>> LogActividad.registrar(
            ...     usuario=request.usuario,
            ...     accion=LogActividad.ACCION_CREAR,
            ...     modulo=LogActividad.MODULO_USUARIOS,
            ...     descripcion=f'Creó el usuario {nuevo_usuario.username}',
            ...     objeto_tipo='Usuario',
            ...     objeto_id=nuevo_usuario.id,
            ...     objeto_str=str(nuevo_usuario),
            ...     ip_address=get_client_ip(request)
            ... )
        """
        return LogActividad.objects.create(
            usuario=usuario,
            accion=accion,
            modulo=modulo,
            descripcion=descripcion,
            objeto_tipo=kwargs.get('objeto_tipo', ''),
            objeto_id=kwargs.get('objeto_id'),
            objeto_str=kwargs.get('objeto_str', ''),
            cambios=kwargs.get('cambios'),
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent', '')
        )

    def __str__(self):
        usuario_str = self.usuario.username if self.usuario else "Sistema"
        return f"{usuario_str} - {self.get_accion_display()} - {self.descripcion}"


class Notificacion(models.Model):
    """
    Notificaciones para usuarios del sistema.

    Permite enviar notificaciones a usuarios sobre eventos importantes
    como nuevos usuarios asignados, cortes procesados, etc.

    Campos:
        usuario: Usuario que recibe la notificación
        tipo: Tipo de notificación
        titulo: Título breve
        mensaje: Mensaje completo
        leida: Si fue leída o no
        url: URL de referencia (opcional)
        datos: Datos adicionales en JSON
        timestamp: Fecha y hora de creación

    Ejemplo:
        >>> Notificacion.objects.create(
        ...     usuario=usuario,
        ...     tipo='INFO',
        ...     titulo='Nuevo usuario asignado',
        ...     mensaje='Se te asignó el usuario Juan Pérez',
        ...     url='/dashboard/nuevos-usuarios/123'
        ... )
    """

    # Tipos de notificaciones
    TIPO_INFO = 'INFO'
    TIPO_SUCCESS = 'SUCCESS'
    TIPO_WARNING = 'WARNING'
    TIPO_ERROR = 'ERROR'

    TIPOS = (
        (TIPO_INFO, 'Información'),
        (TIPO_SUCCESS, 'Éxito'),
        (TIPO_WARNING, 'Advertencia'),
        (TIPO_ERROR, 'Error'),
    )

    # Campos
    usuario = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='notificaciones',
        help_text="Usuario que recibe la notificación"
    )
    tipo = models.CharField(
        max_length=20,
        choices=TIPOS,
        default=TIPO_INFO,
        help_text="Tipo de notificación"
    )
    titulo = models.CharField(
        max_length=200,
        help_text="Título breve de la notificación"
    )
    mensaje = models.TextField(
        help_text="Mensaje completo"
    )
    leida = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Si la notificación fue leída"
    )
    url = models.CharField(
        max_length=500,
        blank=True,
        help_text="URL de referencia"
    )
    datos = models.JSONField(
        null=True,
        blank=True,
        help_text="Datos adicionales"
    )
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Fecha y hora de creación"
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        indexes = [
            models.Index(fields=['usuario', '-timestamp']),
            models.Index(fields=['usuario', 'leida', '-timestamp']),
        ]

    @staticmethod
    def crear(usuario, titulo, mensaje, tipo=TIPO_INFO, url='', datos=None):
        """
        Método estático para crear una notificación.

        Args:
            usuario: Usuario destinatario
            titulo: Título de la notificación
            mensaje: Mensaje completo
            tipo: Tipo de notificación
            url: URL opcional
            datos: Datos adicionales opcionales

        Returns:
            Instancia de Notificacion creada

        Ejemplo:
            >>> Notificacion.crear(
            ...     usuario=usuario_informatico,
            ...     titulo='Corte procesado',
            ...     mensaje='El corte de enero fue procesado exitosamente',
            ...     tipo=Notificacion.TIPO_SUCCESS,
            ...     url='/dashboard/cortes/enero-2024'
            ... )
        """
        return Notificacion.objects.create(
            usuario=usuario,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            url=url,
            datos=datos
        )

    def marcar_leida(self):
        """Marca la notificación como leída."""
        self.leida = True
        self.save(update_fields=['leida'])

    def __str__(self):
        return f"{self.usuario.username} - {self.titulo}"
