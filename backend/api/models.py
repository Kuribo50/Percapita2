from typing import Optional
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.hashers import make_password, check_password


def normalize_run(value: str) -> str:

	"""Sanitize RUN to standard format: XXXXXXXX-Y for reliable matching."""
	if not value:
		return ""

	# Limpiar: mantener solo dígitos, K y guiones
	cleaned = "".join(ch for ch in value.upper() if ch.isdigit() or ch in "K-")
	if not cleaned:
		return ""

	# Si ya tiene guion, retornar tal cual
	if "-" in cleaned:
		return cleaned

	# Si no tiene guion, agregar uno entre el cuerpo y el DV
	# El DV es el último carácter (puede ser número o K)
	if len(cleaned) < 2:
		return cleaned

	dv = cleaned[-1]
	body = cleaned[:-1]

	# Validar que el cuerpo sean solo números
	if not body.isdigit():
		return cleaned

	return f"{body}-{dv}"


MOTIVO_REPLACEMENTS = {
	"Á": "A",
	"À": "A",
	"Â": "A",
	"Ä": "A",
	"Ã": "A",
	"É": "E",
	"È": "E",
	"Ê": "E",
	"Ë": "E",
	"Í": "I",
	"Ì": "I",
	"Î": "I",
	"Ï": "I",
	"Ó": "O",
	"Ò": "O",
	"Ô": "O",
	"Ö": "O",
	"Õ": "O",
	"Ú": "U",
	"Ù": "U",
	"Û": "U",
	"Ü": "U",
	"Ñ": "N",
	"Ç": "C",
	"�": "O",
}


def normalize_motivo(value: Optional[str]) -> str:

	"""Normalize motivo values for consistent lookups and summaries."""
	if not value:
		return ""

	normalized = value.upper()
	for source, target in MOTIVO_REPLACEMENTS.items():
		normalized = normalized.replace(source, target)

	while "  " in normalized:
		normalized = normalized.replace("  ", " ")

	return normalized.strip()


# =============================================================================
# MODELOS DE CATÁLOGOS SIMPLIFICADOS
# =============================================================================

class Etnia(models.Model):
	"""Catálogo de etnias."""
	nombre = models.CharField(max_length=255)
	activo = models.BooleanField(default=True, db_index=True)
	
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
	"""Catálogo de nacionalidades."""
	nombre = models.CharField(max_length=255)
	activo = models.BooleanField(default=True, db_index=True)
	
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
	"""Catálogo de sectores."""
	nombre = models.CharField(max_length=255)
	activo = models.BooleanField(default=True, db_index=True)
	
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
	"""Catálogo de subsectores."""
	nombre = models.CharField(max_length=255)
	codigo = models.CharField(max_length=50, blank=True, null=True, db_index=True)
	activo = models.BooleanField(default=True, db_index=True)
	
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
	"""Catálogo de establecimientos y centros de salud."""
	nombre = models.CharField(max_length=255)
	codigo = models.CharField(max_length=50, blank=True, null=True, db_index=True)
	activo = models.BooleanField(default=True, db_index=True)
	
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


# =============================================================================
# MODELOS PRINCIPALES
# =============================================================================

def observacion_upload_to(instance, filename: str) -> str:
	ext = filename.split(".")[-1] if "." in filename else "bin"
	uid = uuid.uuid4().hex
	return f"observaciones/{instance.corte_id or 'sin-id'}/{uid}.{ext}"


class CorteFonasa(models.Model):
	"""Registro de cortes mensuales de FONASA."""
	run = models.CharField(max_length=12, db_index=True)
	nombres = models.CharField(max_length=255, blank=True)
	ap_paterno = models.CharField(max_length=255, blank=True)
	ap_materno = models.CharField(max_length=255, blank=True)
	fecha_nacimiento = models.DateField(null=True, blank=True)
	genero = models.CharField(max_length=20, blank=True)
	tramo = models.CharField(max_length=50, blank=True)
	fecha_corte = models.DateField(db_index=True)

	# Relaciones con catálogos
	centro_salud = models.ForeignKey(
		Establecimiento,
		on_delete=models.SET_NULL,
		related_name='cortes',
		null=True,
		blank=True
	)
	nombre_centro = models.CharField(max_length=255, blank=True)  # Backup del nombre

	# Información de procedencia y destino
	centro_de_procedencia = models.CharField(max_length=255, blank=True, help_text="Centro de salud de origen")
	comuna_de_procedencia = models.CharField(max_length=100, blank=True, help_text="Comuna de origen")
	
	nombre_centro_actual = models.CharField(max_length=255, blank=True, help_text="Nombre del centro actual/destino")
	centro_actual = models.CharField(max_length=255, blank=True, help_text="Centro de salud actual/destino (legacy)")
	comuna_actual = models.CharField(max_length=100, blank=True, help_text="Comuna actual/destino")

	# Estado y motivo
	aceptado_rechazado = models.CharField(
		max_length=255,
		blank=True,
		default='',
		help_text="Estado de aceptación o rechazo"
	)
	motivo = models.CharField(max_length=255, blank=True)
	motivo_normalizado = models.CharField(max_length=255, blank=True, default="", db_index=True)
	creado_el = models.DateTimeField(default=timezone.now, editable=False)

	class Meta:
		ordering = ["-fecha_corte", "run"]
		# Eliminado unique_together para permitir duplicados (un RUN puede aparecer múltiples veces en el mismo mes)
		verbose_name = 'Corte FONASA'
		verbose_name_plural = 'Cortes FONASA'
		indexes = [
			models.Index(fields=['run', 'fecha_corte']),
			models.Index(fields=['fecha_corte', 'motivo_normalizado']),
			models.Index(fields=['-fecha_corte', 'centro_salud']),
		]

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		self.motivo_normalizado = normalize_motivo(self.motivo)
		super().save(*args, **kwargs)

	@property
	def nombre_completo(self) -> str:
		"""Retorna el nombre completo del usuario."""
		partes = [self.nombres, self.ap_paterno, self.ap_materno]
		return " ".join(p for p in partes if p).strip()

	def __str__(self) -> str:
		return f"CorteFonasa({self.run} @ {self.fecha_corte:%Y-%m})"


class HpTrakcare(models.Model):
	"""Registro de usuarios en sistema HP Trakcare."""
	cod_familia = models.CharField(max_length=100, blank=True)
	relacion_parentezco = models.CharField(max_length=100, blank=True)
	id_trakcare = models.CharField(max_length=100, blank=True, db_index=True)
	cod_registro = models.CharField(max_length=100, blank=True)
	
	# Relaciones con catálogos
	etnia = models.ForeignKey(
		Etnia,
		on_delete=models.SET_NULL,
		related_name='hp_usuarios',
		null=True,
		blank=True
	)
	nacionalidad = models.ForeignKey(
		Nacionalidad,
		on_delete=models.SET_NULL,
		related_name='hp_usuarios',
		null=True,
		blank=True
	)
	centro_inscripcion = models.ForeignKey(
		Establecimiento,
		on_delete=models.SET_NULL,
		related_name='hp_usuarios',
		null=True,
		blank=True
	)
	sector = models.ForeignKey(
		Sector,
		on_delete=models.SET_NULL,
		related_name='hp_usuarios',
		null=True,
		blank=True
	)
	
	# Información personal
	run = models.CharField(max_length=12, db_index=True, blank=True)
	ap_paterno = models.CharField(max_length=255, blank=True)
	ap_materno = models.CharField(max_length=255, blank=True)
	nombre = models.CharField(max_length=255, blank=True)
	genero = models.CharField(max_length=20, blank=True)
	fecha_nacimiento = models.DateField(null=True, blank=True)
	edad = models.PositiveSmallIntegerField(null=True, blank=True)
	
	# Contacto
	direccion = models.CharField(max_length=255, blank=True)
	telefono = models.CharField(max_length=30, blank=True)
	telefono_celular = models.CharField(max_length=30, blank=True)
	telefono_recado = models.CharField(max_length=30, blank=True)
	
	# Información de salud
	servicio_salud = models.CharField(max_length=255, blank=True)
	prevision = models.CharField(max_length=100, blank=True)
	plan_trakcare = models.CharField(max_length=100, blank=True)
	prais_trakcare = models.CharField(max_length=100, blank=True)
	
	# Fechas importantes
	fecha_incorporacion = models.DateField(null=True, blank=True)
	fecha_ultima_modif = models.DateField(null=True, blank=True)
	fecha_defuncion = models.DateField(null=True, blank=True, db_index=True)
	creado_el = models.DateTimeField(default=timezone.now, editable=False)

	class Meta:
		ordering = ["run", "nombre"]
		verbose_name = 'HP Trakcare'
		verbose_name_plural = 'HP Trakcare'
		indexes = [
			models.Index(fields=['run', 'fecha_defuncion']),
			models.Index(fields=['id_trakcare']),
			models.Index(fields=['sector', 'run']),
		]

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		super().save(*args, **kwargs)

	@property
	def nombre_completo(self) -> str:
		"""Retorna el nombre completo del usuario."""
		partes = [self.nombre, self.ap_paterno, self.ap_materno]
		return " ".join(p for p in partes if p).strip()

	@property
	def esta_vivo(self) -> bool:
		"""Verifica si el usuario está vivo."""
		return self.fecha_defuncion is None

	def cortes_relacionados(self):
		"""Retorna los cortes FONASA relacionados con este usuario."""
		return CorteFonasa.objects.filter(run=self.run)

	def __str__(self) -> str:
		return f"HpTrakcare({self.run or 'SIN RUN'})"


class NuevoUsuario(models.Model):
	"""
	Registro de usuarios que llegan al CESFAM antes del corte mensual.
	Permite hacer seguimiento y validación cuando se suba el corte del mes siguiente.
	"""
	ESTADO_CHOICES = [
		('PENDIENTE', 'Pendiente'),
		('VALIDADO', 'Validado'),
		('NO_VALIDADO', 'No Validado'),
		('FALLECIDO', 'Fallecido'),
	]

	# Información básica del usuario
	run = models.CharField(max_length=12, db_index=True)
	nombres = models.CharField(max_length=200, blank=True, default='')
	apellido_paterno = models.CharField(max_length=100, blank=True, default='')
	apellido_materno = models.CharField(max_length=100, blank=True, default='')
	nombre_completo = models.CharField(max_length=500, blank=True, default='')  # Se genera automáticamente
	fecha_inscripcion = models.DateField()
	
	# Mes y año del periodo al que pertenece (ej: octubre 2024)
	periodo_mes = models.PositiveSmallIntegerField(
		validators=[MinValueValidator(1), MaxValueValidator(12)]
	)
	periodo_anio = models.PositiveSmallIntegerField(
		validators=[MinValueValidator(2000), MaxValueValidator(2100)]
	)
	
	# Relaciones con catálogos
	nacionalidad = models.ForeignKey(
		Nacionalidad,
		on_delete=models.SET_NULL,
		related_name='nuevos_usuarios',
		null=True,
		blank=True
	)
	etnia = models.ForeignKey(
		Etnia,
		on_delete=models.SET_NULL,
		related_name='nuevos_usuarios',
		null=True,
		blank=True
	)
	sector = models.ForeignKey(
		Sector,
		on_delete=models.SET_NULL,
		related_name='nuevos_usuarios',
		null=True,
		blank=True
	)
	codigo_sector = models.CharField(max_length=50, blank=True)  # Código manual del sector
	subsector = models.ForeignKey(
		Subsector,
		on_delete=models.SET_NULL,
		related_name='nuevos_usuarios',
		null=True,
		blank=True
	)
	centro = models.CharField(max_length=200, blank=True)  # Nombre del centro de salud
	establecimiento = models.ForeignKey(
		Establecimiento,
		on_delete=models.SET_NULL,
		related_name='nuevos_usuarios',
		null=True,
		blank=True
	)
	
	# Información adicional
	codigo_percapita = models.CharField(max_length=50, blank=True, db_index=True)
	observaciones = models.TextField(blank=True)
	
	# Estado de validación
	estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE', db_index=True)
	
	# Campos de revisión
	revisado = models.BooleanField(default=False, db_index=True)
	revisado_manualmente = models.BooleanField(default=False)
	revisado_por = models.CharField(max_length=100, blank=True, default='')
	revisado_el = models.DateTimeField(null=True, blank=True)
	
	# Observaciones sobre HP Trakcare
	observaciones_trakcare = models.TextField(blank=True, default='')
	checklist_trakcare = models.JSONField(default=dict, blank=True)
	
	# Relación con validación (cuando se compare con el corte)
	validacion = models.ForeignKey(
		'ValidacionCorte',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='nuevos_usuarios'
	)
	
	# Metadatos
	creado_el = models.DateTimeField(default=timezone.now, editable=False)
	modificado_el = models.DateTimeField(auto_now=True)
	creado_por = models.CharField(max_length=100, blank=True)
	modificado_por = models.CharField(max_length=100, blank=True, default='')

	class Meta:
		ordering = ["-periodo_anio", "-periodo_mes", "fecha_inscripcion"]
		verbose_name = 'Nuevo Usuario'
		verbose_name_plural = 'Nuevos Usuarios'
		indexes = [
			models.Index(fields=['periodo_anio', 'periodo_mes']),
			models.Index(fields=['estado']),
			models.Index(fields=['run', 'periodo_anio', 'periodo_mes']),
			models.Index(fields=['-periodo_anio', '-periodo_mes', 'estado']),
		]

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		# Generar nombre completo automáticamente
		partes_nombre = [self.nombres, self.apellido_paterno, self.apellido_materno]
		self.nombre_completo = ' '.join(filter(None, partes_nombre))
		super().save(*args, **kwargs)

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible (ej: 'Octubre 2024')"""
		meses = [
			'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
			'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
		]
		if 1 <= self.periodo_mes <= 12:
			return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
		return f"{self.periodo_anio}-{self.periodo_mes:02d}"

	def __str__(self) -> str:
		return f"NuevoUsuario({self.run} - {self.periodo_str} - {self.estado})"


class ValidacionCorte(models.Model):
	"""
	Registro de validaciones realizadas cuando se sube un nuevo corte.
	Compara los nuevos usuarios del mes anterior con el corte recién subido.
	"""
	# Periodo validado (el mes de los nuevos usuarios)
	periodo_mes = models.PositiveSmallIntegerField(
		validators=[MinValueValidator(1), MaxValueValidator(12)]
	)
	periodo_anio = models.PositiveSmallIntegerField(
		validators=[MinValueValidator(2000), MaxValueValidator(2100)]
	)
	
	# Fecha del corte con el que se compara
	fecha_corte = models.DateField()
	
	# Estadísticas de la validación
	total_usuarios = models.PositiveIntegerField(default=0)
	usuarios_validados = models.PositiveIntegerField(default=0)
	usuarios_no_validados = models.PositiveIntegerField(default=0)
	usuarios_pendientes = models.PositiveIntegerField(default=0)
	
	# Detalles de la validación
	observaciones = models.TextField(blank=True)
	procesado_el = models.DateTimeField(default=timezone.now)
	procesado_por = models.CharField(max_length=100, blank=True)

	class Meta:
		ordering = ["-periodo_anio", "-periodo_mes"]
		unique_together = ("periodo_anio", "periodo_mes", "fecha_corte")
		verbose_name = 'Validación de Corte'
		verbose_name_plural = 'Validaciones de Corte'
		indexes = [
			models.Index(fields=['-periodo_anio', '-periodo_mes']),
			models.Index(fields=['fecha_corte']),
		]

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible"""
		meses = [
			'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
			'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
		]
		if 1 <= self.periodo_mes <= 12:
			return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
		return f"{self.periodo_anio}-{self.periodo_mes:02d}"

	@property
	def tasa_validacion(self) -> float:
		"""Calcula el porcentaje de usuarios validados."""
		if self.total_usuarios == 0:
			return 0.0
		return round((self.usuarios_validados / self.total_usuarios) * 100, 2)

	def __str__(self) -> str:
		return f"ValidacionCorte({self.periodo_str} - {self.fecha_corte})"


class HistorialCarga(models.Model):
	"""
	Registro de historial de cargas de archivos (Corte FONASA y HP Trakcare).
	Guarda información sobre quién, cuándo y qué datos se cargaron.
	"""
	TIPO_CHOICES = [
		('CORTE_FONASA', 'Corte FONASA'),
		('HP_TRAKCARE', 'HP Trakcare'),
	]
	
	ESTADO_CHOICES = [
		('EXITOSO', 'Exitoso'),
		('ERROR', 'Error'),
		('PARCIAL', 'Parcial'),
		('EN_PROCESO', 'En Proceso'),
	]

	# Información de la carga
	tipo_carga = models.CharField(max_length=20, choices=TIPO_CHOICES, db_index=True)
	nombre_archivo = models.CharField(max_length=500)
	usuario = models.CharField(max_length=255)
	fecha_carga = models.DateTimeField(default=timezone.now, db_index=True)
	
	# Periodo de los datos (para Corte FONASA)
	periodo_mes = models.PositiveSmallIntegerField(
		null=True,
		blank=True,
		validators=[MinValueValidator(1), MaxValueValidator(12)]
	)
	periodo_anio = models.PositiveSmallIntegerField(
		null=True,
		blank=True,
		validators=[MinValueValidator(2000), MaxValueValidator(2100)]
	)
	fecha_corte = models.DateField(null=True, blank=True)
	
	# Estadísticas de la carga
	total_registros = models.PositiveIntegerField(default=0)
	registros_creados = models.PositiveIntegerField(default=0)
	registros_actualizados = models.PositiveIntegerField(default=0)
	registros_invalidos = models.PositiveIntegerField(default=0)
	
	# Estado y resultado
	estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='EN_PROCESO', db_index=True)
	reemplazo = models.BooleanField(default=False)
	
	# Detalles adicionales
	observaciones = models.TextField(blank=True)
	errores = models.JSONField(default=list, blank=True)  # Lista de errores encontrados
	tiempo_procesamiento = models.FloatField(null=True, blank=True, help_text="Tiempo en segundos")
	
	# Metadatos del sistema
	ip_address = models.GenericIPAddressField(null=True, blank=True)

	class Meta:
		ordering = ["-fecha_carga"]
		verbose_name = 'Historial de Carga'
		verbose_name_plural = 'Historial de Cargas'
		indexes = [
			models.Index(fields=['tipo_carga', '-fecha_carga']),
			models.Index(fields=['usuario', '-fecha_carga']),
			models.Index(fields=['periodo_anio', 'periodo_mes']),
			models.Index(fields=['estado', '-fecha_carga']),
		]

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible (ej: 'Octubre 2024')"""
		if self.periodo_mes and self.periodo_anio:
			meses = [
				'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
				'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
			]
			if 1 <= self.periodo_mes <= 12:
				return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
			return f"{self.periodo_anio}-{self.periodo_mes:02d}"
		return "N/A"

	@property
	def tasa_exito(self) -> float:
		"""Calcula el porcentaje de registros válidos"""
		if self.total_registros == 0:
			return 0.0
		return round(((self.registros_creados + self.registros_actualizados) / self.total_registros) * 100, 2)

	@property
	def registros_exitosos(self) -> int:
		"""Retorna el total de registros procesados exitosamente."""
		return self.registros_creados + self.registros_actualizados

	def __str__(self) -> str:
		return f"HistorialCarga({self.get_tipo_carga_display()} - {self.usuario} - {self.fecha_carga:%Y-%m-%d %H:%M})"


# =============================================================================
# MODELO DE USUARIOS
# =============================================================================

class Usuario(models.Model):
	"""
	Modelo de usuarios del sistema para autenticación y gestión.
	"""
	username = models.CharField(max_length=150, unique=True, db_index=True)
	password_hash = models.CharField(max_length=255)
	nombre_completo = models.CharField(max_length=255)
	email = models.EmailField(blank=True)
	es_admin = models.BooleanField(default=False)
	activo = models.BooleanField(default=True)
	
	# Metadatos
	ultimo_acceso = models.DateTimeField(null=True, blank=True)
	creado_el = models.DateTimeField(default=timezone.now, editable=False)
	modificado_el = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['username']
		verbose_name = 'Usuario'
		verbose_name_plural = 'Usuarios'
		indexes = [
			models.Index(fields=['username']),
			models.Index(fields=['activo']),
		]

	def set_password(self, raw_password: str):
		"""Establece la contraseña del usuario (hasheada)."""
		self.password_hash = make_password(raw_password)

	def check_password(self, raw_password: str) -> bool:
		"""Verifica si la contraseña proporcionada es correcta."""
		return check_password(raw_password, self.password_hash)

	def __str__(self) -> str:
		return f"{self.nombre_completo} ({self.username})"


class CorteFonasaObservacion(models.Model):
	class EstadoRevision(models.TextChoices):
		PENDIENTE = "PENDIENTE", "Pendiente"
		CONTACTADO = "CONTACTADO", "Contactado"
		AGENDADO = "AGENDADO", "Agendado"
		RESUELTO = "RESUELTO", "Resuelto"
		NO_LOCALIZADO = "NO_LOCALIZADO", "No localizado"

	class TipoObservacion(models.TextChoices):
		PREDEFINIDA = "PREDEFINIDA", "Predefinida"
		MANUAL = "MANUAL", "Manual"

	corte = models.ForeignKey(
		CorteFonasa,
		on_delete=models.CASCADE,
		related_name="observaciones",
	)
	autor = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="observaciones_cortes",
	)
	autor_nombre = models.CharField(
		max_length=255,
		blank=True,
		help_text="Nombre o RUT del usuario que creó la observación"
	)
	estado_revision = models.CharField(
		max_length=20,
		choices=EstadoRevision.choices,
		default=EstadoRevision.PENDIENTE,
		db_index=True,
	)
	tipo = models.CharField(
		max_length=20,
		choices=TipoObservacion.choices,
		default=TipoObservacion.PREDEFINIDA,
	)
	titulo = models.CharField(max_length=255, blank=True)
	texto = models.TextField(blank=True)
	adjunto = models.FileField(upload_to=observacion_upload_to, blank=True, null=True)
	metadata = models.JSONField(blank=True, null=True, default=dict)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]
		indexes = [
			models.Index(fields=["corte", "-created_at"]),
			models.Index(fields=["estado_revision", "corte"]),
		]

	def __str__(self) -> str:
		return f"Observacion({self.corte_id}, {self.estado_revision})"
