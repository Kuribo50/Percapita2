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
  TrendingUp,
  TrendingDown,
  Database,
  Upload,
  Calendar,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface NuevosUsuariosStats {
  mesActual: {
    mes: number;
    anio: number;
    periodo: string;
    total: number;
  };
  totales: {
    total: number;
    pendientes: number;
    validados: number;
    noValidados: number;
  };
  historicoMeses: Array<{
    mes: number;
    anio: number;
    periodo: string;
    total: number;
  }>;
}

interface CorteSummary {
  month: string;
  label: string;
  total: number;
  validated: number;
  nonValidated: number;
}

interface CorteData {
  total: number;
  validated: number;
  non_validated: number;
  summary: CorteSummary[];
}

interface HistorialCarga {
  id: number;
  tipo_carga: string;
  nombre_archivo: string;
  usuario: string;
  fecha_carga: string;
  periodo_mes?: number;
  periodo_anio?: number;
  total_registros: number;
  estado: string;
  validados?: number;
  no_validados?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nuevosUsuariosStats, setNuevosUsuariosStats] = useState<NuevosUsuariosStats | null>(null);
  const [corteData, setCorteData] = useState<CorteData | null>(null);
  const [historialCargas, setHistorialCargas] = useState<HistorialCarga[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch nuevos usuarios statistics
        const nuevosUsuariosRes = await fetch(`${API_URL}/api/nuevos-usuarios/estadisticas/`);
        if (nuevosUsuariosRes.ok) {
          const data = await nuevosUsuariosRes.json();
          setNuevosUsuariosStats(data);
        }

        // Fetch corte summary
        const corteRes = await fetch(`${API_URL}/api/corte-fonasa/?all=true`);
        if (corteRes.ok) {
          const data = await corteRes.json();
          setCorteData(data);
        }

        // Fetch historial cargas
        const historialRes = await fetch(`${API_URL}/api/historial-cargas/?limit=10`);
        if (historialRes.ok) {
          const data = await historialRes.json();
          setHistorialCargas(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: '+0%', isPositive: true };
    const diff = ((current - previous) / previous) * 100;
    const isPositive = diff >= 0;
    return {
      value: `${isPositive ? '+' : ''}${diff.toFixed(1)}%`,
      isPositive
    };
  };

  // Get stats with trends
  const stats = [
    {
      title: 'Nuevos Usuarios',
      value: nuevosUsuariosStats?.mesActual?.total || 0,
      color: 'blue',
      icon: Users,
      description: 'Registros este mes',
      trend: (nuevosUsuariosStats?.historicoMeses?.length ?? 0) >= 2 && nuevosUsuariosStats
        ? calculateTrend(
            nuevosUsuariosStats.mesActual.total,
            nuevosUsuariosStats.historicoMeses[nuevosUsuariosStats.historicoMeses.length - 2]?.total || 0
          )
        : { value: '+0%', isPositive: true },
      href: '/dashboard/traslado-usuarios'
    },
    {
      title: 'Total en Sistema',
      value: nuevosUsuariosStats?.totales?.total || 0,
      color: 'indigo',
      icon: Database,
      description: 'Usuarios registrados',
      trend: { value: '', isPositive: true },
      href: '/dashboard/traslado-usuarios'
    },
    {
      title: 'Validados',
      value: nuevosUsuariosStats?.totales?.validados || 0,
      color: 'green',
      icon: CheckCircle2,
      description: 'En último corte',
      trend: { value: '', isPositive: true },
      href: '/dashboard/subir-corte/gestion'
    },
    {
      title: 'Pendientes',
      value: nuevosUsuariosStats?.totales?.pendientes || 0,
      color: 'yellow',
      icon: Clock,
      description: 'Por validar',
      trend: { value: '', isPositive: false },
      href: '/dashboard/subir-corte/gestion'
    },
  ];

  // Prepare chart data for nuevos usuarios
  const nuevosUsuariosChartData = nuevosUsuariosStats?.historicoMeses?.map(item => ({
    periodo: item.periodo,
    total: item.total
  })) || [];

  // Prepare chart data for corte validation
  const corteChartData = corteData?.summary?.slice(0, 6).reverse().map(item => ({
    periodo: item.label,
    validados: item.validated,
    noValidados: item.nonValidated,
    total: item.total
  })) || [];

  // Validation pie chart data
  const validationPieData = [
    { name: 'Validados', value: nuevosUsuariosStats?.totales?.validados || 0, color: '#10b981' },
    { name: 'No Validados', value: nuevosUsuariosStats?.totales?.noValidados || 0, color: '#ef4444' },
    { name: 'Pendientes', value: nuevosUsuariosStats?.totales?.pendientes || 0, color: '#f59e0b' }
  ];

  // Format date for activity
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome Section */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">
                      Bienvenido, {user?.nombre}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {user?.establecimiento || 'Sistema de Gestión de Usuarios'} - Panel de Control
                    </CardDescription>
                  </div>
                </div>
                {nuevosUsuariosStats && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {nuevosUsuariosStats.mesActual.periodo}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <AnimatedCard key={stat.title} delay={0.1 + index * 0.1}>
                <Link href={stat.href}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${
                          stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          stat.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                          stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                            stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            'text-purple-600 dark:text-purple-400'
                          }`} />
                        </div>
                        {stat.trend.value && (
                          <Badge variant={stat.trend.isPositive ? "success" : "destructive"} className="flex items-center gap-1">
                            {stat.trend.isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {stat.trend.value}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl font-bold mb-2">
                        {loading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <NumberTicker value={stat.value} />
                        )}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nuevos Usuarios por Mes */}
          <AnimatedCard delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nuevos Usuarios por Mes
                </CardTitle>
                <CardDescription>
                  Últimos 6 meses de registros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading || nuevosUsuariosChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-gray-500">Cargando datos...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={nuevosUsuariosChartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                      <XAxis
                        dataKey="periodo"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        name="Nuevos Usuarios"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Estado de Validación */}
          <AnimatedCard delay={0.6}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estado de Validación
                </CardTitle>
                <CardDescription>
                  Distribución actual de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading || validationPieData.every(d => d.value === 0) ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-gray-500">Cargando datos...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={validationPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          const percent = (props.value / validationPieData.reduce((sum, d) => sum + d.value, 0)) * 100;
                          return `${props.name}: ${percent.toFixed(0)}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {validationPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Validación de Cortes */}
        {corteChartData.length > 0 && (
          <AnimatedCard delay={0.7}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Validación de Cortes Mensuales
                </CardTitle>
                <CardDescription>
                  Comparación de usuarios validados vs no validados por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={corteChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis
                      dataKey="periodo"
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="validados" fill="#10b981" name="Validados" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noValidados" fill="#ef4444" name="No Validados" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </AnimatedCard>
        )}

        {/* Quick Actions */}
        <AnimatedCard delay={0.8}>
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
                  <Link href="/dashboard/subir-corte">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Subir Corte</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cargar datos de FONASA</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Link href="/dashboard/certificado-inscripcion">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Generar Certificado</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Crear certificado</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={0.9}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas cargas realizadas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cargando actividad...</p>
                  </div>
                ) : historialCargas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Clock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Aún no hay actividad registrada
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Las cargas recientes aparecerán aquí
                    </p>
                  </div>
                ) : (
                  historialCargas.map((carga, index) => (
                    <div key={carga.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          carga.estado === 'EXITOSO' ? 'bg-green-500' :
                          carga.estado === 'ERROR' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {carga.tipo_carga === 'CORTE_FONASA' ? 'Corte FONASA' : 'HP Trakcare'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {carga.usuario} - {carga.total_registros} registros
                            {carga.validados !== undefined && ` (${carga.validados} validados)`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={carga.estado === 'EXITOSO' ? 'success' : carga.estado === 'ERROR' ? 'destructive' : 'outline'}
                          className="text-xs mb-1"
                        >
                          {carga.estado}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(carga.fecha_carga)}
                        </p>
                      </div>
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
