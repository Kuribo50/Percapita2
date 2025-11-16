"""
Módulo de Serializers del Sistema Per Cápita FONASA.

Este módulo exporta todos los serializers del sistema organizados
de forma modular por dominio.

Organización:
    - catalogos: Serializers de catálogos maestros
    - cortes: Serializers de cortes FONASA
    - hp_trakcare: Serializers de HP Trakcare
    - usuarios: Serializers de gestión de usuarios, validaciones e historial

Importar serializers:
    from api.serializers import CorteFonasaDetailSerializer, NuevoUsuarioSerializer, etc.
"""

# Serializers de Catálogos
from .catalogos import (
    EtniaSerializer,
    NacionalidadSerializer,
    SectorSerializer,
    SubsectorSerializer,
    EstablecimientoSerializer,
)

# Serializers de Cortes FONASA
from .cortes import (
    CorteFonasaRecordSerializer,
    CorteFonasaDetailSerializer,
    CorteFonasaObservacionSerializer,
)

# Serializers de HP Trakcare
from .hp_trakcare import (
    HpTrakcareRecordSerializer,
    HpTrakcareDetailSerializer,
)

# Serializers de Usuarios, Validaciones e Historial
from .usuarios import (
    NuevoUsuarioRecordSerializer,
    NuevoUsuarioSerializer,
    ValidacionCorteSerializer,
    HistorialCargaSerializer,
)

# Exportar todos los serializers
__all__ = [
    # Catálogos
    'EtniaSerializer',
    'NacionalidadSerializer',
    'SectorSerializer',
    'SubsectorSerializer',
    'EstablecimientoSerializer',
    # Cortes FONASA
    'CorteFonasaRecordSerializer',
    'CorteFonasaDetailSerializer',
    'CorteFonasaObservacionSerializer',
    # HP Trakcare
    'HpTrakcareRecordSerializer',
    'HpTrakcareDetailSerializer',
    # Usuarios, Validaciones e Historial
    'NuevoUsuarioRecordSerializer',
    'NuevoUsuarioSerializer',
    'ValidacionCorteSerializer',
    'HistorialCargaSerializer',
]
