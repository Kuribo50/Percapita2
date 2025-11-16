"""
Modelos de Gestión de Nuevos Usuarios y Validaciones.

Este módulo contiene los modelos para gestionar nuevos usuarios que llegan al
CESFAM antes del corte mensual de FONASA, y el sistema de validación cuando
llega el corte del mes siguiente.

Flujo de trabajo:
1. Se registra un NuevoUsuario cuando alguien se inscribe
2. Al mes siguiente llega el corte FONASA
3. Se crea una ValidacionCorte que compara los nuevos usuarios con el corte
4. Se actualiza el estado de cada NuevoUsuario (VALIDADO/NO_VALIDADO/FALLECIDO)

Modelos:
    - NuevoUsuario: Usuario inscrito esperando validación en el próximo corte
    - ValidacionCorte: Registro de proceso de validación de un periodo
"""

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone

from .utils import normalize_run
from .catalogos import Nacionalidad, Etnia, Sector, Subsector, Establecimiento


class NuevoUsuario(models.Model):
    """
    Registro de usuario que se inscribe en el CESFAM antes del corte mensual.

    Este modelo permite hacer seguimiento de usuarios que llegan al centro de salud
    y se inscriben, antes de que salga el corte FONASA del mes. Cuando llega el corte
    del mes siguiente, se valida si efectivamente el usuario aparece en el corte.

    Estados posibles:
        - PENDIENTE: Esperando validación en el próximo corte
        - VALIDADO: Apareció en el corte FONASA correctamente
        - NO_VALIDADO: Apareció en el corte pero con rechazo
        - FALLECIDO: Apareció como fallecido en el corte

    Flujo de uso:
        1. Usuario se inscribe en octubre → Se crea NuevoUsuario para octubre
        2. Llega corte FONASA de noviembre → Sistema valida automáticamente
        3. Estado cambia a VALIDADO (si aparece) o permanece PENDIENTE (si no aparece)

    Campos principales:
        run: RUN del usuario (normalizado automáticamente)
        nombres, apellido_paterno, apellido_materno: Datos personales
        fecha_inscripcion: Fecha en que se inscribió
        periodo_mes, periodo_anio: Mes y año al que pertenece la inscripción
        estado: Estado de validación (PENDIENTE/VALIDADO/NO_VALIDADO/FALLECIDO)

    Campos de revisión:
        revisado: Indica si fue revisado (automático o manual)
        revisado_manualmente: Indica si fue revisión manual vs automática
        revisado_por: Usuario que hizo la revisión
        revisado_el: Timestamp de la revisión
        observaciones_trakcare: Observaciones de HP Trakcare
        checklist_trakcare: Checklist de validación en JSON
    """

    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('VALIDADO', 'Validado'),
        ('NO_VALIDADO', 'No Validado'),
        ('FALLECIDO', 'Fallecido'),
    ]

    # Información básica del usuario
    run = models.CharField(
        max_length=12,
        db_index=True,
        help_text="RUN del usuario (formato: XXXXXXXX-Y)"
    )
    nombres = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Nombres del usuario"
    )
    apellido_paterno = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Apellido paterno"
    )
    apellido_materno = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Apellido materno"
    )
    nombre_completo = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Nombre completo (generado automáticamente)"
    )
    fecha_inscripcion = models.DateField(
        help_text="Fecha en que se inscribió el usuario"
    )

    # Periodo al que pertenece (mes y año de la inscripción)
    periodo_mes = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Mes del periodo (1-12)"
    )
    periodo_anio = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Año del periodo"
    )

    # Relaciones con catálogos
    nacionalidad = models.ForeignKey(
        Nacionalidad,
        on_delete=models.SET_NULL,
        related_name='nuevos_usuarios',
        null=True,
        blank=True,
        help_text="Nacionalidad del usuario"
    )
    etnia = models.ForeignKey(
        Etnia,
        on_delete=models.SET_NULL,
        related_name='nuevos_usuarios',
        null=True,
        blank=True,
        help_text="Etnia del usuario"
    )
    sector = models.ForeignKey(
        Sector,
        on_delete=models.SET_NULL,
        related_name='nuevos_usuarios',
        null=True,
        blank=True,
        help_text="Sector territorial asignado"
    )
    codigo_sector = models.CharField(
        max_length=50,
        blank=True,
        help_text="Código manual del sector"
    )
    subsector = models.ForeignKey(
        Subsector,
        on_delete=models.SET_NULL,
        related_name='nuevos_usuarios',
        null=True,
        blank=True,
        help_text="Subsector territorial"
    )
    centro = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nombre del centro de salud (texto libre)"
    )
    establecimiento = models.ForeignKey(
        Establecimiento,
        on_delete=models.SET_NULL,
        related_name='nuevos_usuarios',
        null=True,
        blank=True,
        help_text="Establecimiento de salud (catálogo)"
    )

    # Información adicional
    codigo_percapita = models.CharField(
        max_length=50,
        blank=True,
        db_index=True,
        help_text="Código de per cápita"
    )
    observaciones = models.TextField(
        blank=True,
        help_text="Observaciones generales"
    )

    # Estado de validación
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        db_index=True,
        help_text="Estado de validación contra el corte FONASA"
    )

    # Campos de revisión
    revisado = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Indica si fue revisado (automático o manual)"
    )
    revisado_manualmente = models.BooleanField(
        default=False,
        help_text="Indica si fue revisión manual vs automática"
    )
    revisado_por = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Usuario que hizo la revisión"
    )
    revisado_el = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de revisión"
    )

    # Observaciones sobre HP Trakcare
    observaciones_trakcare = models.TextField(
        blank=True,
        default='',
        help_text="Observaciones sobre el registro en HP Trakcare"
    )
    checklist_trakcare = models.JSONField(
        default=dict,
        blank=True,
        help_text="Checklist de validación en HP Trakcare (JSON)"
    )

    # Relación con validación (cuando se compare con el corte)
    validacion = models.ForeignKey(
        'ValidacionCorte',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nuevos_usuarios',
        help_text="Validación en la que se procesó este usuario"
    )

    # Metadatos
    creado_el = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Fecha y hora de creación del registro"
    )
    modificado_el = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última modificación"
    )
    creado_por = models.CharField(
        max_length=100,
        blank=True,
        help_text="Usuario que creó el registro"
    )
    modificado_por = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Usuario que modificó el registro"
    )

    class Meta:
        ordering = ["-periodo_anio", "-periodo_mes", "fecha_inscripcion"]
        verbose_name = 'Nuevo Usuario'
        verbose_name_plural = 'Nuevos Usuarios'
        indexes = [
            models.Index(fields=['periodo_anio', 'periodo_mes']),
            models.Index(fields=['estado']),
            models.Index(fields=['run', 'periodo_anio', 'periodo_mes']),
            models.Index(fields=['-periodo_anio', '-periodo_mes', 'estado']),
        ]

    def save(self, *args, **kwargs):
        """
        Normaliza RUN y genera nombre completo antes de guardar.

        Garantiza que el RUN esté en formato estándar y que el nombre completo
        esté siempre actualizado.
        """
        self.run = normalize_run(self.run)
        # Generar nombre completo automáticamente
        partes_nombre = [self.nombres, self.apellido_paterno, self.apellido_materno]
        self.nombre_completo = ' '.join(filter(None, partes_nombre))
        super().save(*args, **kwargs)

    @property
    def periodo_str(self):
        """
        Retorna el periodo en formato legible.

        Returns:
            String con el periodo (ej: 'Octubre 2024')

        Ejemplo:
            >>> usuario = NuevoUsuario(periodo_mes=10, periodo_anio=2024)
            >>> usuario.periodo_str
            'Octubre 2024'
        """
        meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        if 1 <= self.periodo_mes <= 12:
            return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
        return f"{self.periodo_anio}-{self.periodo_mes:02d}"

    def __str__(self) -> str:
        return f"NuevoUsuario({self.run} - {self.periodo_str} - {self.estado})"


class ValidacionCorte(models.Model):
    """
    Registro de validación realizada cuando se sube un nuevo corte FONASA.

    Cada vez que se sube un corte mensual de FONASA, el sistema compara
    automáticamente los nuevos usuarios del mes anterior con los registros
    del corte para validar que efectivamente aparecieron.

    Este modelo almacena las estadísticas y resultados de cada proceso de validación.

    Campos principales:
        periodo_mes, periodo_anio: Periodo de los nuevos usuarios que se validaron
        fecha_corte: Fecha del corte FONASA con el que se comparó
        total_usuarios: Total de usuarios pendientes en ese periodo
        usuarios_validados: Cuántos aparecieron correctamente en el corte
        usuarios_no_validados: Cuántos aparecieron pero fueron rechazados
        usuarios_pendientes: Cuántos no aparecieron en el corte

    Ejemplo de uso:
        Periodo validado: Octubre 2024 (nuevos usuarios inscritos en octubre)
        Fecha del corte: 2024-11-01 (corte de noviembre)
        Resultado: De 100 usuarios pendientes, 85 validados, 10 no validados, 5 pendientes
    """

    # Periodo validado (el mes de los nuevos usuarios)
    periodo_mes = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Mes del periodo validado (1-12)"
    )
    periodo_anio = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Año del periodo validado"
    )

    # Fecha del corte con el que se compara
    fecha_corte = models.DateField(
        help_text="Fecha del corte FONASA utilizado para validar"
    )

    # Estadísticas de la validación
    total_usuarios = models.PositiveIntegerField(
        default=0,
        help_text="Total de usuarios pendientes de validación"
    )
    usuarios_validados = models.PositiveIntegerField(
        default=0,
        help_text="Usuarios que aparecieron correctamente en el corte"
    )
    usuarios_no_validados = models.PositiveIntegerField(
        default=0,
        help_text="Usuarios que aparecieron pero fueron rechazados"
    )
    usuarios_pendientes = models.PositiveIntegerField(
        default=0,
        help_text="Usuarios que no aparecieron en el corte"
    )

    # Detalles de la validación
    observaciones = models.TextField(
        blank=True,
        help_text="Observaciones sobre el proceso de validación"
    )
    procesado_el = models.DateTimeField(
        default=timezone.now,
        help_text="Fecha y hora en que se realizó la validación"
    )
    procesado_por = models.CharField(
        max_length=100,
        blank=True,
        help_text="Usuario que procesó la validación (o 'Sistema' si fue automático)"
    )

    class Meta:
        ordering = ["-periodo_anio", "-periodo_mes"]
        unique_together = ("periodo_anio", "periodo_mes", "fecha_corte")
        verbose_name = 'Validación de Corte'
        verbose_name_plural = 'Validaciones de Corte'
        indexes = [
            models.Index(fields=['-periodo_anio', '-periodo_mes']),
            models.Index(fields=['fecha_corte']),
        ]

    @property
    def periodo_str(self):
        """
        Retorna el periodo en formato legible.

        Returns:
            String con el periodo validado (ej: 'Octubre 2024')
        """
        meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        if 1 <= self.periodo_mes <= 12:
            return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
        return f"{self.periodo_anio}-{self.periodo_mes:02d}"

    @property
    def tasa_validacion(self) -> float:
        """
        Calcula el porcentaje de usuarios validados.

        Returns:
            Porcentaje de usuarios validados sobre el total (0-100)

        Ejemplo:
            >>> validacion = ValidacionCorte(total_usuarios=100, usuarios_validados=85)
            >>> validacion.tasa_validacion
            85.0
        """
        if self.total_usuarios == 0:
            return 0.0
        return round((self.usuarios_validados / self.total_usuarios) * 100, 2)

    def __str__(self) -> str:
        return f"ValidacionCorte({self.periodo_str} - {self.fecha_corte})"
