"""
Modelo de Historial de Cargas.

Este módulo contiene el modelo para registrar el historial de todas las cargas
de archivos (Corte FONASA y HP Trakcare) realizadas en el sistema.

Permite auditar y hacer seguimiento de:
- Quién cargó cada archivo
- Cuándo se cargó
- Qué datos contiene
- Si fue exitosa o hubo errores
- Estadísticas de la carga
"""

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


class HistorialCarga(models.Model):
    """
    Registro de historial de cargas de archivos (Corte FONASA y HP Trakcare).

    Cada vez que se carga un archivo de datos al sistema, se crea un registro
    en este modelo para auditar la operación. Guarda información sobre quién,
    cuándo, qué tipo de datos y estadísticas del proceso.

    Tipos de carga:
        - CORTE_FONASA: Archivo mensual de cortes FONASA
        - HP_TRAKCARE: Archivo de base de datos de HP Trakcare

    Estados posibles:
        - EN_PROCESO: La carga está en progreso
        - EXITOSO: Carga completada exitosamente
        - ERROR: Carga falló completamente
        - PARCIAL: Carga completada con algunos errores

    Campos principales:
        tipo_carga: CORTE_FONASA o HP_TRAKCARE
        nombre_archivo: Nombre del archivo cargado
        usuario: Usuario que realizó la carga
        fecha_carga: Timestamp de la carga
        estado: EXITOSO, ERROR, PARCIAL, EN_PROCESO

    Estadísticas:
        total_registros: Total de registros en el archivo
        registros_creados: Registros nuevos creados
        registros_actualizados: Registros existentes actualizados
        registros_invalidos: Registros con errores

    Metadatos adicionales:
        errores: Lista de errores encontrados (JSON)
        tiempo_procesamiento: Tiempo en segundos que tomó procesar
        ip_address: IP desde donde se hizo la carga
        observaciones: Notas adicionales
        reemplazo: Indica si se reemplazaron datos existentes
    """

    TIPO_CHOICES = [
        ('CORTE_FONASA', 'Corte FONASA'),
        ('HP_TRAKCARE', 'HP Trakcare'),
    ]

    ESTADO_CHOICES = [
        ('EXITOSO', 'Exitoso'),
        ('ERROR', 'Error'),
        ('PARCIAL', 'Parcial'),
        ('EN_PROCESO', 'En Proceso'),
    ]

    # Información de la carga
    tipo_carga = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        db_index=True,
        help_text="Tipo de archivo cargado (Corte FONASA o HP Trakcare)"
    )
    nombre_archivo = models.CharField(
        max_length=500,
        help_text="Nombre del archivo original cargado"
    )
    usuario = models.CharField(
        max_length=255,
        help_text="Usuario que realizó la carga"
    )
    fecha_carga = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Fecha y hora de la carga"
    )

    # Periodo de los datos (para Corte FONASA)
    periodo_mes = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Mes del periodo de datos (1-12, solo para Corte FONASA)"
    )
    periodo_anio = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Año del periodo de datos (solo para Corte FONASA)"
    )
    fecha_corte = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha del corte (solo para Corte FONASA)"
    )

    # Estadísticas de la carga
    total_registros = models.PositiveIntegerField(
        default=0,
        help_text="Total de registros en el archivo"
    )
    registros_creados = models.PositiveIntegerField(
        default=0,
        help_text="Número de registros nuevos creados"
    )
    registros_actualizados = models.PositiveIntegerField(
        default=0,
        help_text="Número de registros existentes actualizados"
    )
    registros_invalidos = models.PositiveIntegerField(
        default=0,
        help_text="Número de registros con errores o inválidos"
    )

    # Estado y resultado
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='EN_PROCESO',
        db_index=True,
        help_text="Estado final de la carga"
    )
    reemplazo = models.BooleanField(
        default=False,
        help_text="Indica si se reemplazaron datos existentes del periodo"
    )

    # Detalles adicionales
    observaciones = models.TextField(
        blank=True,
        help_text="Observaciones o notas sobre la carga"
    )
    errores = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de errores encontrados durante la carga (JSON)"
    )
    tiempo_procesamiento = models.FloatField(
        null=True,
        blank=True,
        help_text="Tiempo de procesamiento en segundos"
    )

    # Metadatos del sistema
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP desde donde se realizó la carga"
    )

    class Meta:
        ordering = ["-fecha_carga"]
        verbose_name = 'Historial de Carga'
        verbose_name_plural = 'Historial de Cargas'
        indexes = [
            models.Index(fields=['tipo_carga', '-fecha_carga']),
            models.Index(fields=['usuario', '-fecha_carga']),
            models.Index(fields=['periodo_anio', 'periodo_mes']),
            models.Index(fields=['estado', '-fecha_carga']),
        ]

    @property
    def periodo_str(self):
        """
        Retorna el periodo en formato legible.

        Returns:
            String con el periodo (ej: 'Octubre 2024') o 'N/A' si no aplica

        Ejemplo:
            >>> historial = HistorialCarga(periodo_mes=10, periodo_anio=2024)
            >>> historial.periodo_str
            'Octubre 2024'
        """
        if self.periodo_mes and self.periodo_anio:
            meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ]
            if 1 <= self.periodo_mes <= 12:
                return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
            return f"{self.periodo_anio}-{self.periodo_mes:02d}"
        return "N/A"

    @property
    def tasa_exito(self) -> float:
        """
        Calcula el porcentaje de registros procesados exitosamente.

        Returns:
            Porcentaje de registros válidos sobre el total (0-100)

        Ejemplo:
            >>> historial = HistorialCarga(
            ...     total_registros=1000,
            ...     registros_creados=850,
            ...     registros_actualizados=140
            ... )
            >>> historial.tasa_exito
            99.0
        """
        if self.total_registros == 0:
            return 0.0
        exitosos = self.registros_creados + self.registros_actualizados
        return round((exitosos / self.total_registros) * 100, 2)

    @property
    def registros_exitosos(self) -> int:
        """
        Retorna el total de registros procesados exitosamente.

        Returns:
            Suma de registros creados y actualizados

        Ejemplo:
            >>> historial = HistorialCarga(registros_creados=100, registros_actualizados=50)
            >>> historial.registros_exitosos
            150
        """
        return self.registros_creados + self.registros_actualizados

    def __str__(self) -> str:
        return f"HistorialCarga({self.get_tipo_carga_display()} - {self.usuario} - {self.fecha_carga:%Y-%m-%d %H:%M})"
