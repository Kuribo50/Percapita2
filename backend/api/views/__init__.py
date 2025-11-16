"""
Módulo de Vistas del Sistema Per Cápita FONASA.

Este módulo exporta todas las vistas del sistema. La refactorización está en progreso:
- utils.py: Utilidades compartidas (COMPLETO)
- busqueda.py: Búsqueda de usuarios y familias (COMPLETO)
- Resto de vistas: Temporalmente importadas desde views_old.py

TODO: Completar división en:
  - cortes.py
  - hp_trakcare.py
  - usuarios.py
  - validaciones.py
  - catalogos.py
  - historial.py
  - auth.py
"""

# Importar vistas ya refactorizadas
from .busqueda import buscar_usuario, buscar_familia

# Importar temporalmente el resto desde el archivo original
# TODO: Dividir estas vistas en módulos separados
from ..views_old import (
    # Cortes FONASA
    upload_corte_fonasa,
    corte_fonasa_detail,
    corte_fonasa_historial_mensual,

    # HP Trakcare
    upload_hp_trakcare,
    hp_trakcare_detail,
    hp_trakcare_buscar,

    # Nuevos Usuarios
    nuevos_usuarios_list,
    nuevo_usuario_detail,
    marcar_usuario_revisado,
    nuevos_usuarios_estadisticas,
    nuevos_usuarios_historial,
    exportar_nuevos_usuarios,
    upload_nuevos_usuarios,
    validar_nuevos_usuarios_lote,

    # Usuarios No Validados
    usuarios_no_validados_list,
    usuario_no_validado_detail,
    usuario_no_validado_observaciones,
    usuario_no_validado_observacion_detail,

    # Validaciones
    validar_contra_corte,
    validaciones_list,
    validacion_detail,

    # Catálogos
    catalogos_all,
    etnias_list,
    etnia_detail,
    nacionalidades_list,
    nacionalidad_detail,
    sectores_list,
    sector_detail,
    subsectores_list,
    subsector_detail,
    establecimientos_list,
    establecimiento_detail,
    centros_disponibles,

    # Historial
    historial_cargas,

    # Autenticación y Usuarios del Sistema
    usuarios_list,
    usuario_detail,
    cambiar_password,
)

# Exportar todas las vistas
__all__ = [
    # Búsqueda (refactorizado)
    'buscar_usuario',
    'buscar_familia',

    # Cortes FONASA
    'upload_corte_fonasa',
    'corte_fonasa_detail',
    'corte_fonasa_historial_mensual',

    # HP Trakcare
    'upload_hp_trakcare',
    'hp_trakcare_detail',
    'hp_trakcare_buscar',

    # Nuevos Usuarios
    'nuevos_usuarios_list',
    'nuevo_usuario_detail',
    'marcar_usuario_revisado',
    'nuevos_usuarios_estadisticas',
    'nuevos_usuarios_historial',
    'exportar_nuevos_usuarios',
    'upload_nuevos_usuarios',
    'validar_nuevos_usuarios_lote',

    # Usuarios No Validados
    'usuarios_no_validados_list',
    'usuario_no_validado_detail',
    'usuario_no_validado_observaciones',
    'usuario_no_validado_observacion_detail',

    # Validaciones
    'validar_contra_corte',
    'validaciones_list',
    'validacion_detail',

    # Catálogos
    'catalogos_all',
    'etnias_list',
    'etnia_detail',
    'nacionalidades_list',
    'nacionalidad_detail',
    'sectores_list',
    'sector_detail',
    'subsectores_list',
    'subsector_detail',
    'establecimientos_list',
    'establecimiento_detail',
    'centros_disponibles',

    # Historial
    'historial_cargas',

    # Autenticación y Usuarios
    'usuarios_list',
    'usuario_detail',
    'cambiar_password',
]
