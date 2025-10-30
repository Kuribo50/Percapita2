'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RutInput from '@/components/RutInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Mail, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [establecimiento, setEstablecimiento] = useState('');
  const [email, setEmail] = useState('');
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

    if (!nombre) {
      setError('Ingrese su nombre completo');
      return;
    }

    if (!establecimiento) {
      setError('Ingrese su establecimiento');
      return;
    }

    if (!email) {
      setError('Ingrese su correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(rut, nombre, establecimiento, email);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Datos incompletos o incorrectos. Verifique la información.');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Sistema de Gestión
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Registro de acceso al sistema
              </CardDescription>
            </div>
          </CardHeader>

          {/* Form */}
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* RUT Input */}
              <div className="space-y-2">
                <RutInput
                  value={rut}
                  onChange={setRut}
                  label="RUT"
                  placeholder="12345678-9"
                  required
                  showError={false}
                />
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez González"
                  required
                />
              </div>

              {/* Establecimiento */}
              <div className="space-y-2">
                <Label htmlFor="establecimiento" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Establecimiento
                </Label>
                <Input
                  id="establecimiento"
                  type="text"
                  value={establecimiento}
                  onChange={(e) => setEstablecimiento(e.target.value)}
                  placeholder="Ej: CESFAM Los Aromos"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@salud.cl"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Badge */}
              <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                    Los datos ingresados se utilizarán para identificar sus acciones en el sistema
                  </p>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Ingresar al Sistema
                  </>
                )}
              </Button>
            </form>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Badge variant="outline" className="text-xs">
                  Sistema Percapita
                </Badge>
                <span>v2.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
