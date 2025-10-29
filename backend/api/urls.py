from django.urls import path
from . import views

urlpatterns = [
    path("corte-fonasa/", views.upload_corte_fonasa, name="corte-fonasa-upload"),
    path("corte-fonasa/<int:pk>/", views.corte_fonasa_detail, name="corte-fonasa-detail"),
    path("hp-trakcare/", views.upload_hp_trakcare, name="hp-trakcare-upload"),
    path("hp-trakcare/<int:pk>/", views.hp_trakcare_detail, name="hp-trakcare-detail"),
    
    # Nuevos Usuarios
    path("nuevos-usuarios/", views.nuevos_usuarios_list, name="nuevos-usuarios-list"),
    path("nuevos-usuarios/<int:pk>/", views.nuevo_usuario_detail, name="nuevo-usuario-detail"),
    path("nuevos-usuarios/estadisticas/", views.nuevos_usuarios_estadisticas, name="nuevos-usuarios-estadisticas"),
    
    # Validaciones
    path("validaciones/", views.validaciones_list, name="validaciones-list"),
    path("validaciones/<int:pk>/", views.validacion_detail, name="validacion-detail"),
    path("validaciones/validar-corte/", views.validar_contra_corte, name="validar-contra-corte"),
    
    # Catálogos
    path("catalogos/", views.catalogos_list, name="catalogos-list"),
    path("catalogos/<int:pk>/", views.catalogo_detail, name="catalogo-detail"),
    path("catalogos/por-tipo/", views.catalogos_por_tipo, name="catalogos-por-tipo"),
    
    # Historial de Cargas
    path("historial-cargas/", views.historial_cargas, name="historial-cargas"),
]
