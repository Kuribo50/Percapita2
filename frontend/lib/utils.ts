/**
 * Formatea un RUT chileno con guión y dígito verificador
 * Ejemplo: 123456789 -> 12345678-9
 * Máximo 9 dígitos + guión + dígito verificador (0-9 o K)
 */
export function formatRut(value: string): string {
  // Eliminar todo excepto números y K
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length === 0) return '';
  
  // Limitar a máximo 10 caracteres (9 dígitos + 1 DV)
  if (clean.length > 10) {
    clean = clean.slice(0, 10);
  }
  
  // Si tiene más de 1 carácter, separar número del dígito verificador
  if (clean.length > 1) {
    const rutNumber = clean.slice(0, -1);
    const dv = clean.slice(-1);
    
    // Asegurar que el número no tenga más de 9 dígitos
    const limitedNumber = rutNumber.slice(-9);
    
    return `${limitedNumber}-${dv}`;
  }
  
  return clean;
}

/**
 * Valida un RUT chileno
 */
export function validateRut(rut: string): boolean {
  // Eliminar puntos y guiones
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
  
  if (cleanRut.length < 2) return false;
  
  // Separar número del dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const calculatedDv = 11 - (sum % 11);
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'k' : calculatedDv.toString();
  
  return dv === expectedDv;
}

/**
 * Limpia el RUT dejando solo números y el dígito verificador
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Maneja el input de RUT con validación de longitud
 * Solo permite números y K, máximo 9 dígitos
 */
export function handleRutInput(value: string): string {
  // Eliminar todo excepto números y K
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  // Limitar a 10 caracteres (9 números + 1 DV)
  return clean.slice(0, 10);
}
