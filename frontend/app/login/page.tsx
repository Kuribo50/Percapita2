'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { handleRutInput, formatRut } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDevAdmin } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(rut, password);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de Gestión Percapita
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu RUT y contraseña para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* RUT Field */}
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => {
                    const clean = handleRutInput(e.target.value);
                    setRut(formatRut(clean));
                  }}
                  required
                  className="h-11"
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link 
                    href="/recuperar-password" 
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                  autoComplete="current-password"
                />
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>

            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-2"
                  onClick={() => {
                    // Acceso rápido de desarrollo: admin
                    try {
                      loginAsDevAdmin();
                      router.push('/dashboard');
                    } catch {
                      // noop
                    }
                  }}
                  title="Solo desarrollo: inicia sesión como administrador"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Entrar como Admin (DEV)
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  Botón visible solo en desarrollo. Inicia sesión con una cuenta administradora de prueba.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link href="/register">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Nueva Cuenta
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          Al iniciar sesión, aceptas nuestros{' '}
          <Link href="/terminos" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Términos de Servicio
          </Link>
          {' '}y{' '}
          <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
