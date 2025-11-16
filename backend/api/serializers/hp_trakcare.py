"""
Serializers para HP Trakcare.

Este módulo contiene los serializers para el modelo HP Trakcare, incluyendo
serializers para carga masiva de datos y para obtención de detalles.

Serializers:
    - HpTrakcareRecordSerializer: Para procesar registros individuales del CSV de carga
    - HpTrakcareDetailSerializer: Para obtener/actualizar detalles de un registro
"""

from rest_framework import serializers

from api.models import HpTrakcare


# Formatos de fecha aceptados para parsing
DATE_INPUT_FORMATS = ["%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"]


class HpTrakcareRecordSerializer(serializers.Serializer):
    """
    Serializer para procesar registros individuales del CSV de HP Trakcare.

    Este serializer se usa durante la carga masiva de archivos desde HP Trakcare.
    Todos los campos son opcionales para permitir flexibilidad en los datos de entrada.

    Campos principales:
        RUN/run: RUN del paciente (se aceptan ambos nombres por compatibilidad)
        nombre: Nombres del paciente
        apPaterno: Apellido paterno
        apMaterno: Apellido materno
        idTrakcare: ID único en sistema Trakcare
        codFamilia: Código de familia
        relacionParentezco: Relación de parentesco
        etnia: Etnia del paciente
        nacionalidad: Nacionalidad
        sector: Sector territorial
        centroInscripcion: Centro de salud de inscripción
        fechaNacimiento: Fecha de nacimiento
        fechaIncorporacion: Fecha de incorporación al sistema
        fechaDefuncion: Fecha de fallecimiento (si aplica)

    Información de contacto:
        direccion: Dirección del domicilio
        telefono: Teléfono fijo
        telefonoCelular: Teléfono celular
        TelefonoRecado: Teléfono para recados

    Información de salud:
        servicioSalud: Servicio de salud
        prevision: Sistema previsional
        planTrakcare: Plan de salud en Trakcare
        praisTrakcare: Programa PRAIS
    """

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


class HpTrakcareDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para obtener y actualizar detalles de un registro de HP Trakcare.

    Este serializer mapea los nombres de campos del modelo a nombres camelCase
    utilizados por el frontend. Soporta múltiples formatos de fecha.

    Campos de solo lectura:
        id: ID del registro
        RUN: RUN del paciente (normalizado automáticamente)

    Campos editables:
        codFamilia: Código de familia
        relacionParentezco: Relación de parentesco
        idTrakcare: ID en sistema Trakcare
        codRegistro: Código de registro
        etnia: Etnia del paciente
        nacionalidad: Nacionalidad
        apPaterno: Apellido paterno
        apMaterno: Apellido materno
        nombre: Nombres
        genero: Género
        fechaNacimiento: Fecha de nacimiento
        edad: Edad
        direccion: Dirección
        telefono: Teléfono fijo
        telefonoCelular: Teléfono celular
        TelefonoRecado: Teléfono para recados
        servicioSalud: Servicio de salud
        centroInscripcion: Centro de inscripción
        sector: Sector territorial
        prevision: Previsión de salud
        planTrakcare: Plan Trakcare
        praisTrakcare: Programa PRAIS
        fechaIncorporacion: Fecha de incorporación
        fechaUltimaModif: Fecha de última modificación
        fechaDefuncion: Fecha de defunción
    """

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
