from django.http import QueryDict
from rest_framework import serializers

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
    Usuario
)


class CorteFonasaRecordSerializer(serializers.Serializer):
    run = serializers.CharField()
    nombres = serializers.CharField(required=False, allow_blank=True)
    apPaterno = serializers.CharField(required=False, allow_blank=True)
    apMaterno = serializers.CharField(required=False, allow_blank=True)
    fechaNacimiento = serializers.CharField(required=False, allow_blank=True)
    genero = serializers.CharField(required=False, allow_blank=True)
    tramo = serializers.CharField(required=False, allow_blank=True)
    fehcaCorte = serializers.CharField()
    codGenero = serializers.CharField(required=False, allow_blank=True)
    nombreCentro = serializers.CharField(required=False, allow_blank=True)
    centroDeProcedencia = serializers.CharField(required=False, allow_blank=True)
    comunaDeProcedencia = serializers.CharField(required=False, allow_blank=True)
    centroActual = serializers.CharField(required=False, allow_blank=True)
    comunaActual = serializers.CharField(required=False, allow_blank=True)
    aceptadoRechazado = serializers.CharField(required=False, allow_blank=True)
    motivo = serializers.CharField(required=False, allow_blank=True)


class NuevoUsuarioRecordSerializer(serializers.Serializer):
    """Serializer para procesar registros individuales del CSV de nuevos usuarios"""
    fecha = serializers.CharField(required=False, allow_blank=True)
    run = serializers.CharField()
    nombres = serializers.CharField(required=False, allow_blank=True)
    apellidoPaterno = serializers.CharField(required=False, allow_blank=True)
    apellidoMaterno = serializers.CharField(required=False, allow_blank=True)
    nacionalidad = serializers.CharField(required=False, allow_blank=True)
    etnia = serializers.CharField(required=False, allow_blank=True)
    sector = serializers.CharField(required=False, allow_blank=True)
    codigoSector = serializers.CharField(required=False, allow_blank=True)
    subsector = serializers.CharField(required=False, allow_blank=True)
    codPercapita = serializers.CharField(required=False, allow_blank=True)
    centro = serializers.CharField(required=False, allow_blank=True)
    observaciones = serializers.CharField(required=False, allow_blank=True)
    estado = serializers.CharField(required=False, allow_blank=True)


class HpTrakcareRecordSerializer(serializers.Serializer):
    codFamilia = serializers.CharField(required=False, allow_blank=True)
    relacionParentezco = serializers.CharField(required=False, allow_blank=True)
    idTrakcare = serializers.CharField(required=False, allow_blank=True)
    etnia = serializers.CharField(required=False, allow_blank=True)
    codRegistro = serializers.CharField(required=False, allow_blank=True)
    nacionalidad = serializers.CharField(required=False, allow_blank=True)
    RUN = serializers.CharField(required=False, allow_blank=True)
    run = serializers.CharField(required=False, allow_blank=True)
    apPaterno = serializers.CharField(required=False, allow_blank=True)
    apMaterno = serializers.CharField(required=False, allow_blank=True)
    nombre = serializers.CharField(required=False, allow_blank=True)
    genero = serializers.CharField(required=False, allow_blank=True)
    fechaNacimiento = serializers.CharField(required=False, allow_blank=True)
    edad = serializers.CharField(required=False, allow_blank=True)
    direccion = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    telefonoCelular = serializers.CharField(required=False, allow_blank=True)
    TelefonoRecado = serializers.CharField(required=False, allow_blank=True)
    servicioSalud = serializers.CharField(required=False, allow_blank=True)
    centroInscripcion = serializers.CharField(required=False, allow_blank=True)
    sector = serializers.CharField(required=False, allow_blank=True)
    prevision = serializers.CharField(required=False, allow_blank=True)
    planTrakcare = serializers.CharField(required=False, allow_blank=True)
    praisTrakcare = serializers.CharField(required=False, allow_blank=True)
    fechaIncorporacion = serializers.CharField(required=False, allow_blank=True)
    fechaUltimaModif = serializers.CharField(required=False, allow_blank=True)
    fechaDefuncion = serializers.CharField(required=False, allow_blank=True)


DATE_INPUT_FORMATS = ["%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"]


class CorteFonasaDetailSerializer(serializers.ModelSerializer):
    apPaterno = serializers.CharField(
        source="ap_paterno", required=False, allow_null=True, allow_blank=True
    )
    apMaterno = serializers.CharField(
        source="ap_materno", required=False, allow_null=True, allow_blank=True
    )
    fechaNacimiento = serializers.DateField(
        source="fecha_nacimiento",
        required=False,
        allow_null=True,
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d",
    )
    codGenero = serializers.CharField(
        source="cod_genero", required=False, allow_null=True, allow_blank=True
    )
    nombreCentro = serializers.CharField(
        source="nombre_centro", required=False, allow_null=True, allow_blank=True
    )
    centroDeProcedencia = serializers.CharField(
        source="centro_de_procedencia", required=False, allow_null=True, allow_blank=True
    )
    comunaDeProcedencia = serializers.CharField(
        source="comuna_de_procedencia", required=False, allow_null=True, allow_blank=True
    )
    centroActual = serializers.CharField(
        source="centro_actual", required=False, allow_null=True, allow_blank=True
    )
    comunaActual = serializers.CharField(
        source="comuna_actual", required=False, allow_null=True, allow_blank=True
    )
    aceptadoRechazado = serializers.CharField(
        source="aceptado_rechazado", required=False, allow_null=True, allow_blank=True
    )
    fehcaCorte = serializers.DateField(
        source="fecha_corte", read_only=True, format="%Y-%m-%d"
    )

    class Meta:
        model = CorteFonasa
        fields = [
            "id",
            "run",
            "nombres",
            "apPaterno",
            "apMaterno",
            "fechaNacimiento",
            "genero",
            "tramo",
            "fehcaCorte",
            "codGenero",
            "nombreCentro",
            "centroDeProcedencia",
            "comunaDeProcedencia",
            "centroActual",
            "comunaActual",
            "aceptadoRechazado",
            "motivo",
        ]
        read_only_fields = ("id", "run", "fehcaCorte")


class HpTrakcareDetailSerializer(serializers.ModelSerializer):
    codFamilia = serializers.CharField(
        source="cod_familia", required=False, allow_null=True, allow_blank=True
    )
    relacionParentezco = serializers.CharField(
        source="relacion_parentezco", required=False, allow_null=True, allow_blank=True
    )
    idTrakcare = serializers.CharField(
        source="id_trakcare", required=False, allow_null=True, allow_blank=True
    )
    codRegistro = serializers.CharField(
        source="cod_registro", required=False, allow_null=True, allow_blank=True
    )
    RUN = serializers.CharField(source="run", read_only=True)
    apPaterno = serializers.CharField(
        source="ap_paterno", required=False, allow_null=True, allow_blank=True
    )
    apMaterno = serializers.CharField(
        source="ap_materno", required=False, allow_null=True, allow_blank=True
    )
    planTrakcare = serializers.CharField(
        source="plan_trakcare", required=False, allow_null=True, allow_blank=True
    )
    praisTrakcare = serializers.CharField(
        source="prais_trakcare", required=False, allow_null=True, allow_blank=True
    )
    fechaNacimiento = serializers.DateField(
        source="fecha_nacimiento",
        required=False,
        allow_null=True,
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d",
    )
    edad = serializers.IntegerField(required=False, allow_null=True)
    telefono = serializers.CharField(
        source="telefono", required=False, allow_null=True, allow_blank=True
    )
    telefonoCelular = serializers.CharField(
        source="telefono_celular", required=False, allow_null=True, allow_blank=True
    )
    TelefonoRecado = serializers.CharField(
        source="telefono_recado", required=False, allow_null=True, allow_blank=True
    )
    servicioSalud = serializers.CharField(
        source="servicio_salud", required=False, allow_null=True, allow_blank=True
    )
    centroInscripcion = serializers.CharField(
        source="centro_inscripcion", required=False, allow_null=True, allow_blank=True
    )
    fechaIncorporacion = serializers.DateField(
        source="fecha_incorporacion",
        required=False,
        allow_null=True,
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d",
    )
    fechaUltimaModif = serializers.DateField(
        source="fecha_ultima_modif",
        required=False,
        allow_null=True,
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d",
    )
    fechaDefuncion = serializers.DateField(
        source="fecha_defuncion",
        required=False,
        allow_null=True,
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d",
    )

    class Meta:
        model = HpTrakcare
        fields = [
            "id",
            "RUN",
            "codFamilia",
            "relacionParentezco",
            "idTrakcare",
            "etnia",
            "codRegistro",
            "nacionalidad",
            "apPaterno",
            "apMaterno",
            "nombre",
            "genero",
            "fechaNacimiento",
            "edad",
            "direccion",
            "telefono",
            "telefonoCelular",
            "TelefonoRecado",
            "servicioSalud",
            "centroInscripcion",
            "sector",
            "prevision",
            "planTrakcare",
            "praisTrakcare",
            "fechaIncorporacion",
            "fechaUltimaModif",
            "fechaDefuncion",
        ]
        read_only_fields = ("id",)


class NuevoUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo NuevoUsuario"""

    # Campos básicos del usuario
    nombres = serializers.CharField(required=False, allow_blank=True)
    apellidoPaterno = serializers.CharField(
        source="apellido_paterno", required=False, allow_blank=True
    )
    apellidoMaterno = serializers.CharField(
        source="apellido_materno", required=False, allow_blank=True
    )
    nombreCompleto = serializers.CharField(source="nombre_completo", read_only=True)

    # Fechas
    fechaInscripcion = serializers.DateField(
        source="fecha_inscripcion",
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d"
    )
    fechaSolicitud = serializers.SerializerMethodField()

    # Datos de periodo
    periodoMes = serializers.IntegerField(source="periodo_mes")
    periodoAnio = serializers.IntegerField(source="periodo_anio")
    periodoStr = serializers.CharField(source="periodo_str", read_only=True)

    # Información adicional
    codigoSector = serializers.CharField(
        source="codigo_sector", required=False, allow_blank=True
    )
    codigoPercapita = serializers.CharField(
        source="codigo_percapita", required=False, allow_blank=True
    )
    centro = serializers.CharField(required=False, allow_blank=True)
    creadoPor = serializers.CharField(source="creado_por", required=False, allow_blank=True)
    creadoEl = serializers.DateTimeField(source="creado_el", read_only=True)
    modificadoEl = serializers.DateTimeField(source="modificado_el", read_only=True)
    
    # Información de validación desde el corte FONASA
    infoValidacion = serializers.SerializerMethodField()
    
    # Campos de revisión
    revisado = serializers.BooleanField(default=False)
    revisadoManualmente = serializers.BooleanField(source="revisado_manualmente", default=False)
    revisadoPor = serializers.CharField(source="revisado_por", required=False, allow_blank=True)
    revisadoEl = serializers.DateTimeField(source="revisado_el", required=False, allow_null=True)
    modificadoPor = serializers.CharField(source="modificado_por", required=False, allow_blank=True)
    
    # Observaciones HP Trakcare
    observacionesTrakcare = serializers.CharField(source="observaciones_trakcare", required=False, allow_blank=True)
    checklistTrakcare = serializers.JSONField(source="checklist_trakcare", required=False)

    class Meta:
        model = NuevoUsuario
        fields = [
            "id",
            "run",
            "nombres",
            "apellidoPaterno",
            "apellidoMaterno",
            "nombreCompleto",
            "fechaInscripcion",
            "fechaSolicitud",
            "periodoMes",
            "periodoAnio",
            "periodoStr",
            "nacionalidad",
            "etnia",
            "sector",
            "subsector",
            "codigoSector",
            "codigoPercapita",
            "centro",
            "establecimiento",
            "observaciones",
            "estado",
            "validacion",
            "creadoEl",
            "modificadoEl",
            "creadoPor",
            "modificadoPor",
            "revisado",
            "revisadoManualmente",
            "revisadoPor",
            "revisadoEl",
            "observacionesTrakcare",
            "checklistTrakcare",
            "infoValidacion",
        ]
        read_only_fields = (
            "id",
            "nombreCompleto",
            "fechaSolicitud",
            "periodoStr",
            "creadoEl",
            "modificadoEl",
            "infoValidacion",
        )

    def get_fechaSolicitud(self, obj: NuevoUsuario) -> str | None:
        """Retorna la misma fecha de inscripción para compatibilidad con el frontend actual."""
        if obj.fecha_inscripcion:
            return obj.fecha_inscripcion.strftime("%Y-%m-%d")
        return None

    def get_infoValidacion(self, obj: NuevoUsuario) -> dict | None:
        """Obtiene información de validación desde el último corte FONASA."""
        if not obj.run:
            return None
        
        # Buscar el registro más reciente en CorteFonasa para este RUN
        try:
            corte = CorteFonasa.objects.filter(run=obj.run).order_by('-fecha_corte').first()
            if corte:
                return {
                    'aceptadoRechazado': corte.aceptado_rechazado or '',
                    'motivo': corte.motivo or '',
                    'motivoNormalizado': corte.motivo_normalizado or '',
                }
        except Exception:
            pass
        
        return None

    def to_internal_value(self, data):
        """Permite campos adicionales y normaliza valores enviados desde el frontend."""

        if isinstance(data, QueryDict):
            mutable_data = {key: values[-1] if values else "" for key, values in data.lists()}
        else:
            mutable_data = dict(data)

        # Permitir que el frontend envíe fechaSolicitud o fechaInscripcion indistintamente
        if "fechaInscripcion" not in mutable_data and "fechaSolicitud" in mutable_data:
            mutable_data["fechaInscripcion"] = mutable_data["fechaSolicitud"]

        # Convertir valores vacíos en null para campos relacionales opcionales
        for fk_field in ("nacionalidad", "etnia", "sector", "subsector", "establecimiento"):
            if mutable_data.get(fk_field) in {"", None, "null", "None"}:
                mutable_data[fk_field] = None

        return super().to_internal_value(mutable_data)


class ValidacionCorteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ValidacionCorte"""
    periodoMes = serializers.IntegerField(source="periodo_mes")
    periodoAnio = serializers.IntegerField(source="periodo_anio")
    periodoStr = serializers.CharField(source="periodo_str", read_only=True)
    fechaCorte = serializers.DateField(
        source="fecha_corte",
        input_formats=DATE_INPUT_FORMATS,
        format="%Y-%m-%d"
    )
    totalUsuarios = serializers.IntegerField(source="total_usuarios", read_only=True)
    usuariosValidados = serializers.IntegerField(source="usuarios_validados", read_only=True)
    usuariosNoValidados = serializers.IntegerField(source="usuarios_no_validados", read_only=True)
    usuariosPendientes = serializers.IntegerField(source="usuarios_pendientes", read_only=True)
    procesadoEl = serializers.DateTimeField(source="procesado_el", read_only=True)
    procesadoPor = serializers.CharField(source="procesado_por", required=False, allow_blank=True)

    class Meta:
        model = ValidacionCorte
        fields = [
            "id",
            "periodoMes",
            "periodoAnio",
            "periodoStr",
            "fechaCorte",
            "totalUsuarios",
            "usuariosValidados",
            "usuariosNoValidados",
            "usuariosPendientes",
            "observaciones",
            "procesadoEl",
            "procesadoPor",
        ]
        read_only_fields = (
            "id",
            "totalUsuarios",
            "usuariosValidados",
            "usuariosNoValidados",
            "usuariosPendientes",
            "procesadoEl",
            "periodoStr",
        )


class EtniaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Etnia"""

    class Meta:
        model = Etnia
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class NacionalidadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Nacionalidad"""

    class Meta:
        model = Nacionalidad
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class SubsectorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Subsector"""

    class Meta:
        model = Subsector
        fields = [
            "id",
            "nombre",
            "codigo",
            "activo",
        ]
        read_only_fields = ("id",)


class SectorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Sector"""

    class Meta:
        model = Sector
        fields = [
            "id",
            "nombre",
            "activo",
        ]
        read_only_fields = ("id",)


class EstablecimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Establecimiento"""

    class Meta:
        model = Establecimiento
        fields = [
            "id",
            "nombre",
            "codigo",
            "activo",
        ]
        read_only_fields = ("id",)


class HistorialCargaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo HistorialCarga"""
    fechaCarga = serializers.DateTimeField(source="fecha_carga", read_only=True)
    tipoCarga = serializers.CharField(source="tipo_carga", read_only=True)
    tipoCargaDisplay = serializers.CharField(source="get_tipo_carga_display", read_only=True)
    nombreArchivo = serializers.CharField(source="nombre_archivo", read_only=True)
    totalRegistros = serializers.IntegerField(source="total_registros", read_only=True)
    registrosCreados = serializers.IntegerField(source="registros_creados", read_only=True)
    registrosActualizados = serializers.IntegerField(source="registros_actualizados", read_only=True)
    registrosInvalidos = serializers.IntegerField(source="registros_invalidos", read_only=True)
    periodoMes = serializers.IntegerField(source="periodo_mes", read_only=True)
    periodoAnio = serializers.IntegerField(source="periodo_anio", read_only=True)
    periodoStr = serializers.CharField(read_only=True)
    fechaCorte = serializers.DateField(source="fecha_corte", read_only=True)
    estadoDisplay = serializers.CharField(source="get_estado_display", read_only=True)
    tasaExito = serializers.FloatField(source="tasa_exito", read_only=True)
    tiempoProcesamiento = serializers.FloatField(source="tiempo_procesamiento", read_only=True)
    validados = serializers.SerializerMethodField()
    noValidados = serializers.SerializerMethodField()
    totalPeriodo = serializers.SerializerMethodField()
    estadoCarga = serializers.SerializerMethodField()

    class Meta:
        model = HistorialCarga
        fields = [
            "id",
            "tipoCarga",
            "tipoCargaDisplay",
            "nombreArchivo",
            "usuario",
            "fechaCarga",
            "periodoMes",
            "periodoAnio",
            "periodoStr",
            "fechaCorte",
            "totalRegistros",
            "registrosCreados",
            "registrosActualizados",
            "registrosInvalidos",
            "validados",
            "noValidados",
            "totalPeriodo",
            "estado",
            "estadoDisplay",
            "estadoCarga",
            "reemplazo",
            "observaciones",
            "tasaExito",
            "tiempoProcesamiento",
            "ip_address",
        ]
        read_only_fields = ("id",)

    def get_validados(self, obj) -> int:
        return getattr(obj, "validados", 0)

    def get_noValidados(self, obj) -> int:
        return getattr(obj, "no_validados", 0)

    def get_totalPeriodo(self, obj) -> int:
        return getattr(obj, "total_periodo", 0)

    def get_estadoCarga(self, obj) -> str:
        return getattr(obj, "estado_carga", "NUEVO")


