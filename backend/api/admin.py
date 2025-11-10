from django.contrib import admin
from django.contrib import messages
from django.shortcuts import render
from django.urls import path

from .models import (
	CorteFonasa, 
	HpTrakcare, 
	NuevoUsuario, 
	ValidacionCorte, 
	HistorialCarga,
	Etnia,
	Nacionalidad,
	Sector,
	Subsector,
	Establecimiento,
	Usuario,
)


@admin.register(CorteFonasa)
class CorteFonasaAdmin(admin.ModelAdmin):
	list_display = ("run", "fecha_corte", "nombre_centro", "motivo")
	list_filter = ("fecha_corte", "nombre_centro", "motivo")
	search_fields = ("run", "nombres", "ap_paterno", "ap_materno")


@admin.register(HpTrakcare)
class HpTrakcareAdmin(admin.ModelAdmin):
	list_display = ("run", "nombre", "ap_paterno", "sector", "nacionalidad")
	list_filter = ("sector", "nacionalidad", "etnia")
	search_fields = ("run", "nombre", "ap_paterno", "ap_materno", "cod_registro")


@admin.register(NuevoUsuario)
class NuevoUsuarioAdmin(admin.ModelAdmin):
	list_display = ("run", "nombre_completo", "fecha_inscripcion", "periodo_str", "estado", "sector", "nacionalidad")
	list_filter = ("estado", "periodo_anio", "periodo_mes", "nacionalidad", "sector", "etnia")
	search_fields = ("run", "nombre_completo", "codigo_percapita")
	readonly_fields = ("creado_el", "modificado_el")


@admin.register(ValidacionCorte)
class ValidacionCorteAdmin(admin.ModelAdmin):
	list_display = ("periodo_str", "fecha_corte", "total_usuarios", "usuarios_validados", "usuarios_no_validados")
	list_filter = ("periodo_anio", "periodo_mes", "fecha_corte")
	readonly_fields = ("procesado_el",)


# =============================================================================
# ADMINISTRACIÓN DE CATÁLOGOS
# =============================================================================

@admin.register(Etnia)
class EtniaAdmin(admin.ModelAdmin):
	list_display = ("nombre", "activo")
	list_filter = ("activo",)
	search_fields = ("nombre", "descripcion")
	list_editable = ("activo",)
	ordering = ("nombre",)


@admin.register(Nacionalidad)
class NacionalidadAdmin(admin.ModelAdmin):
	list_display = ("nombre", "activo")
	list_filter = ("activo",)
	search_fields = ("nombre", "descripcion")
	list_editable = ("activo",)
	ordering = ("nombre",)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
	list_display = ("nombre", "activo")
	list_filter = ("activo",)
	search_fields = ("nombre", "descripcion")
	list_editable = ("activo",)
	ordering = ("nombre",)


@admin.register(Subsector)
class SubsectorAdmin(admin.ModelAdmin):
	list_display = ("nombre", "codigo", "activo")
	list_filter = ("activo",)
	search_fields = ("nombre", "codigo", "descripcion")
	list_editable = ("activo",)
	ordering = ("nombre",)


@admin.register(Establecimiento)
class EstablecimientoAdmin(admin.ModelAdmin):
	list_display = ("nombre", "codigo", "activo")
	list_filter = ("activo",)
	search_fields = ("nombre", "codigo")
	list_editable = ("activo",)
	ordering = ("nombre",)


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
	list_display = ("username", "nombre_completo", "es_admin", "activo", "ultimo_acceso")
	list_filter = ("es_admin", "activo")
	search_fields = ("username", "nombre_completo", "email")
	list_editable = ("activo",)
	readonly_fields = ("creado_el", "modificado_el", "ultimo_acceso")
	ordering = ("username",)
	
	fieldsets = (
		('Información Básica', {
			'fields': ('username', 'nombre_completo', 'email')
		}),
		('Permisos', {
			'fields': ('es_admin', 'activo')
		}),
		('Contraseña', {
			'fields': ('password_hash',),
			'description': 'Use la acción "Cambiar contraseña" para modificar la contraseña de forma segura.'
		}),
		('Metadatos', {
			'fields': ('ultimo_acceso', 'creado_el', 'modificado_el'),
			'classes': ('collapse',)
		}),
	)
	
	actions = ['cambiar_contrasena_action']
	
	def cambiar_contrasena_action(self, request, queryset):
		"""Acción para cambiar contraseña de usuarios seleccionados."""
		if 'apply' in request.POST:
			nueva_contrasena = request.POST.get('nueva_contrasena')
			if nueva_contrasena:
				count = 0
				for usuario in queryset:
					usuario.set_password(nueva_contrasena)
					usuario.save()
					count += 1
				self.message_user(request, f"Contraseña cambiada para {count} usuario(s).", messages.SUCCESS)
				return None
		
		return render(request, 'admin/cambiar_contrasena.html', {
			'usuarios': queryset,
			'action_checkbox_name': admin.helpers.ACTION_CHECKBOX_NAME,
		})
	
	cambiar_contrasena_action.short_description = "Cambiar contraseña de usuarios seleccionados"


@admin.register(HistorialCarga)
class HistorialCargaAdmin(admin.ModelAdmin):
	list_display = ("fecha_carga", "tipo_carga", "usuario", "nombre_archivo", "total_registros", "estado", "tasa_exito")
	list_filter = ("tipo_carga", "estado", "fecha_carga", "periodo_anio", "periodo_mes")
	search_fields = ("usuario", "nombre_archivo", "observaciones")
	readonly_fields = ("fecha_carga", "tasa_exito", "registros_exitosos")
	ordering = ("-fecha_carga",)
	
	def tasa_exito(self, obj):
		return f"{obj.tasa_exito}%"
	tasa_exito.short_description = "Tasa de Éxito"

