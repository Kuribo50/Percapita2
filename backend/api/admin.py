from django.contrib import admin

from .models import CorteFonasa, HpTrakcare, NuevoUsuario, ValidacionCorte, Catalogo, HistorialCarga


@admin.register(CorteFonasa)
class CorteFonasaAdmin(admin.ModelAdmin):
	list_display = ("run", "fecha_corte", "nombre_centro", "motivo")
	list_filter = ("fecha_corte", "nombre_centro", "motivo")
	search_fields = ("run", "nombres", "ap_paterno", "ap_materno")


@admin.register(HpTrakcare)
class HpTrakcareAdmin(admin.ModelAdmin):
	list_display = ("run", "nombre", "ap_paterno", "centro_inscripcion")
	list_filter = ("centro_inscripcion", "servicio_salud", "prevision")
	search_fields = ("run", "nombre", "ap_paterno", "ap_materno", "cod_registro")


@admin.register(NuevoUsuario)
class NuevoUsuarioAdmin(admin.ModelAdmin):
	list_display = ("run", "nombre_completo", "fecha_solicitud", "periodo_str", "estado")
	list_filter = ("estado", "periodo_anio", "periodo_mes", "nacionalidad", "sector")
	search_fields = ("run", "nombre_completo", "codigo_percapita")
	readonly_fields = ("creado_el", "modificado_el")


@admin.register(ValidacionCorte)
class ValidacionCorteAdmin(admin.ModelAdmin):
	list_display = ("periodo_str", "fecha_corte", "total_usuarios", "usuarios_validados", "usuarios_no_validados")
	list_filter = ("periodo_anio", "periodo_mes", "fecha_corte")
	readonly_fields = ("procesado_el",)


@admin.register(Catalogo)
class CatalogoAdmin(admin.ModelAdmin):
	list_display = ("tipo", "nombre", "codigo", "color", "activo", "orden")
	list_filter = ("tipo", "activo")
	search_fields = ("nombre", "codigo")
	list_editable = ("activo", "orden")
	ordering = ("tipo", "orden", "nombre")


@admin.register(HistorialCarga)
class HistorialCargaAdmin(admin.ModelAdmin):
	list_display = ("fecha_carga", "tipo_carga", "usuario", "nombre_archivo", "total_registros", "estado", "tasa_exito")
	list_filter = ("tipo_carga", "estado", "fecha_carga", "periodo_anio", "periodo_mes")
	search_fields = ("usuario", "nombre_archivo", "observaciones")
	readonly_fields = ("fecha_carga", "tasa_exito")
	ordering = ("-fecha_carga",)
	
	def tasa_exito(self, obj):
		return f"{obj.tasa_exito}%"
	tasa_exito.short_description = "Tasa de Éxito"

