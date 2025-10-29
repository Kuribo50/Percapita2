'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/magicui/animated-card';
import NumberTicker from '@/components/magicui/number-ticker';
import {
  Users,
  ArrowRightLeft,
  FileText,
  CheckCircle2,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Nuevos Usuarios',
      value: 0,
      color: 'blue',
      icon: Users,
      description: 'Registros este mes',
      trend: '+12%',
      href: '/dashboard/traslado-usuarios'
    },
    {
      title: 'Traslados Pendientes',
      value: 0,
      color: 'yellow',
      icon: ArrowRightLeft,
      description: 'Por procesar',
      trend: '-8%',
      href: '/dashboard/traslados'
    },
    {
      title: 'Certificados Generados',
      value: 0,
      color: 'green',
      icon: FileText,
      description: 'Último mes',
      trend: '+24%',
      href: '/dashboard/certificado-inscripcion'
    },
    {
      title: 'Revisiones Diarias',
      value: 0,
      color: 'purple',
      icon: CheckCircle2,
      description: 'Completadas hoy',
      trend: '+5%',
      href: '/dashboard/revision-diaria'
    },
  ];

  const actividadReciente: Array<{ action: string; user: string; time: string }> = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome Section */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Bienvenido, {user?.nombre} {user?.apellido}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Sistema de Gestión de Usuarios - Panel de Control
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.trend.startsWith('+');

            return (
              <AnimatedCard key={stat.title} delay={0.1 + index * 0.1}>
                <Link href={stat.href}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${
                          stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            'text-purple-600 dark:text-purple-400'
                          }`} />
                        </div>
                        <Badge variant={isPositive ? "success" : "destructive"} className="flex items-center gap-1">
                          <TrendingUp className={`h-3 w-3 ${isPositive ? '' : 'rotate-180'}`} />
                          {stat.trend}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl font-bold mb-2">
                        <NumberTicker value={stat.value} />
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {stat.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <AnimatedCard delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4 justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Link href="/dashboard/traslado-usuarios">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Nuevo Usuario</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Registrar usuario nuevo</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 justify-start hover:bg-green-50 dark:hover:bg-green-900/20">
                  <Link href="/dashboard/certificado-inscripcion">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Generar Certificado</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Crear nuevo certificado</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Link href="/dashboard/revision-diaria">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Revisión Diaria</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ver revisiones del día</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones realizadas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actividadReciente.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Clock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Aún no hay actividad registrada
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Las acciones recientes aparecerán aquí
                    </p>
                  </div>
                ) : (
                  actividadReciente.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{activity.action}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.user}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
