"""
Modelos de Catálogos del Sistema.

Este módulo contiene los modelos de catálogos que son utilizados como datos maestros
en todo el sistema. Estos catálogos son referencias que se usan en otros modelos
principales como NuevoUsuario, HpTrakcare, etc.

Los catálogos incluyen:
- Etnia: Pueblos originarios y grupos étnicos
- Nacionalidad: Países de origen de los usuarios
- Sector: Sectores geográficos o administrativos
- Subsector: Subdivisiones de sectores
- Establecimiento: Centros de salud y establecimientos médicos
"""

from django.db import models


class Etnia(models.Model):
    """
    Catálogo de etnias y pueblos originarios.

    Almacena las diferentes etnias reconocidas en el sistema de salud,
    principalmente pueblos originarios de Chile.

    Campos:
        nombre: Nombre de la etnia (ej: "Mapuche", "Aymara", "Rapa Nui")
        activo: Indica si la etnia está activa para uso en el sistema

    Ejemplo:
        >>> etnia = Etnia.objects.create(nombre="Mapuche", activo=True)
        >>> str(etnia)
        'Mapuche'
    """

    nombre = models.CharField(
        max_length=255,
        help_text="Nombre de la etnia o pueblo originario"
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indica si está disponible para selección"
    )

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Etnia'
        verbose_name_plural = 'Etnias'
        indexes = [
            models.Index(fields=['activo']),
        ]

    def __str__(self) -> str:
        return self.nombre


class Nacionalidad(models.Model):
    """
    Catálogo de nacionalidades.

    Almacena los países y nacionalidades reconocidas en el sistema.
    Se utiliza para registrar el país de origen de los usuarios del sistema de salud.

    Campos:
        nombre: Nombre del país o nacionalidad (ej: "Chilena", "Peruana", "Venezolana")
        activo: Indica si la nacionalidad está activa para uso

    Ejemplo:
        >>> nacionalidad = Nacionalidad.objects.create(nombre="Chilena", activo=True)
        >>> str(nacionalidad)
        'Chilena'
    """

    nombre = models.CharField(
        max_length=255,
        help_text="Nombre del país o nacionalidad"
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indica si está disponible para selección"
    )

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Nacionalidad'
        verbose_name_plural = 'Nacionalidades'
        indexes = [
            models.Index(fields=['activo']),
        ]

    def __str__(self) -> str:
        return self.nombre


class Sector(models.Model):
    """
    Catálogo de sectores geográficos o administrativos.

    Los sectores representan divisiones geográficas utilizadas para organizar
    la atención de salud. Cada establecimiento de salud atiende a uno o más sectores.

    Campos:
        nombre: Nombre del sector
        activo: Indica si el sector está activo

    Ejemplo:
        >>> sector = Sector.objects.create(nombre="Sector Norte", activo=True)
        >>> str(sector)
        'Sector Norte'
    """

    nombre = models.CharField(
        max_length=255,
        help_text="Nombre del sector geográfico o administrativo"
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indica si está activo para uso"
    )

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Sector'
        verbose_name_plural = 'Sectores'
        indexes = [
            models.Index(fields=['activo']),
        ]

    def __str__(self) -> str:
        return self.nombre


class Subsector(models.Model):
    """
    Catálogo de subsectores (subdivisiones de sectores).

    Los subsectores son subdivisiones más específicas dentro de un sector,
    permitiendo una organización territorial más granular.

    Campos:
        nombre: Nombre del subsector
        codigo: Código identificador del subsector (opcional)
        activo: Indica si el subsector está activo

    Ejemplo:
        >>> subsector = Subsector.objects.create(
        ...     nombre="Subsector 1A",
        ...     codigo="S1A",
        ...     activo=True
        ... )
        >>> str(subsector)
        'Subsector 1A (S1A)'
    """

    nombre = models.CharField(
        max_length=255,
        help_text="Nombre del subsector"
    )
    codigo = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_index=True,
        help_text="Código identificador del subsector"
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indica si está activo para uso"
    )

    class Meta:
        ordering = ['codigo', 'nombre']
        verbose_name = 'Subsector'
        verbose_name_plural = 'Subsectores'
        indexes = [
            models.Index(fields=['activo']),
            models.Index(fields=['codigo']),
        ]

    def __str__(self) -> str:
        if self.codigo:
            return f"{self.nombre} ({self.codigo})"
        return self.nombre


class Establecimiento(models.Model):
    """
    Catálogo de establecimientos y centros de salud.

    Almacena la información de todos los establecimientos de salud del sistema,
    incluyendo CESFAM, COSAM, hospitales, etc.

    Campos:
        nombre: Nombre completo del establecimiento
        codigo: Código identificador único del establecimiento (opcional)
        activo: Indica si el establecimiento está activo

    Ejemplo:
        >>> establecimiento = Establecimiento.objects.create(
        ...     nombre="CESFAM Dr. Juan Martínez",
        ...     codigo="CESF001",
        ...     activo=True
        ... )
        >>> str(establecimiento)
        'CESFAM Dr. Juan Martínez (CESF001)'
    """

    nombre = models.CharField(
        max_length=255,
        help_text="Nombre completo del establecimiento de salud"
    )
    codigo = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_index=True,
        help_text="Código identificador único del establecimiento"
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indica si está activo para uso"
    )

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Establecimiento'
        verbose_name_plural = 'Establecimientos'
        indexes = [
            models.Index(fields=['activo']),
        ]

    def __str__(self) -> str:
        if self.codigo:
            return f"{self.nombre} ({self.codigo})"
        return self.nombre
