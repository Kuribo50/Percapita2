import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Limpia el RUT eliminando puntos, guiones y espacios
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\s-]/g, "");
}

/**
 * Maneja la entrada de RUT, eliminando caracteres no válidos
 */
export function handleRutInput(value: string): string {
  // Permitir solo números y la letra K
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Formatea el RUT con guión (ej: 12345678-9)
 */
export function formatRut(rut: string): string {
  // Limpiar el RUT
  const cleaned = cleanRut(rut);

  if (cleaned.length < 2) {
    return cleaned;
  }

  // Separar el dígito verificador
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Formatear con guión
  return `${body}-${dv}`;
}

/**
 * Calcula el dígito verificador de un RUT
 */
export function calculateDV(rut: string): string {
  const cleaned = cleanRut(rut);

  if (!/^[0-9]+$/.test(cleaned)) {
    return "";
  }

  let sum = 0;
  let multiplier = 2;

  // Calcular desde el final hacia el inicio sobre el cuerpo del RUN
  for (let i = cleaned.length - 1; i >= 0; i--) {
    sum += parseInt(cleaned[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  if (dv === 11) return "0";
  if (dv === 10) return "K";
  return dv.toString();
}

/**
 * Valida si un RUT es válido
 */
export function validateRut(rut: string): boolean {
  if (!rut || rut.length < 3) {
    return false;
  }

  const cleaned = cleanRut(rut);
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();

  // Verificar que el cuerpo solo contenga números
  if (!/^\d+$/.test(body)) {
    return false;
  }

  // Calcular y comparar DV
  const calculatedDV = calculateDV(body);
  return dv === calculatedDV;
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(num: number | string): string {
  if (typeof num === "string") return num;
  return new Intl.NumberFormat("es-CL").format(num);
}
