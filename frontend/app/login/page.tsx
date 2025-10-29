'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RutInput from '@/components/RutInput';

export default function LoginPage() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rut) {
      setError('Ingrese su RUT');
      return;
    }

    if (!password) {
      setError('Ingrese su clave');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(rut, password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('RUT o clave incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Sistema de Gestión
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Inicie sesión con su cuenta
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* RUT Input */}
              <RutInput
                value={rut}
                onChange={setRut}
                label="RUT"
                placeholder="12345678-9"
                required
                showError={false}
              />

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Clave
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su clave"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Helper Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ¿Olvidó su clave?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Recuperar
                </a>
              </p>
            </div>

            {/* Demo Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">Demo:</p>
              <p className="text-xs text-blue-700">
                Use cualquier RUT válido con clave: <span className="font-mono font-bold">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
