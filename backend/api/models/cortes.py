"""
Modelos de Cortes FONASA.

Este módulo contiene los modelos relacionados con los cortes mensuales de FONASA,
que son archivos que llegan cada mes con información de los usuarios inscritos
en el sistema de salud.

Modelos:
    - CorteFonasa: Registros individuales de usuarios en cortes mensuales
    - CorteFonasaObservacion: Observaciones y seguimiento de registros del corte
"""

from django.conf import settings
from django.db import models
from django.utils import timezone

from .utils import normalize_run, normalize_motivo, observacion_upload_to
from .catalogos import Establecimiento


class CorteFonasa(models.Model):
    """
    Registro individual de usuario en un corte mensual de FONASA.

    Cada mes FONASA envía un archivo con todos los usuarios inscritos en el sistema.
    Este modelo almacena cada registro de ese archivo. Un mismo RUN puede aparecer
    múltiples veces en el mismo mes (se permiten duplicados) para registrar diferentes
    estados o centros de salud.

    Campos principales:
        run: RUN del usuario (normalizado automáticamente)
        nombres, ap_paterno, ap_materno: Datos personales
        fecha_corte: Fecha del corte mensual (año-mes)
        aceptado_rechazado: Estado del registro (ACEPTADO/RECHAZADO/INGRESO RECHAZO SIMULTÁNEO)
        motivo: Motivo de rechazo o estado
        centro_salud: Relación con el catálogo de establecimientos
        nombre_centro: Nombre del centro (backup textual)

    Información de procedencia y destino:
        centro_de_procedencia: Centro de salud de origen
        comuna_de_procedencia: Comuna de origen
        nombre_centro_actual: Centro actual/destino
        centro_actual: Centro actual (legacy)
        comuna_actual: Comuna actual/destino

    Nota importante:
        - Se permiten duplicados de RUN en el mismo mes
        - Los RUNs se normalizan automáticamente al guardar
        - Los motivos se normalizan para permitir búsquedas consistentes
    """

    # Datos personales del usuario
    run = models.CharField(
        max_length=12,
        db_index=True,
        help_text="RUN del usuario (formato: XXXXXXXX-Y)"
    )
    nombres = models.CharField(max_length=255, blank=True)
    ap_paterno = models.CharField(max_length=255, blank=True)
    ap_materno = models.CharField(max_length=255, blank=True)
    fecha_nacimiento = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de nacimiento del usuario"
    )
    genero = models.CharField(
        max_length=20,
        blank=True,
        help_text="Género del usuario"
    )
    tramo = models.CharField(
        max_length=50,
        blank=True,
        help_text="Tramo de FONASA (A, B, C, D)"
    )

    # Fecha del corte
    fecha_corte = models.DateField(
        db_index=True,
        help_text="Fecha del corte mensual (primer día del mes)"
    )

    # Relación con catálogo de establecimientos
    centro_salud = models.ForeignKey(
        Establecimiento,
        on_delete=models.SET_NULL,
        related_name='cortes',
        null=True,
        blank=True,
        help_text="Centro de salud donde está inscrito"
    )
    nombre_centro = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nombre del centro de salud (backup textual)"
    )

    # Información de procedencia (origen)
    centro_de_procedencia = models.CharField(
        max_length=255,
        blank=True,
        help_text="Centro de salud de origen"
    )
    comuna_de_procedencia = models.CharField(
        max_length=100,
        blank=True,
        help_text="Comuna de origen"
    )

    # Información de destino (actual)
    nombre_centro_actual = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nombre del centro actual/destino"
    )
    centro_actual = models.CharField(
        max_length=255,
        blank=True,
        help_text="Centro de salud actual/destino (campo legacy)"
    )
    comuna_actual = models.CharField(
        max_length=100,
        blank=True,
        help_text="Comuna actual/destino"
    )

    # Estado y motivo del registro
    aceptado_rechazado = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Estado: ACEPTADO, RECHAZADO, INGRESO RECHAZO SIMULTÁNEO"
    )
    motivo = models.CharField(
        max_length=255,
        blank=True,
        help_text="Motivo de rechazo o estado especial"
    )
    motivo_normalizado = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        help_text="Motivo normalizado para búsquedas (sin acentos, mayúsculas)"
    )

    # Metadatos
    creado_el = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Fecha y hora de creación del registro"
    )

    class Meta:
        ordering = ["-fecha_corte", "run"]
        verbose_name = 'Corte FONASA'
        verbose_name_plural = 'Cortes FONASA'
        indexes = [
            models.Index(fields=['run', 'fecha_corte']),
            models.Index(fields=['fecha_corte', 'motivo_normalizado']),
            models.Index(fields=['-fecha_corte', 'centro_salud']),
        ]

    def save(self, *args, **kwargs):
        """
        Normaliza RUN y motivo antes de guardar.

        Garantiza que los RUNs y motivos sean consistentes en toda la base de datos.
        """
        self.run = normalize_run(self.run)
        self.motivo_normalizado = normalize_motivo(self.motivo)
        super().save(*args, **kwargs)

    @property
    def nombre_completo(self) -> str:
        """
        Retorna el nombre completo del usuario.

        Returns:
            Nombre completo concatenado de nombres y apellidos
        """
        partes = [self.nombres, self.ap_paterno, self.ap_materno]
        return " ".join(p for p in partes if p).strip()

    def __str__(self) -> str:
        return f"CorteFonasa({self.run} @ {self.fecha_corte:%Y-%m})"


class CorteFonasaObservacion(models.Model):
    """
    Observaciones y seguimiento de registros de corte FONASA.

    Permite a los usuarios del sistema agregar observaciones, notas y hacer seguimiento
    de usuarios que aparecen en los cortes FONASA, especialmente aquellos con estados
    problemáticos (rechazados, fallecidos, etc.).

    Estados de revisión:
        - PENDIENTE: Observación recién creada, sin seguimiento
        - CONTACTADO: Se ha contactado al usuario
        - AGENDADO: Se ha agendado una cita o acción
        - RESUELTO: Caso resuelto
        - NO_LOCALIZADO: No se pudo contactar al usuario

    Tipos de observación:
        - PREDEFINIDA: Observación generada automáticamente por el sistema
        - MANUAL: Observación creada manualmente por un usuario
    """

    class EstadoRevision(models.TextChoices):
        """Estados posibles de una observación."""
        PENDIENTE = "PENDIENTE", "Pendiente"
        CONTACTADO = "CONTACTADO", "Contactado"
        AGENDADO = "AGENDADO", "Agendado"
        RESUELTO = "RESUELTO", "Resuelto"
        NO_LOCALIZADO = "NO_LOCALIZADO", "No localizado"

    class TipoObservacion(models.TextChoices):
        """Tipos de observación."""
        PREDEFINIDA = "PREDEFINIDA", "Predefinida"
        MANUAL = "MANUAL", "Manual"

    # Relación con el corte
    corte = models.ForeignKey(
        CorteFonasa,
        on_delete=models.CASCADE,
        related_name="observaciones",
        help_text="Registro del corte al que pertenece esta observación"
    )

    # Autor de la observación
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="observaciones_cortes",
        help_text="Usuario que creó la observación"
    )
    autor_nombre = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nombre o RUT del usuario que creó la observación"
    )

    # Estado y tipo
    estado_revision = models.CharField(
        max_length=20,
        choices=EstadoRevision.choices,
        default=EstadoRevision.PENDIENTE,
        db_index=True,
        help_text="Estado actual de la observación/seguimiento"
    )
    tipo = models.CharField(
        max_length=20,
        choices=TipoObservacion.choices,
        default=TipoObservacion.PREDEFINIDA,
        help_text="Tipo de observación (predefinida o manual)"
    )

    # Contenido de la observación
    titulo = models.CharField(
        max_length=255,
        blank=True,
        help_text="Título o resumen de la observación"
    )
    texto = models.TextField(
        blank=True,
        help_text="Texto completo de la observación"
    )
    adjunto = models.FileField(
        upload_to=observacion_upload_to,
        blank=True,
        null=True,
        help_text="Archivo adjunto (PDF, imagen, etc.)"
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        help_text="Metadatos adicionales en formato JSON"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última actualización"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = 'Observación de Corte FONASA'
        verbose_name_plural = 'Observaciones de Cortes FONASA'
        indexes = [
            models.Index(fields=["corte", "-created_at"]),
            models.Index(fields=["estado_revision", "corte"]),
        ]

    def __str__(self) -> str:
        return f"Observacion({self.corte_id}, {self.estado_revision})"
