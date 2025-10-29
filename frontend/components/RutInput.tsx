'use client';

import { useState, ChangeEvent } from 'react';
import { formatRut, validateRut, handleRutInput } from '@/lib/utils';

interface RutInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showError?: boolean;
}

export default function RutInput({
  value,
  onChange,
  label = 'RUT',
  placeholder = '12345678-9',
  required = false,
  disabled = false,
  className = '',
  showError = true,
}: RutInputProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Limpiar y validar longitud
    const cleanValue = handleRutInput(inputValue);
    
    // Formatear con guión
    const formatted = formatRut(cleanValue);
    
    // Actualizar valor
    onChange(formatted);
    
    // Validar si está completo
    if (formatted.length >= 3 && touched) {
      if (!validateRut(formatted)) {
        setError('RUT inválido');
      } else {
        setError('');
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (value && !validateRut(value)) {
      setError('RUT inválido');
    } else {
      setError('');
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={10}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
          error && showError ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && showError && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Formato: 12345678-9 (máximo 9 dígitos)
      </p>
    </div>
  );
}
