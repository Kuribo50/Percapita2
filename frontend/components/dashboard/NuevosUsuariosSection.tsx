"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface EstadisticasHoy {
  hoy: number;
  mes: number;
  validados: number;
  pendientes: number;
}

export function NuevosUsuariosSection() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<EstadisticasHoy>({
    hoy: 0,
    mes: 0,
    validados: 0,
    pendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/nuevos-usuarios/`);
      const data = await response.json();
      
      // Calcular estadísticas de hoy y del mes
      const hoy = new Date().toISOString().split('T')[0];
      const mesActual = new Date().getMonth() + 1;
      const anioActual = new Date().getFullYear();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usuariosHoy = (data.usuarios || []).filter((u: any) => 
        u.creadoEl.split('T')[0] === hoy
      ).length;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usuariosMes = (data.usuarios || []).filter((u: any) => 
        u.periodoMes === mesActual && u.periodoAnio === anioActual
      ).length;

      setEstadisticas({
        hoy: usuariosHoy,
        mes: usuariosMes,
        validados: data.estadisticas?.validados || 0,
        pendientes: data.estadisticas?.pendientes || 0,
      });

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Nuevos Usuarios</CardTitle>
              <CardDescription>
                Gestión y validación de inscripciones
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estadísticas en Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos Hoy</p>
                  <p className="text-2xl font-bold">
                    {loading ? '-' : estadisticas.hoy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Este Mes</p>
                  <p className="text-2xl font-bold">
                    {loading ? '-' : estadisticas.mes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validados</p>
                  <p className="text-2xl font-bold">
                    {loading ? '-' : estadisticas.validados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold">
                    {loading ? '-' : estadisticas.pendientes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón de Gestión */}
        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => router.push('/dashboard/nuevos-usuarios/gestion')}
          >
            <UserPlus className="w-5 h-5" />
            Gestión de Nuevos Usuarios
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Info de validación automática */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Validación Automática</h4>
                <p className="text-xs text-muted-foreground">
                  Los usuarios se validan automáticamente cuando se sube el corte FONASA del mes siguiente.
                  Si un usuario de octubre aparece en el corte de noviembre, se marcará como &quot;Validado&quot; o &quot;No Validado&quot;
                  según su motivo. Si no aparece, permanecerá como &quot;Pendiente&quot;.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
