"""
Modelo de HP Trakcare.

Este módulo contiene el modelo para los registros de usuarios en el sistema
HP Trakcare, que es el sistema de información clínica hospitalaria utilizado
por los establecimientos de salud.

HP Trakcare almacena información completa de pacientes incluyendo datos
demográficos, información de contacto, datos de salud y fechas importantes.
"""

from django.db import models
from django.utils import timezone

from .utils import normalize_run
from .catalogos import Etnia, Nacionalidad, Establecimiento, Sector


class HpTrakcare(models.Model):
    """
    Registro de usuario en el sistema HP Trakcare.

    HP Trakcare es el sistema de información clínica que almacena la ficha
    completa de cada paciente. Este modelo replica esa información para permitir
    validaciones cruzadas con los cortes FONASA y otros sistemas.

    Campos principales:
        run: RUN del paciente (normalizado automáticamente)
        nombre, ap_paterno, ap_materno: Datos personales
        id_trakcare: ID único en el sistema Trakcare
        cod_familia: Código de grupo familiar
        cod_registro: Código de registro adicional

    Relaciones con catálogos:
        etnia: Etnia del paciente
        nacionalidad: Nacionalidad del paciente
        centro_inscripcion: Centro de salud donde está inscrito
        sector: Sector territorial asignado

    Información de contacto:
        direccion: Domicilio del paciente
        telefono: Teléfono fijo
        telefono_celular: Teléfono móvil
        telefono_recado: Teléfono para dejar recados

    Información de salud:
        servicio_salud: Servicio de salud al que pertenece
        prevision: Sistema previsional (FONASA, ISAPRE, etc.)
        plan_trakcare: Plan de salud en Trakcare
        prais_trakcare: Programa PRAIS (Programa de Reparación y Atención Integral en Salud)

    Fechas importantes:
        fecha_nacimiento: Fecha de nacimiento
        fecha_incorporacion: Fecha de ingreso al sistema
        fecha_ultima_modif: Última modificación del registro
        fecha_defuncion: Fecha de fallecimiento (si aplica)

    Nota importante:
        - Los RUNs se normalizan automáticamente al guardar
        - Se puede verificar si un paciente está vivo con la propiedad esta_vivo
        - Se pueden obtener los cortes FONASA relacionados con cortes_relacionados()
    """

    # Información familiar y de registro
    cod_familia = models.CharField(
        max_length=100,
        blank=True,
        help_text="Código del grupo familiar"
    )
    relacion_parentezco = models.CharField(
        max_length=100,
        blank=True,
        help_text="Relación de parentesco con jefe de familia"
    )
    id_trakcare = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text="ID único en el sistema HP Trakcare"
    )
    cod_registro = models.CharField(
        max_length=100,
        blank=True,
        help_text="Código de registro adicional"
    )

    # Relaciones con catálogos
    etnia = models.ForeignKey(
        Etnia,
        on_delete=models.SET_NULL,
        related_name='hp_usuarios',
        null=True,
        blank=True,
        help_text="Etnia o pueblo originario del paciente"
    )
    nacionalidad = models.ForeignKey(
        Nacionalidad,
        on_delete=models.SET_NULL,
        related_name='hp_usuarios',
        null=True,
        blank=True,
        help_text="Nacionalidad del paciente"
    )
    centro_inscripcion = models.ForeignKey(
        Establecimiento,
        on_delete=models.SET_NULL,
        related_name='hp_usuarios',
        null=True,
        blank=True,
        help_text="Centro de salud donde está inscrito"
    )
    sector = models.ForeignKey(
        Sector,
        on_delete=models.SET_NULL,
        related_name='hp_usuarios',
        null=True,
        blank=True,
        help_text="Sector territorial asignado"
    )

    # Información personal
    run = models.CharField(
        max_length=12,
        db_index=True,
        blank=True,
        help_text="RUN del paciente (formato: XXXXXXXX-Y)"
    )
    ap_paterno = models.CharField(
        max_length=255,
        blank=True,
        help_text="Apellido paterno"
    )
    ap_materno = models.CharField(
        max_length=255,
        blank=True,
        help_text="Apellido materno"
    )
    nombre = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nombres"
    )
    genero = models.CharField(
        max_length=20,
        blank=True,
        help_text="Género del paciente"
    )
    fecha_nacimiento = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de nacimiento"
    )
    edad = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Edad del paciente"
    )

    # Información de contacto
    direccion = models.CharField(
        max_length=255,
        blank=True,
        help_text="Dirección del domicilio"
    )
    telefono = models.CharField(
        max_length=30,
        blank=True,
        help_text="Teléfono fijo"
    )
    telefono_celular = models.CharField(
        max_length=30,
        blank=True,
        help_text="Teléfono celular"
    )
    telefono_recado = models.CharField(
        max_length=30,
        blank=True,
        help_text="Teléfono para dejar recados"
    )

    # Información de salud
    servicio_salud = models.CharField(
        max_length=255,
        blank=True,
        help_text="Servicio de Salud al que pertenece"
    )
    prevision = models.CharField(
        max_length=100,
        blank=True,
        help_text="Sistema previsional (FONASA, ISAPRE, etc.)"
    )
    plan_trakcare = models.CharField(
        max_length=100,
        blank=True,
        help_text="Plan de salud en Trakcare"
    )
    prais_trakcare = models.CharField(
        max_length=100,
        blank=True,
        help_text="Programa PRAIS (Programa de Reparación y Atención Integral)"
    )

    # Fechas importantes
    fecha_incorporacion = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de incorporación al sistema"
    )
    fecha_ultima_modif = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de última modificación del registro"
    )
    fecha_defuncion = models.DateField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Fecha de fallecimiento (si aplica)"
    )

    # Metadatos
    creado_el = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Fecha y hora de creación del registro en este sistema"
    )

    class Meta:
        ordering = ["run", "nombre"]
        verbose_name = 'HP Trakcare'
        verbose_name_plural = 'HP Trakcare'
        indexes = [
            models.Index(fields=['run', 'fecha_defuncion']),
            models.Index(fields=['id_trakcare']),
            models.Index(fields=['sector', 'run']),
        ]

    def save(self, *args, **kwargs):
        """
        Normaliza el RUN antes de guardar.

        Garantiza que los RUNs sean consistentes en toda la base de datos.
        """
        self.run = normalize_run(self.run)
        super().save(*args, **kwargs)

    @property
    def nombre_completo(self) -> str:
        """
        Retorna el nombre completo del paciente.

        Returns:
            Nombre completo concatenado de nombres y apellidos
        """
        partes = [self.nombre, self.ap_paterno, self.ap_materno]
        return " ".join(p for p in partes if p).strip()

    @property
    def esta_vivo(self) -> bool:
        """
        Verifica si el paciente está vivo.

        Returns:
            True si no tiene fecha de defunción, False si la tiene
        """
        return self.fecha_defuncion is None

    def cortes_relacionados(self):
        """
        Retorna los cortes FONASA relacionados con este paciente.

        Returns:
            QuerySet de CorteFonasa con todos los registros que comparten el mismo RUN

        Ejemplo:
            >>> paciente = HpTrakcare.objects.get(run="12345678-9")
            >>> cortes = paciente.cortes_relacionados()
            >>> print(cortes.count())
            12
        """
        from .cortes import CorteFonasa
        return CorteFonasa.objects.filter(run=self.run)

    def __str__(self) -> str:
        return f"HpTrakcare({self.run or 'SIN RUN'})"
