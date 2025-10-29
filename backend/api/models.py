from django.db import models
from django.utils import timezone


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


class CorteFonasa(models.Model):
	run = models.CharField(max_length=12, db_index=True)
	nombres = models.CharField(max_length=255, blank=True)
	ap_paterno = models.CharField(max_length=255, blank=True)
	ap_materno = models.CharField(max_length=255, blank=True)
	fecha_nacimiento = models.DateField(null=True, blank=True)
	genero = models.CharField(max_length=20, blank=True)
	tramo = models.CharField(max_length=50, blank=True)
	fecha_corte = models.DateField()
	cod_genero = models.CharField(max_length=50, blank=True)
	nombre_centro = models.CharField(max_length=255, blank=True)
	motivo = models.CharField(max_length=255, blank=True)
	creado_el = models.DateTimeField(default=timezone.now, editable=False)

	class Meta:
		ordering = ["-fecha_corte", "run"]
		unique_together = ("run", "fecha_corte")

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		super().save(*args, **kwargs)

	def __str__(self) -> str:
		return f"CorteFonasa({self.run} @ {self.fecha_corte:%Y-%m})"


class HpTrakcare(models.Model):
	cod_familia = models.CharField(max_length=100, blank=True)
	relacion_parentezco = models.CharField(max_length=100, blank=True)
	id_trakcare = models.CharField(max_length=100, blank=True)
	etnia = models.CharField(max_length=100, blank=True)
	cod_registro = models.CharField(max_length=100, blank=True)
	nacionalidad = models.CharField(max_length=100, blank=True)
	run = models.CharField(max_length=12, db_index=True, blank=True)
	ap_paterno = models.CharField(max_length=255, blank=True)
	ap_materno = models.CharField(max_length=255, blank=True)
	nombre = models.CharField(max_length=255, blank=True)
	genero = models.CharField(max_length=20, blank=True)
	fecha_nacimiento = models.DateField(null=True, blank=True)
	edad = models.PositiveSmallIntegerField(null=True, blank=True)
	direccion = models.CharField(max_length=255, blank=True)
	telefono = models.CharField(max_length=30, blank=True)
	telefono_celular = models.CharField(max_length=30, blank=True)
	telefono_recado = models.CharField(max_length=30, blank=True)
	servicio_salud = models.CharField(max_length=255, blank=True)
	centro_inscripcion = models.CharField(max_length=255, blank=True)
	sector = models.CharField(max_length=100, blank=True)
	prevision = models.CharField(max_length=100, blank=True)
	plan_trakcare = models.CharField(max_length=100, blank=True)
	prais_trakcare = models.CharField(max_length=100, blank=True)
	fecha_incorporacion = models.DateField(null=True, blank=True)
	fecha_ultima_modif = models.DateField(null=True, blank=True)
	fecha_defuncion = models.DateField(null=True, blank=True)
	creado_el = models.DateTimeField(default=timezone.now, editable=False)

	class Meta:
		ordering = ["run", "nombre"]

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		super().save(*args, **kwargs)

	def cortes_relacionados(self):
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
	]

	# Información básica del usuario
	run = models.CharField(max_length=12, db_index=True)
	nombre_completo = models.CharField(max_length=500)
	fecha_solicitud = models.DateField()
	
	# Mes y año del periodo al que pertenece (ej: octubre 2024)
	periodo_mes = models.PositiveSmallIntegerField()  # 1-12
	periodo_anio = models.PositiveSmallIntegerField()  # 2024, 2025, etc.
	
	# Información adicional
	nacionalidad = models.CharField(max_length=100, blank=True)
	etnia = models.CharField(max_length=100, blank=True)
	sector = models.CharField(max_length=100, blank=True)
	subsector = models.CharField(max_length=100, blank=True)
	codigo_percapita = models.CharField(max_length=50, blank=True)
	establecimiento = models.CharField(max_length=255, blank=True)
	observaciones = models.TextField(blank=True)
	
	# Estado de validación
	estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
	
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

	class Meta:
		ordering = ["-periodo_anio", "-periodo_mes", "fecha_solicitud"]
		indexes = [
			models.Index(fields=['periodo_anio', 'periodo_mes']),
			models.Index(fields=['estado']),
			models.Index(fields=['run', 'periodo_anio', 'periodo_mes']),
		]

	def save(self, *args, **kwargs):
		self.run = normalize_run(self.run)
		super().save(*args, **kwargs)

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible (ej: 'Octubre 2024')"""
		meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
				 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
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
	periodo_mes = models.PositiveSmallIntegerField()  # 1-12
	periodo_anio = models.PositiveSmallIntegerField()  # 2024, 2025, etc.
	
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

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible"""
		meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
				 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
		if 1 <= self.periodo_mes <= 12:
			return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
		return f"{self.periodo_anio}-{self.periodo_mes:02d}"

	def __str__(self) -> str:
		return f"ValidacionCorte({self.periodo_str} - {self.fecha_corte})"


class Catalogo(models.Model):
	"""
	Catálogo configurable para etnias, nacionalidades, sectores, subsectores y establecimientos.
	Permite gestionar las opciones disponibles para el registro de nuevos usuarios.
	"""
	TIPO_CHOICES = [
		('ETNIA', 'Etnia'),
		('NACIONALIDAD', 'Nacionalidad'),
		('SECTOR', 'Sector'),
		('SUBSECTOR', 'Subsector'),
		('ESTABLECIMIENTO', 'Establecimiento'),
	]

	tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, db_index=True)
	nombre = models.CharField(max_length=255)
	codigo = models.CharField(max_length=50, blank=True, null=True)
	color = models.CharField(max_length=7, blank=True, null=True)  # Formato hexadecimal #RRGGBB
	activo = models.BooleanField(default=True)
	orden = models.PositiveSmallIntegerField(default=0)
	
	# Metadatos
	creado_el = models.DateTimeField(default=timezone.now, editable=False)
	modificado_el = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['tipo', 'orden', 'nombre']
		unique_together = ('tipo', 'nombre')
		indexes = [
			models.Index(fields=['tipo', 'activo']),
		]
		verbose_name = 'Catálogo'
		verbose_name_plural = 'Catálogos'

	def __str__(self) -> str:
		if self.codigo:
			return f"{self.get_tipo_display()}: {self.nombre} ({self.codigo})"
		return f"{self.get_tipo_display()}: {self.nombre}"


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
	]

	# Información de la carga
	tipo_carga = models.CharField(max_length=20, choices=TIPO_CHOICES, db_index=True)
	nombre_archivo = models.CharField(max_length=500)
	usuario = models.CharField(max_length=255)  # Nombre del usuario que realizó la carga
	fecha_carga = models.DateTimeField(default=timezone.now, db_index=True)
	
	# Periodo de los datos (para Corte FONASA)
	periodo_mes = models.PositiveSmallIntegerField(null=True, blank=True)  # 1-12
	periodo_anio = models.PositiveSmallIntegerField(null=True, blank=True)  # 2024, 2025, etc.
	fecha_corte = models.DateField(null=True, blank=True)  # Fecha específica del corte
	
	# Estadísticas de la carga
	total_registros = models.PositiveIntegerField(default=0)
	registros_creados = models.PositiveIntegerField(default=0)
	registros_actualizados = models.PositiveIntegerField(default=0)
	registros_invalidos = models.PositiveIntegerField(default=0)
	
	# Estado y resultado
	estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='EXITOSO')
	reemplazo = models.BooleanField(default=False)  # Si se reemplazó un corte existente
	
	# Detalles adicionales
	observaciones = models.TextField(blank=True)
	tiempo_procesamiento = models.FloatField(null=True, blank=True)  # En segundos
	
	# Metadatos del sistema
	ip_address = models.GenericIPAddressField(null=True, blank=True)

	class Meta:
		ordering = ["-fecha_carga"]
		indexes = [
			models.Index(fields=['tipo_carga', '-fecha_carga']),
			models.Index(fields=['usuario', '-fecha_carga']),
			models.Index(fields=['periodo_anio', 'periodo_mes']),
		]
		verbose_name = 'Historial de Carga'
		verbose_name_plural = 'Historial de Cargas'

	@property
	def periodo_str(self):
		"""Retorna el periodo en formato legible (ej: 'Octubre 2024')"""
		if self.periodo_mes and self.periodo_anio:
			meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
					 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
			if 1 <= self.periodo_mes <= 12:
				return f"{meses[self.periodo_mes - 1]} {self.periodo_anio}"
			return f"{self.periodo_anio}-{self.periodo_mes:02d}"
		return "N/A"

	@property
	def tasa_exito(self):
		"""Calcula el porcentaje de registros válidos"""
		if self.total_registros == 0:
			return 0
		return round(((self.registros_creados + self.registros_actualizados) / self.total_registros) * 100, 2)

	def __str__(self) -> str:
		return f"HistorialCarga({self.get_tipo_carga_display()} - {self.usuario} - {self.fecha_carga:%Y-%m-%d %H:%M})"
