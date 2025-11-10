from django.urls import path
from . import views

urlpatterns = [
    path("corte-fonasa/", views.upload_corte_fonasa, name="corte-fonasa-upload"),
    path("corte-fonasa/<int:pk>/", views.corte_fonasa_detail, name="corte-fonasa-detail"),
    path("hp-trakcare/", views.upload_hp_trakcare, name="hp-trakcare-upload"),
    path("hp-trakcare/<int:pk>/", views.hp_trakcare_detail, name="hp-trakcare-detail"),
    path("hp-trakcare/buscar/", views.hp_trakcare_buscar, name="hp-trakcare-buscar"),
    
    # Nuevos Usuarios
    path("nuevos-usuarios/", views.nuevos_usuarios_list, name="nuevos-usuarios-list"),
    path("nuevos-usuarios/upload/", views.upload_nuevos_usuarios, name="upload-nuevos-usuarios"),
    path("nuevos-usuarios/<int:pk>/", views.nuevo_usuario_detail, name="nuevo-usuario-detail"),
    path("nuevos-usuarios/<int:pk>/marcar-revisado/", views.marcar_usuario_revisado, name="marcar-usuario-revisado"),
    path("nuevos-usuarios/validar-lote/", views.validar_nuevos_usuarios_lote, name="validar-nuevos-usuarios-lote"),
    path("nuevos-usuarios/estadisticas/", views.nuevos_usuarios_estadisticas, name="nuevos-usuarios-estadisticas"),
    path("nuevos-usuarios/exportar/", views.exportar_nuevos_usuarios, name="exportar-nuevos-usuarios"),
    path("nuevos-usuarios/historial/", views.nuevos_usuarios_historial, name="nuevos-usuarios-historial"),
    path("nuevos-usuarios/historial/", views.nuevos_usuarios_historial, name="nuevos-usuarios-historial"),
    
    # Validaciones
    path("validaciones/", views.validaciones_list, name="validaciones-list"),
    path("validaciones/<int:pk>/", views.validacion_detail, name="validacion-detail"),
    path("validaciones/validar-corte/", views.validar_contra_corte, name="validar-contra-corte"),
    
    # Catálogos
    path("catalogos/all/", views.catalogos_all, name="catalogos-all"),
    
    # Etnias
    path("catalogos/etnias/", views.etnias_list, name="etnias-list"),
    path("catalogos/etnias/<int:pk>/", views.etnia_detail, name="etnia-detail"),
    
    # Nacionalidades
    path("catalogos/nacionalidades/", views.nacionalidades_list, name="nacionalidades-list"),
    path("catalogos/nacionalidades/<int:pk>/", views.nacionalidad_detail, name="nacionalidad-detail"),
    
    # Sectores
    path("catalogos/sectores/", views.sectores_list, name="sectores-list"),
    path("catalogos/sectores/<int:pk>/", views.sector_detail, name="sector-detail"),
    
    # Subsectores
    path("catalogos/subsectores/", views.subsectores_list, name="subsectores-list"),
    path("catalogos/subsectores/<int:pk>/", views.subsector_detail, name="subsector-detail"),
    
    # Establecimientos
    path("catalogos/establecimientos/", views.establecimientos_list, name="establecimientos-list"),
    path("catalogos/establecimientos/<int:pk>/", views.establecimiento_detail, name="establecimiento-detail"),
    
    # Historial de Cargas
    path("historial-cargas/", views.historial_cargas, name="historial-cargas"),
    
    # Centros
    path("centros-disponibles/", views.centros_disponibles, name="centros-disponibles"),
    
    # Administración de Usuarios
    path("usuarios/", views.usuarios_list, name="usuarios-list"),
    path("usuarios/<int:pk>/", views.usuario_detail, name="usuario-detail"),
    path("usuarios/<int:pk>/cambiar-password/", views.cambiar_password, name="cambiar-password"),
]
