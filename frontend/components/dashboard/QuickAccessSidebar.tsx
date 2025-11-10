"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  FileUp,
  BarChart3,
  Settings,
  Download,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Database,
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
  route?: string;
  action?: () => void;
}

export function QuickAccessSidebar() {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'nuevos-usuarios',
      title: 'Nuevos Usuarios',
      description: 'Gestionar inscripciones',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-950/50',
      route: '/dashboard/nuevos-usuarios/gestion',
    },
    {
      id: 'subir-corte',
      title: 'Subir Corte',
      description: 'Cargar archivo FONASA',
      icon: <FileUp className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
      route: '/dashboard/subir-corte/gestion',
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas',
      description: 'Ver reportes y gráficos',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
      route: '/dashboard',
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/30',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-950/50',
      route: '/dashboard/configuracion',
    },
  ];

  const infoCards = [
    {
      id: 'usuarios-activos',
      title: 'Usuarios Activos',
      value: '2,345',
      trend: '+12%',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      id: 'cargas-mes',
      title: 'Cargas del Mes',
      value: '28',
      trend: '+8%',
      icon: <Database className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      id: 'tasa-validacion',
      title: 'Tasa Validación',
      value: '94.2%',
      trend: '+2.1%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
  ];

  const handleAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route);
    } else if (action.action) {
      action.action();
    }
  };

  return (
    <div className="space-y-4">
      {/* Accesos Rápidos */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            Accesos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`w-full justify-start h-auto p-3 ${action.hoverColor} transition-all`}
              onClick={() => handleAction(action)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <div className={action.color}>
                    {action.icon}
                  </div>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Tarjetas de Información */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            Resumen Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infoCards.map((card) => (
            <div
              key={card.id}
              className={`p-4 rounded-xl ${card.bgColor} border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={card.color}>
                  {card.icon}
                </div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Acción Destacada */}
      <Card className="border-2 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-primary/20">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                Exportar Datos
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Descarga reportes en Excel
              </p>
              <Button className="w-full" size="sm">
                Descargar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
