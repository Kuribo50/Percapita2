"""
Utilidades compartidas para vistas del sistema.

Este módulo contiene funciones auxiliares, constantes y helpers que son
utilizados por múltiples vistas del sistema.

Incluye:
    - Constantes (MONTH_NAMES_ES, NON_VALIDATED_MOTIVOS, etc.)
    - Funciones de formateo (format_month_label, format_month_key, etc.)
    - Funciones de parsing (parse_date, parse_int, parse_month, etc.)
    - Funciones de validación (is_validated_corte, check_admin_password)
    - Builders de payload (build_corte_payload, build_trakcare_payload)
"""

import base64
import json
from datetime import date, datetime
from typing import Dict, List, Tuple, Optional

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response

from api.models import CorteFonasa, HpTrakcare, normalize_motivo


# =============================================================================
# CONSTANTES
# =============================================================================

# Columnas para respuestas de cortes FONASA
CORTE_COLUMNS = [
    "run",
    "nombres",
    "apPaterno",
    "apMaterno",
    "fechaNacimiento",
    "genero",
    "tramo",
    "fehcaCorte",
    "nombreCentro",
    "centroDeProcedencia",
    "comunaDeProcedencia",
    "centroActual",
    "comunaActual",
    "aceptadoRechazado",
    "motivo",
]

# Columnas para respuestas de HP Trakcare
TRAKCARE_COLUMNS = [
    "codFamilia",
    "relacionParentezco",
    "idTrakcare",
    "etnia",
    "codRegistro",
    "nacionalidad",
    "RUN",
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

# Nombres de meses en español
MONTH_NAMES_ES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
]

# Motivos que indican que un usuario NO está validado
# Solo los 3 motivos que realmente aparecen en el sistema
NON_VALIDATED_MOTIVOS = {
    "TRASLADO NEGATIVO",
    "RECHAZADO PREVISIONAL",
    "RECHAZADO FALLECIDO",
}


# =============================================================================
# FUNCIONES DE VALIDACIÓN
# =============================================================================

def is_validated_corte(aceptado_rechazado: str, motivo: str) -> bool:
    """
    Determina si un registro del corte FONASA está validado.

    Esta función implementa la lógica de negocio para determinar si un usuario
    en el corte FONASA está correctamente inscrito o ha sido rechazado.

    Valores posibles en aceptadoRechazado:
        - "ACEPTADO" -> VALIDADO
        - "RECHAZADO" -> NO VALIDADO
        - "INGRESO RECHAZO SIMULTÁNEO" -> NO VALIDADO (es un rechazo)
        - Vacío o None -> Revisar motivo

    Lógica de validación (en orden de prioridad):
        1. Si aceptadoRechazado == "ACEPTADO" -> SÍ validado
        2. Si aceptadoRechazado contiene "RECHAZADO" o "RECHAZO" -> NO validado
        3. Si el motivo está en NON_VALIDATED_MOTIVOS -> NO validado
        4. Si el motivo contiene "FALLECIDO" -> NO validado (caso especial)
        5. Por defecto -> SÍ validado

    Args:
        aceptado_rechazado: Estado en el campo aceptado_rechazado
        motivo: Motivo del registro

    Returns:
        True si el usuario está validado, False si no lo está

    Ejemplo:
        >>> is_validated_corte("ACEPTADO", "")
        True
        >>> is_validated_corte("RECHAZADO", "TRASLADO NEGATIVO")
        False
        >>> is_validated_corte("", "RECHAZADO FALLECIDO")
        False
    """
    if not aceptado_rechazado:
        aceptado_upper = ""
    else:
        aceptado_upper = str(aceptado_rechazado).upper().strip()

    motivo_norm = normalize_motivo(motivo or "")

    # Prioridad 1: Revisar aceptadoRechazado exactamente
    # ACEPTADO -> Validado
    if aceptado_upper == "ACEPTADO":
        return True

    # RECHAZADO o INGRESO RECHAZO SIMULTÁNEO -> No validado
    if "RECHAZADO" in aceptado_upper or "RECHAZO" in aceptado_upper:
        return False

    # Prioridad 2: Revisar motivo normalizado
    if motivo_norm in NON_VALIDATED_MOTIVOS:
        return False

    # Caso especial: fallecidos no están validados
    if "FALLECIDO" in motivo_norm:
        return False

    # Por defecto, si no hay indicación clara, se considera validado
    return True


def check_admin_password(request) -> Tuple[bool, Optional[Response]]:
    """
    Verifica la contraseña de administrador para operaciones sensibles.

    Algunas operaciones como DELETE requieren una contraseña de administrador
    adicional configurada en settings.ADMIN_DELETE_PASSWORD.

    Args:
        request: Request de DRF

    Returns:
        Tupla (es_valido, response_error)
        - es_valido: True si la contraseña es correcta o no se requiere
        - response_error: Response de error si la contraseña es incorrecta, None si es válida

    Ejemplo:
        >>> is_valid, error_response = check_admin_password(request)
        >>> if not is_valid:
        ...     return error_response
    """
    expected = getattr(settings, "ADMIN_DELETE_PASSWORD", "")
    if not expected:
        return True, None

    provided = None
    if hasattr(request, "data") and isinstance(request.data, dict):
        provided = request.data.get("admin_password")
    if not provided:
        provided = request.query_params.get("admin_password")

    if provided != expected:
        return False, Response(
            {"detail": "Contraseña de administrador incorrecta."},
            status=status.HTTP_403_FORBIDDEN
        )

    return True, None


# =============================================================================
# FUNCIONES DE FORMATEO
# =============================================================================

def format_month_label(year: int, month: int) -> str:
    """
    Formatea un año y mes como etiqueta legible.

    Args:
        year: Año (ej: 2024)
        month: Mes (1-12)

    Returns:
        String formateado (ej: "Octubre 2024")

    Ejemplo:
        >>> format_month_label(2024, 10)
        'Octubre 2024'
    """
    if 1 <= month <= 12:
        return f"{MONTH_NAMES_ES[month - 1]} {year}"
    return f"{year}-{month:02d}"


def format_month_key(year: int, month: int) -> str:
    """
    Formatea un año y mes como clave única.

    Args:
        year: Año (ej: 2024)
        month: Mes (1-12)

    Returns:
        String formateado (ej: "2024-10")

    Ejemplo:
        >>> format_month_key(2024, 10)
        '2024-10'
    """
    return f"{year:04d}-{month:02d}"


def safe_str(value, *, max_length: Optional[int] = None) -> str:
    """
    Convierte un valor a string de forma segura.

    Args:
        value: Valor a convertir
        max_length: Longitud máxima opcional

    Returns:
        String limpio y opcionalmente truncado

    Ejemplo:
        >>> safe_str("  Hola  ")
        'Hola'
        >>> safe_str("Texto muy largo", max_length=5)
        'Texto'
    """
    text = "" if value is None else str(value).strip()
    if max_length is not None:
        return text[:max_length]
    return text


# =============================================================================
# FUNCIONES DE PARSING
# =============================================================================

def parse_date(value: Optional[str]) -> Optional[date]:
    """
    Parsea una fecha desde string soportando múltiples formatos.

    Formatos soportados:
        - YYYY-MM-DD (ISO)
        - DD-MM-YYYY
        - YYYY/MM/DD
        - DD/MM/YYYY

    Args:
        value: String con la fecha o None

    Returns:
        Objeto date o None si no se puede parsear

    Ejemplo:
        >>> parse_date("2024-10-15")
        date(2024, 10, 15)
        >>> parse_date("15-10-2024")
        date(2024, 10, 15)
    """
    if not value:
        return None

    if isinstance(value, datetime):
        return value.date()

    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except (ValueError, TypeError):
            continue
    return None


def parse_int(value: Optional[str]) -> Optional[int]:
    """
    Parsea un entero desde string de forma segura.

    Args:
        value: String con el número o None

    Returns:
        Entero parseado o None si no se puede parsear

    Ejemplo:
        >>> parse_int("123")
        123
        >>> parse_int("abc")
        None
    """
    if value in (None, ""):
        return None
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def parse_month(month_param: Optional[str]) -> Optional[Tuple[int, int]]:
    """
    Parsea un parámetro de mes en formato "YYYY-MM".

    Args:
        month_param: String en formato "YYYY-MM" (ej: "2024-10")

    Returns:
        Tupla (year, month) o None si el formato es inválido

    Ejemplo:
        >>> parse_month("2024-10")
        (2024, 10)
        >>> parse_month("invalid")
        None
    """
    if not month_param:
        return None
    try:
        parts = month_param.split("-")
        if len(parts) != 2:
            return None
        year = int(parts[0])
        month = int(parts[1])
        if 1 <= month <= 12:
            return year, month
    except (TypeError, ValueError):
        return None
    return None


def get_rut_from_token(token: Optional[str]) -> Optional[str]:
    """
    Extrae el RUN del token base64 enviado desde el frontend.

    Args:
        token: Token JWT o base64 con payload que contiene 'rut'

    Returns:
        RUN extraído o None si no se puede decodificar

    Ejemplo:
        >>> token = "Bearer eyJ...base64..."
        >>> get_rut_from_token(token)
        '12345678-9'
    """
    if not token:
        return None

    try:
        # Remover el prefijo "Bearer " si existe
        if token.startswith("Bearer "):
            token = token[7:]

        # Decodificar el base64
        decoded = base64.b64decode(token).decode('utf-8')
        payload = json.loads(decoded)
        return payload.get('rut')
    except Exception:
        return None


def motivo_priority(value: Optional[str]) -> int:
    """
    Retorna una prioridad numérica basada en el motivo.

    Se usa para ordenar registros poniendo los rechazos primero.

    Args:
        value: Motivo del registro

    Returns:
        Prioridad (2 para motivos rechazados, 0 para otros)
    """
    normalized = normalize_motivo(value)
    if normalized in NON_VALIDATED_MOTIVOS:
        return 2
    return 0


# =============================================================================
# BUILDERS DE PAYLOAD
# =============================================================================

def build_corte_payload(instance: CorteFonasa) -> Dict:
    """
    Construye un payload serializable para un registro de corte FONASA.

    Args:
        instance: Instancia de CorteFonasa

    Returns:
        Diccionario con todos los campos serializados

    Ejemplo:
        >>> corte = CorteFonasa.objects.get(pk=1)
        >>> payload = build_corte_payload(corte)
        >>> payload['run']
        '12345678-9'
    """
    return {
        "id": instance.id,
        "run": instance.run,
        "nombres": instance.nombres,
        "apPaterno": instance.ap_paterno,
        "apMaterno": instance.ap_materno,
        "fechaNacimiento": instance.fecha_nacimiento.isoformat() if instance.fecha_nacimiento else "",
        "genero": instance.genero,
        "tramo": instance.tramo,
        "fehcaCorte": instance.fecha_corte.isoformat(),
        "nombreCentro": instance.nombre_centro,
        "centroDeProcedencia": instance.centro_de_procedencia,
        "comunaDeProcedencia": instance.comuna_de_procedencia,
        "centroActual": instance.centro_actual,
        "comunaActual": instance.comuna_actual,
        "aceptadoRechazado": instance.aceptado_rechazado,
        "motivo": instance.motivo,
        "isValidated": is_validated_corte(instance.aceptado_rechazado, instance.motivo),
    }


def build_trakcare_payload(instance: HpTrakcare) -> Dict:
    """
    Construye un payload serializable para un registro de HP Trakcare.

    Args:
        instance: Instancia de HpTrakcare

    Returns:
        Diccionario con todos los campos serializados

    Ejemplo:
        >>> trakcare = HpTrakcare.objects.get(pk=1)
        >>> payload = build_trakcare_payload(trakcare)
        >>> payload['RUN']
        '12345678-9'
    """
    etnia = instance.etnia
    nacionalidad = instance.nacionalidad
    centro_inscripcion = instance.centro_inscripcion
    sector = instance.sector

    return {
        "id": instance.id,
        "codFamilia": instance.cod_familia or None,
        "relacionParentezco": instance.relacion_parentezco or None,
        "idTrakcare": instance.id_trakcare or None,
        "codRegistro": instance.cod_registro or None,
        "RUN": instance.run or None,
        "apPaterno": instance.ap_paterno or None,
        "apMaterno": instance.ap_materno or None,
        "nombre": instance.nombre or None,
        "genero": instance.genero or None,
        "fechaNacimiento": instance.fecha_nacimiento.isoformat() if instance.fecha_nacimiento else None,
        "edad": instance.edad,
        "direccion": instance.direccion or None,
        "telefono": instance.telefono or None,
        "telefonoCelular": instance.telefono_celular or None,
        "TelefonoRecado": instance.telefono_recado or None,
        "telefonoRecado": instance.telefono_recado or None,
        "servicioSalud": instance.servicio_salud or None,
        "prevision": instance.prevision or None,
        "planTrakcare": instance.plan_trakcare or None,
        "praisTrakcare": instance.prais_trakcare or None,
        "fechaIncorporacion": instance.fecha_incorporacion.isoformat() if instance.fecha_incorporacion else None,
        "fechaUltimaModif": instance.fecha_ultima_modif.isoformat() if instance.fecha_ultima_modif else None,
        "fechaDefuncion": instance.fecha_defuncion.isoformat() if instance.fecha_defuncion else None,
        # Relaciones normalizadas
        "etnia": etnia.nombre if etnia else None,
        "nacionalidad": nacionalidad.nombre if nacionalidad else None,
        "centroInscripcion": centro_inscripcion.nombre if centro_inscripcion else None,
        "sector": sector.nombre if sector else None,
    }
