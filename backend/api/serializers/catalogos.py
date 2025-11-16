"""
Serializers para modelos de Catálogos.

Este módulo contiene los serializers para todos los modelos de catálogos maestros
del sistema. Estos catálogos son datos de referencia utilizados en todo el sistema.

Serializers:
    - EtniaSerializer: Serializer para el modelo Etnia
    - NacionalidadSerializer: Serializer para el modelo Nacionalidad
    - SectorSerializer: Serializer para el modelo Sector
    - SubsectorSerializer: Serializer para el modelo Subsector
    - EstablecimientoSerializer: Serializer para el modelo Establecimiento
"""

from rest_framework import serializers

from api.models import (
    Etnia,
    Nacionalidad,
    Sector,
    Subsector,
    Establecimiento,
)


class EtniaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Etnia.

    Campos:
        id: ID único del registro
        nombre: Nombre de la etnia
        activo: Indica si está activa para uso

    Ejemplo de uso:
        >>> etnia = Etnia.objects.get(nombre="Mapuche")
        >>> serializer = EtniaSerializer(etnia)
        >>> serializer.data
        {'id': 1, 'nombre': 'Mapuche', 'activo': True}
    """

    class Meta:
        model = Etnia
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class NacionalidadSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Nacionalidad.

    Campos:
        id: ID único del registro
        nombre: Nombre de la nacionalidad/país
        activo: Indica si está activa para uso

    Ejemplo de uso:
        >>> nacionalidad = Nacionalidad.objects.get(nombre="Chilena")
        >>> serializer = NacionalidadSerializer(nacionalidad)
        >>> serializer.data
        {'id': 1, 'nombre': 'Chilena', 'activo': True}
    """

    class Meta:
        model = Nacionalidad
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class SectorSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Sector.

    Campos:
        id: ID único del registro
        nombre: Nombre del sector territorial
        activo: Indica si está activo para uso

    Ejemplo de uso:
        >>> sector = Sector.objects.get(nombre="Sector Norte")
        >>> serializer = SectorSerializer(sector)
        >>> serializer.data
        {'id': 1, 'nombre': 'Sector Norte', 'activo': True}
    """

    class Meta:
        model = Sector
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class SubsectorSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Subsector.

    Campos:
        id: ID único del registro
        nombre: Nombre del subsector
        codigo: Código identificador del subsector
        activo: Indica si está activo para uso

    Ejemplo de uso:
        >>> subsector = Subsector.objects.get(codigo="S1A")
        >>> serializer = SubsectorSerializer(subsector)
        >>> serializer.data
        {'id': 1, 'nombre': 'Subsector 1A', 'codigo': 'S1A', 'activo': True}
    """

    class Meta:
        model = Subsector
        fields = [
            "id",
            "nombre",
            "codigo",
            "activo",
        ]
        read_only_fields = ("id",)


class EstablecimientoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Establecimiento.

    Campos:
        id: ID único del registro
        nombre: Nombre del establecimiento de salud
        codigo: Código identificador único
        activo: Indica si está activo para uso

    Ejemplo de uso:
        >>> est = Establecimiento.objects.get(codigo="CESF001")
        >>> serializer = EstablecimientoSerializer(est)
        >>> serializer.data
        {'id': 1, 'nombre': 'CESFAM Dr. Juan Martínez', 'codigo': 'CESF001', 'activo': True}
    """

    class Meta:
        model = Establecimiento
        fields = [
            "id",
            "nombre",
            "codigo",
            "activo",
        ]
        read_only_fields = ("id",)
