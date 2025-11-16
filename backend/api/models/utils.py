"""
Utilidades compartidas para modelos del sistema.

Este módulo contiene funciones auxiliares que son utilizadas por diferentes modelos
para normalización y validación de datos.
"""
import uuid
from typing import Optional


def normalize_run(value: str) -> str:
    """
    Sanitiza y normaliza un RUN al formato estándar: XXXXXXXX-Y

    Esta función es crucial para asegurar comparaciones confiables de RUNs en toda
    la aplicación, eliminando espacios, puntos y otros caracteres, y asegurando
    que el formato sea consistente.

    Args:
        value: RUN en cualquier formato (ej: "12.345.678-9", "12345678-9", "123456789")

    Returns:
        RUN normalizado en formato "XXXXXXXX-Y" (ej: "12345678-9")
        Retorna string vacío si el valor no es válido

    Ejemplos:
        >>> normalize_run("12.345.678-9")
        "12345678-9"
        >>> normalize_run("12345678-9")
        "12345678-9"
        >>> normalize_run("123456789")
        "12345678-9"
    """
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


# Diccionario para normalización de caracteres especiales en motivos
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
    "�": "O",  # Carácter de reemplazo para encoding inválido
}


def normalize_motivo(value: Optional[str]) -> str:
    """
    Normaliza valores de motivos para permitir búsquedas y comparaciones consistentes.

    Esta función convierte el texto a mayúsculas, elimina acentos y caracteres especiales,
    y normaliza los espacios múltiples. Es fundamental para agrupar y comparar motivos
    de rechazo o validación en los cortes FONASA.

    Args:
        value: Texto del motivo a normalizar

    Returns:
        Motivo normalizado en mayúsculas sin acentos y con espacios normalizados

    Ejemplos:
        >>> normalize_motivo("Rechazado Previsional  ")
        "RECHAZADO PREVISIONAL"
        >>> normalize_motivo("Traslado Negativo")
        "TRASLADO NEGATIVO"
        >>> normalize_motivo("fallecido   múltiple")
        "FALLECIDO MULTIPLE"
    """
    if not value:
        return ""

    normalized = value.upper()

    # Reemplazar caracteres especiales
    for source, target in MOTIVO_REPLACEMENTS.items():
        normalized = normalized.replace(source, target)

    # Normalizar espacios múltiples a un solo espacio
    while "  " in normalized:
        normalized = normalized.replace("  ", " ")

    return normalized.strip()


def observacion_upload_to(instance, filename: str) -> str:
    """
    Genera la ruta de almacenamiento para archivos adjuntos de observaciones.

    Crea una ruta única para cada archivo usando UUID para evitar colisiones
    y organiza los archivos por corte.

    Args:
        instance: Instancia del modelo CorteFonasaObservacion
        filename: Nombre original del archivo

    Returns:
        Ruta relativa para guardar el archivo (ej: "observaciones/123/abc123.pdf")
    """
    ext = filename.split(".")[-1] if "." in filename else "bin"
    uid = uuid.uuid4().hex
    return f"observaciones/{instance.corte_id or 'sin-id'}/{uid}.{ext}"
