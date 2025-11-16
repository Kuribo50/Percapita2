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
from .busqueda_global import busqueda_global
from .usuarios import (
    usuarios_list,
    usuario_detail,
    restablecer_password,
    asignar_centros,
    roles_disponibles,
)
from .auditoria import (
    logs_list,
    log_detail,
    notificaciones_list,
    marcar_notificacion_leida,
    marcar_todas_leidas,
    notificaciones_no_leidas_count,
    acciones_disponibles,
    modulos_disponibles,
)

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

    # Autenticación
    cambiar_password,
)

# Exportar todas las vistas
__all__ = [
    # Búsqueda (refactorizado)
    'buscar_usuario',
    'buscar_familia',
    'busqueda_global',

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

    # Autenticación y Usuarios del Sistema
    'usuarios_list',
    'usuario_detail',
    'restablecer_password',
    'asignar_centros',
    'roles_disponibles',
    'cambiar_password',

    # Auditoría y Notificaciones
    'logs_list',
    'log_detail',
    'notificaciones_list',
    'marcar_notificacion_leida',
    'marcar_todas_leidas',
    'notificaciones_no_leidas_count',
    'acciones_disponibles',
    'modulos_disponibles',
]
