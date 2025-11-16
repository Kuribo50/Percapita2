"""
Serializers para Gestión de Usuarios, Validaciones e Historial.

Este módulo contiene los serializers para modelos relacionados con:
- Gestión de nuevos usuarios que llegan antes del corte
- Validaciones de cortes contra nuevos usuarios
- Historial de cargas de archivos

Serializers:
    - NuevoUsuarioRecordSerializer: Para procesar registros del CSV de nuevos usuarios
    - NuevoUsuarioSerializer: Para gestión completa de nuevos usuarios
    - ValidacionCorteSerializer: Para registros de validaciones
    - HistorialCargaSerializer: Para historial de cargas de archivos
"""

from django.http import QueryDict
from rest_framework import serializers

from api.models import (
    CorteFonasa,
    NuevoUsuario,
    ValidacionCorte,
    HistorialCarga,
)


# Formatos de fecha aceptados para parsing
DATE_INPUT_FORMATS = ["%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"]


class NuevoUsuarioRecordSerializer(serializers.Serializer):
    """
    Serializer para procesar registros individuales del CSV de nuevos usuarios.

    Este serializer se usa durante la carga masiva de archivos con nuevos usuarios
    que se inscriben antes del corte mensual.

    Campos:
        fecha: Fecha de inscripción
        run: RUN del usuario (requerido)
        nombres: Nombres
        apellidoPaterno: Apellido paterno
        apellidoMaterno: Apellido materno
        nacionalidad: Nacionalidad
        etnia: Etnia
        sector: Sector territorial
        codigoSector: Código del sector
        subsector: Subsector
        codPercapita: Código de per cápita
        centro: Centro de salud
        observaciones: Observaciones generales
        estado: Estado inicial (PENDIENTE/VALIDADO/NO_VALIDADO)
    """

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


class NuevoUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer completo para el modelo NuevoUsuario.

    Maneja la serialización de nuevos usuarios con todas sus relaciones,
    campos de revisión y validación. Proporciona información adicional
    del último corte FONASA para validación.

    Campos principales:
        id: ID del registro
        run: RUN del usuario
        nombres: Nombres
        apellidoPaterno: Apellido paterno
        apellidoMaterno: Apellido materno
        nombreCompleto: Nombre completo (generado automáticamente)
        fechaInscripcion: Fecha de inscripción
        periodoMes: Mes del periodo (1-12)
        periodoAnio: Año del periodo
        periodoStr: Periodo en formato legible (ej: "Octubre 2024")
        estado: Estado de validación

    Campos de revisión:
        revisado: Indica si fue revisado
        revisadoManualmente: Indica si fue revisión manual
        revisadoPor: Usuario que hizo la revisión
        revisadoEl: Timestamp de revisión
        observacionesTrakcare: Observaciones de HP Trakcare
        checklistTrakcare: Checklist de validación (JSON)

    Campos adicionales:
        infoValidacion: Información del último corte FONASA (SerializerMethodField)
        fechaSolicitud: Fecha de solicitud (alias de fechaInscripcion para compatibilidad)

    Relaciones:
        nacionalidad: FK a Nacionalidad
        etnia: FK a Etnia
        sector: FK a Sector
        subsector: FK a Subsector
        establecimiento: FK a Establecimiento
        validacion: FK a ValidacionCorte
    """

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
        """
        Retorna la fecha de inscripción en formato ISO.

        Campo de compatibilidad con el frontend que usa 'fechaSolicitud'.
        """
        if obj.fecha_inscripcion:
            return obj.fecha_inscripcion.strftime("%Y-%m-%d")
        return None

    def get_infoValidacion(self, obj: NuevoUsuario) -> dict | None:
        """
        Obtiene información de validación desde el último corte FONASA.

        Busca el registro más reciente en CorteFonasa para este RUN y retorna
        información sobre su estado de validación.

        Returns:
            Dict con aceptadoRechazado, motivo y motivoNormalizado, o None si no existe
        """
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
        """
        Permite campos adicionales y normaliza valores enviados desde el frontend.

        Maneja la conversión de QueryDict a dict mutable y normaliza valores
        de campos relacionales que pueden venir vacíos.
        """
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
    """
    Serializer para el modelo ValidacionCorte.

    Registra los resultados de validaciones automáticas cuando se sube un
    corte FONASA y se comparan los nuevos usuarios del mes anterior.

    Campos:
        id: ID del registro
        periodoMes: Mes del periodo validado (1-12)
        periodoAnio: Año del periodo validado
        periodoStr: Periodo en formato legible (ej: "Octubre 2024")
        fechaCorte: Fecha del corte usado para validar
        totalUsuarios: Total de usuarios pendientes
        usuariosValidados: Usuarios que aparecieron correctamente
        usuariosNoValidados: Usuarios rechazados en el corte
        usuariosPendientes: Usuarios que no aparecieron
        observaciones: Observaciones del proceso
        procesadoEl: Timestamp del procesamiento
        procesadoPor: Usuario que procesó (o "Sistema")
    """

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


class HistorialCargaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo HistorialCarga.

    Registra el historial de todas las cargas de archivos realizadas en el sistema
    (Cortes FONASA y HP Trakcare).

    Campos principales:
        id: ID del registro
        tipoCarga: Tipo de archivo (CORTE_FONASA/HP_TRAKCARE)
        tipoCargaDisplay: Nombre legible del tipo
        nombreArchivo: Nombre del archivo cargado
        usuario: Usuario que realizó la carga
        fechaCarga: Timestamp de la carga
        estado: Estado de la carga (EXITOSO/ERROR/PARCIAL/EN_PROCESO)
        estadoDisplay: Nombre legible del estado

    Estadísticas:
        totalRegistros: Total de registros en el archivo
        registrosCreados: Registros nuevos creados
        registrosActualizados: Registros actualizados
        registrosInvalidos: Registros con errores
        tasaExito: Porcentaje de registros procesados exitosamente

    Campos de periodo (solo para Corte FONASA):
        periodoMes: Mes del periodo
        periodoAnio: Año del periodo
        periodoStr: Periodo en formato legible
        fechaCorte: Fecha del corte

    Metadatos:
        reemplazo: Indica si se reemplazaron datos existentes
        observaciones: Observaciones sobre la carga
        tiempoProcesamiento: Tiempo en segundos
        ip_address: IP desde donde se realizó

    Campos adicionales (SerializerMethodField):
        validados: Usuarios validados (para cortes)
        noValidados: Usuarios no validados (para cortes)
        totalPeriodo: Total del periodo (para cortes)
        estadoCarga: Estado de la carga (NUEVO/etc)
    """

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
        """Obtiene el número de validados (desde atributo dinámico)."""
        return getattr(obj, "validados", 0)

    def get_noValidados(self, obj) -> int:
        """Obtiene el número de no validados (desde atributo dinámico)."""
        return getattr(obj, "no_validados", 0)

    def get_totalPeriodo(self, obj) -> int:
        """Obtiene el total del periodo (desde atributo dinámico)."""
        return getattr(obj, "total_periodo", 0)

    def get_estadoCarga(self, obj) -> str:
        """Obtiene el estado de la carga (desde atributo dinámico)."""
        return getattr(obj, "estado_carga", "NUEVO")
