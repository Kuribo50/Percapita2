"""
Serializers para Cortes FONASA.

Este módulo contiene los serializers para los modelos relacionados con
cortes mensuales de FONASA, incluyendo serializers para carga masiva
y para obtención de detalles.

Serializers:
    - CorteFonasaRecordSerializer: Para procesar registros individuales del CSV de carga
    - CorteFonasaDetailSerializer: Para obtener/actualizar detalles de un corte
    - CorteFonasaObservacionSerializer: Para observaciones de cortes
"""

from rest_framework import serializers

from api.models import CorteFonasa, CorteFonasaObservacion


# Formatos de fecha aceptados para parsing
DATE_INPUT_FORMATS = ["%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"]


class CorteFonasaRecordSerializer(serializers.Serializer):
    """
    Serializer para procesar registros individuales del CSV de cortes FONASA.

    Este serializer se usa durante la carga masiva de archivos de cortes.
    Todos los campos son opcionales excepto run y fehcaCorte.

    Campos:
        run: RUN del usuario (requerido)
        fehcaCorte: Fecha del corte (requerido)
        nombres: Nombres del usuario
        apPaterno: Apellido paterno
        apMaterno: Apellido materno
        fechaNacimiento: Fecha de nacimiento
        genero: Género
        tramo: Tramo FONASA
        nombreCentro: Nombre del centro de salud
        centroDeProcedencia: Centro de origen
        comunaDeProcedencia: Comuna de origen
        centroActual: Centro actual/destino
        comunaActual: Comuna actual/destino
        aceptadoRechazado: Estado (ACEPTADO/RECHAZADO/etc)
        motivo: Motivo de rechazo o estado

    Nota: El typo "fehcaCorte" se mantiene por compatibilidad con el CSV original
    """

    run = serializers.CharField()
    nombres = serializers.CharField(required=False, allow_blank=True)
    apPaterno = serializers.CharField(required=False, allow_blank=True)
    apMaterno = serializers.CharField(required=False, allow_blank=True)
    fechaNacimiento = serializers.CharField(required=False, allow_blank=True)
    genero = serializers.CharField(required=False, allow_blank=True)
    tramo = serializers.CharField(required=False, allow_blank=True)
    fehcaCorte = serializers.CharField()  # Mantener typo por compatibilidad
    codGenero = serializers.CharField(required=False, allow_blank=True)
    nombreCentro = serializers.CharField(required=False, allow_blank=True)
    rutCentroProcedencia = serializers.CharField(required=False, allow_blank=True)
    centroDeProcedencia = serializers.CharField(required=False, allow_blank=True)
    comunaDeProcedencia = serializers.CharField(required=False, allow_blank=True)
    rutCentroActual = serializers.CharField(required=False, allow_blank=True)
    nombreCentroActual = serializers.CharField(required=False, allow_blank=True)
    centroActual = serializers.CharField(required=False, allow_blank=True)
    comunaActual = serializers.CharField(required=False, allow_blank=True)
    aceptadoRechazado = serializers.CharField(required=False, allow_blank=True)
    motivo = serializers.CharField(required=False, allow_blank=True)


class CorteFonasaDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para obtener y actualizar detalles de un registro de corte FONASA.

    Este serializer mapea los nombres de campos del modelo a nombres camelCase
    utilizados por el frontend. Soporta múltiples formatos de fecha.

    Campos de solo lectura:
        id: ID del registro
        run: RUN del usuario (normalizado automáticamente)
        fehcaCorte: Fecha del corte

    Campos editables:
        nombres: Nombres
        apPaterno: Apellido paterno
        apMaterno: Apellido materno
        fechaNacimiento: Fecha de nacimiento
        genero: Género
        tramo: Tramo FONASA
        nombreCentro: Nombre del centro
        centroDeProcedencia: Centro de procedencia
        comunaDeProcedencia: Comuna de procedencia
        nombreCentroActual: Centro actual
        centroActual: Centro actual (legacy)
        comunaActual: Comuna actual
        aceptadoRechazado: Estado
        motivo: Motivo
    """

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
    rutCentroProcedencia = serializers.CharField(
        source="rut_centro_procedencia", required=False, allow_null=True, allow_blank=True
    )
    centroDeProcedencia = serializers.CharField(
        source="centro_de_procedencia", required=False, allow_null=True, allow_blank=True
    )
    comunaDeProcedencia = serializers.CharField(
        source="comuna_de_procedencia", required=False, allow_null=True, allow_blank=True
    )
    rutCentroActual = serializers.CharField(
        source="rut_centro_actual", required=False, allow_null=True, allow_blank=True
    )
    nombreCentroActual = serializers.CharField(
        source="nombre_centro_actual", required=False, allow_null=True, allow_blank=True
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
            "rutCentroProcedencia",
            "centroDeProcedencia",
            "comunaDeProcedencia",
            "rutCentroActual",
            "nombreCentroActual",
            "centroActual",
            "comunaActual",
            "aceptadoRechazado",
            "motivo",
        ]
        read_only_fields = ("id", "run", "fehcaCorte")


class CorteFonasaObservacionSerializer(serializers.ModelSerializer):
    """
    Serializer para observaciones de registros de corte FONASA.

    Permite visualizar observaciones con información adicional del corte
    y del autor. Todos los campos son de solo lectura.

    Campos principales:
        id: ID de la observación
        corteId: ID del corte al que pertenece
        run: RUN del usuario del corte
        titulo: Título de la observación
        texto: Texto completo
        estadoRevision: Estado actual
        tipo: Tipo de observación (PREDEFINIDA/MANUAL)
        adjuntoUrl: URL del archivo adjunto (si existe)
        adjuntoNombre: Nombre del archivo adjunto
        metadata: Metadatos adicionales en JSON
        createdAt: Fecha de creación
        updatedAt: Fecha de última actualización
        autorNombre: Nombre del autor
        autorId: ID del autor
        centroActual: Centro de salud del usuario
        fechaCorte: Fecha del corte
    """

    corteId = serializers.IntegerField(source="corte_id", read_only=True)
    run = serializers.CharField(source="corte.run", read_only=True)
    estadoRevision = serializers.CharField(source="estado_revision", read_only=True)
    tipo = serializers.CharField(read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    autorNombre = serializers.SerializerMethodField()
    autorId = serializers.SerializerMethodField()
    adjuntoUrl = serializers.SerializerMethodField()
    adjuntoNombre = serializers.SerializerMethodField()
    centroActual = serializers.SerializerMethodField()
    fechaCorte = serializers.SerializerMethodField()

    class Meta:
        model = CorteFonasaObservacion
        fields = [
            "id",
            "corteId",
            "run",
            "titulo",
            "texto",
            "estadoRevision",
            "tipo",
            "adjuntoUrl",
            "adjuntoNombre",
            "metadata",
            "createdAt",
            "updatedAt",
            "autorNombre",
            "autorId",
            "centroActual",
            "fechaCorte",
        ]
        read_only_fields = fields

    def get_autorNombre(self, obj: CorteFonasaObservacion) -> str | None:
        """Obtiene el nombre del autor de la observación."""
        # Primero intentar el campo de nombre guardado
        if obj.autor_nombre:
            return obj.autor_nombre

        # Luego intentar obtener del usuario relacionado
        autor = obj.autor
        if not autor:
            return None
        nombre = getattr(autor, "nombre_completo", None)
        if nombre:
            return nombre
        # Fallback to username if full name not available
        return getattr(autor, "username", None)

    def get_autorId(self, obj: CorteFonasaObservacion) -> int | None:
        """Obtiene el ID del autor."""
        autor = obj.autor
        if autor is None:
            return None
        return getattr(autor, "id", None)

    def get_adjuntoUrl(self, obj: CorteFonasaObservacion) -> str | None:
        """Obtiene la URL completa del archivo adjunto."""
        if not obj.adjunto:
            return None
        request = self.context.get("request") if self.context else None
        try:
            url = obj.adjunto.url
        except ValueError:
            return None
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_adjuntoNombre(self, obj: CorteFonasaObservacion) -> str | None:
        """Obtiene el nombre del archivo adjunto."""
        if not obj.adjunto:
            return None
        nombre = obj.adjunto.name or ""
        return nombre.split("/")[-1] if nombre else None

    def get_centroActual(self, obj: CorteFonasaObservacion) -> str | None:
        """Obtiene el centro de salud del corte."""
        corte = obj.corte
        if not corte:
            return None
        # Priorizar nombre_centro (centro de inscripción)
        return corte.nombre_centro or corte.centro_actual or None

    def get_fechaCorte(self, obj: CorteFonasaObservacion) -> str | None:
        """Obtiene la fecha del corte en formato ISO."""
        corte = obj.corte
        if corte and corte.fecha_corte:
            return corte.fecha_corte.isoformat()
        return None
