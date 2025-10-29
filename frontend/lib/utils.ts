import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funciones para manejo de RUT chileno
export function handleRutInput(value: string): string {
  // Eliminar todo excepto números y K
  return value.toUpperCase().replace(/[^0-9K]/g, '').slice(0, 9);
}

export function formatRut(value: string): string {
  // Eliminar formato previo
  const clean = value.replace(/[^0-9K]/g, '');

  if (clean.length <= 1) return clean;

  // Separar dígito verificador
  const dv = clean.slice(-1);
  const numbers = clean.slice(0, -1);

  if (numbers.length === 0) return '';

  // Formatear con guión
  return `${numbers}-${dv}`;
}

export function validateRut(rut: string): boolean {
  // Limpiar el RUT
  const cleanRut = rut.replace(/[^0-9K]/g, '');

  if (cleanRut.length < 2) return false;

  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  // Calcular dígito verificador esperado
  let sum = 0;
  let multiplier = 2;

  // Recorrer de derecha a izquierda
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const expectedDvStr = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

  return dv === expectedDvStr;
}
