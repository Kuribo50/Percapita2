'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, UserPlus, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    establecimiento: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        rut: formData.rut,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        establecimiento: formData.establecimiento,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tu cuenta ha sido creada correctamente.
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crear Nueva Cuenta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa tus datos para registrarte
          </p>
        </div>

        {/* Register Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Registro de Usuario</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RUT */}
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={(e) => setFormData({...formData, rut: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Pérez González"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@salud.cl"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>

                {/* Establecimiento */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="establecimiento">Establecimiento *</Label>
                  <Input
                    id="establecimiento"
                    type="text"
                    placeholder="CESFAM Los Aromos"
                    value={formData.establecimiento}
                    onChange={(e) => setFormData({...formData, establecimiento: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required 
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                  Acepto los{' '}
                  <Link href="/terminos" className="text-blue-600 hover:text-blue-700">
                    Términos de Servicio
                  </Link>
                  {' '}y la{' '}
                  <Link href="/privacidad" className="text-blue-600 hover:text-blue-700">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Crear Cuenta
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
