"""
Módulo de Modelos del Sistema Per Cápita FONASA.

Este módulo exporta todos los modelos del sistema de gestión per cápita
organizados de forma modular por dominio.

Organización:
    - utils: Funciones auxiliares (normalize_run, normalize_motivo, etc.)
    - catalogos: Modelos de catálogos maestros
    - cortes: Modelos de cortes FONASA
    - hp_trakcare: Modelo de HP Trakcare
    - usuarios: Modelos de gestión de nuevos usuarios y validaciones
    - historial: Modelo de historial de cargas
    - auth: Modelo de autenticación

Importar modelos:
    from api.models import CorteFonasa, HpTrakcare, Usuario, Etnia, etc.
"""

# Utilidades
from .utils import (
    normalize_run,
    normalize_motivo,
    observacion_upload_to,
    MOTIVO_REPLACEMENTS,
)

# Catálogos
from .catalogos import (
    Etnia,
    Nacionalidad,
    Sector,
    Subsector,
    Establecimiento,
)

# Cortes FONASA
from .cortes import (
    CorteFonasa,
    CorteFonasaObservacion,
)

# HP Trakcare
from .hp_trakcare import (
    HpTrakcare,
)

# Gestión de Usuarios
from .usuarios import (
    NuevoUsuario,
    ValidacionCorte,
)

# Historial
from .historial import (
    HistorialCarga,
)

# Autenticación
from .auth import (
    Usuario,
)

# Auditoría
from .auditoria import (
    LogActividad,
    Notificacion,
)

# Exportar todos los modelos y utilidades
__all__ = [
    # Utilidades
    'normalize_run',
    'normalize_motivo',
    'observacion_upload_to',
    'MOTIVO_REPLACEMENTS',
    # Catálogos
    'Etnia',
    'Nacionalidad',
    'Sector',
    'Subsector',
    'Establecimiento',
    # Cortes
    'CorteFonasa',
    'CorteFonasaObservacion',
    # HP Trakcare
    'HpTrakcare',
    # Usuarios
    'NuevoUsuario',
    'ValidacionCorte',
    # Historial
    'HistorialCarga',
    # Autenticación
    'Usuario',
    # Auditoría
    'LogActividad',
    'Notificacion',
]
