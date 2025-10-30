'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedCard } from '@/components/magicui/animated-card';
import NumberTicker from '@/components/magicui/number-ticker';
import {
  FileText,
  CheckCircle2,
  BarChart3,
  Clock,
  Sparkles,
  Database,
  Calendar,
  Activity,
  XCircle,
  UserPlus,
  Upload,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { chartColors } from '@/lib/colors';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
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

// Skeleton Loader Component
const StatCardSkeleton = () => (
  <Card className="border-l-4 border-l-gray-300 h-full animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-start">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ height = 400 }: { height?: number }) => (
  <div className="animate-pulse" style={{ height }}>
    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevosUsuariosStats, setNuevosUsuariosStats] = useState<NuevosUsuariosStats | null>(null);
  const [corteData, setCorteData] = useState<CorteData | null>(null);
  const [historialCargas, setHistorialCargas] = useState<HistorialCarga[]>([]);
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [establishmentFilter, setEstablishmentFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch nuevos usuarios statistics
      const nuevosUsuariosRes = await fetch(`${API_URL}/api/nuevos-usuarios/estadisticas/`);
      if (nuevosUsuariosRes.ok) {
        const data = await nuevosUsuariosRes.json();
        setNuevosUsuariosStats(data);
      } else {
        throw new Error('Error al cargar estadísticas de nuevos usuarios');
      }

      // Fetch corte summary
      const corteRes = await fetch(`${API_URL}/api/corte-fonasa/?summary_only=true`);
      if (corteRes.ok) {
        const data = await corteRes.json();
        setCorteData(data);
      } else {
        throw new Error('Error al cargar datos de corte');
      }

      // Fetch historial cargas
      const historialRes = await fetch(`${API_URL}/api/historial-cargas/?limit=10`);
      if (historialRes.ok) {
        const data = await historialRes.json();
        setHistorialCargas(data);
      } else {
        throw new Error('Error al cargar historial de cargas');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    fetchData();
  };

  // Get last corte month data
  const lastCorteMonth = corteData?.summary?.[0];
  const totalUltimoCorte = lastCorteMonth?.total || 0;
  const validadosUltimoCorte = lastCorteMonth?.validated || 0;
  const noValidadosUltimoCorte = lastCorteMonth?.nonValidated || 0;
  const porRevisarUltimoCorte = totalUltimoCorte - validadosUltimoCorte - noValidadosUltimoCorte;

  // Stats configuration
  const stats = useMemo(() => [
    {
      title: 'Total Registrados',
      value: totalUltimoCorte,
      color: 'indigo',
      icon: Database,
      description: lastCorteMonth ? `${lastCorteMonth.label}` : 'Último corte',
      href: '/dashboard/subir-corte/gestion'
    },
    {
      title: 'Validados',
      value: validadosUltimoCorte,
      color: 'green',
      icon: CheckCircle2,
      description: lastCorteMonth ? `${lastCorteMonth.label}` : 'Último corte',
      href: '/dashboard/subir-corte/gestion'
    },
    {
      title: 'No Validados',
      value: noValidadosUltimoCorte,
      color: 'red',
      icon: XCircle,
      description: lastCorteMonth ? `${lastCorteMonth.label}` : 'Último corte',
      href: '/dashboard/subir-corte/gestion'
    },
    {
      title: 'Por Revisar',
      value: porRevisarUltimoCorte,
      color: 'yellow',
      icon: Clock,
      description: lastCorteMonth ? `${lastCorteMonth.label}` : 'Último corte',
      href: '/dashboard/subir-corte/gestion'
    },
  ], [totalUltimoCorte, validadosUltimoCorte, noValidadosUltimoCorte, porRevisarUltimoCorte, lastCorteMonth]);

  // Prepare chart data with memoization
  const corteChartData = useMemo(() => {
    if (!corteData?.summary) return [];
    
    const filteredSummary = corteData.summary.filter((item) => {
      if (!establishmentFilter) return true;
      // TODO: Implementar filtro por establecimiento cuando el backend lo soporte
      // Por ahora, el filtro no tiene efecto ya que no hay datos de establecimiento
      return true;
    });

    return filteredSummary
      .slice(0, selectedMonths === 999 ? undefined : selectedMonths)
      .reverse()
      .map(item => ({
        periodo: item.label,
        total: item.total
      }));
  }, [corteData?.summary, selectedMonths, establishmentFilter]);

  // Validation pie chart data - SOLO del último corte
  const validationPieData = useMemo(() => {
    return [
      { name: 'Validados', value: validadosUltimoCorte, color: chartColors.success },
      { name: 'No Validados', value: noValidadosUltimoCorte, color: chartColors.danger },
      { name: 'Por Revisar', value: porRevisarUltimoCorte, color: chartColors.warning }
    ].filter(item => item.value > 0);
  }, [validadosUltimoCorte, noValidadosUltimoCorte, porRevisarUltimoCorte]);

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

  // Sanitize user content
  const sanitizeText = (text: string) => {
    return text.replace(/[<>]/g, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
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
                <div className="flex items-center gap-3">
                  {nuevosUsuariosStats && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {nuevosUsuariosStats.mesActual.periodo}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </AnimatedCard>

        {/* Último Corte Section */}
        {lastCorteMonth && !loading && (
          <AnimatedCard delay={0.05}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Estadísticas del Último Corte
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Datos correspondientes a {lastCorteMonth.label}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {formatNumber(lastCorteMonth.total)} registros totales
              </Badge>
            </div>
          </AnimatedCard>
        )}

        {/* Stats Grid - 4 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 4 }).map((_, index) => (
              <AnimatedCard key={index} delay={0.1 + index * 0.1}>
                <StatCardSkeleton />
              </AnimatedCard>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <AnimatedCard key={stat.title} delay={0.1 + index * 0.1}>
                  <Link href={stat.href}>
                    <Card className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-start">
                          <div className={`p-2 rounded-lg ${
                            stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            stat.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                            stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                            stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-purple-100 dark:bg-purple-900/30'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                              stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                              stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                              stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                              stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                              'text-purple-600 dark:text-purple-400'
                            }`} />
                          </div>
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
            })
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Totales de Cortes Mensuales - Pantalla Completa */}
          <AnimatedCard delay={0.5}>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Totales de Cortes Mensuales
                    </CardTitle>
                    <CardDescription>
                      Últimos {selectedMonths === 999 ? 'todos los' : selectedMonths} meses - Total de registros por mes
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select 
                        value={selectedMonths.toString()} 
                        onValueChange={(value) => setSelectedMonths(Number(value))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Meses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 meses</SelectItem>
                          <SelectItem value="12">12 meses</SelectItem>
                          <SelectItem value="24">24 meses</SelectItem>
                          <SelectItem value="999">Todos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Filtrar por establecimiento..."
                      value={establishmentFilter}
                      onChange={(e) => setEstablishmentFilter(e.target.value)}
                      className="w-full sm:w-60"
                      disabled
                      title="Funcionalidad pendiente de implementación en el backend"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={400} />
                ) : corteChartData.length === 0 ? (
                  <div className="h-[400px] flex flex-col items-center justify-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No hay datos disponibles
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Los datos de cortes aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart 
                      data={corteChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                      <XAxis
                        dataKey="periodo"
                        className="text-xs"
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        formatter={(value: number | string) => [formatNumber(value), 'Total Registros']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={chartColors.primary}
                        strokeWidth={3}
                        name="Total Registros"
                        dot={{ fill: chartColors.primary, r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Second Row - Pie Chart */}
        <div className="grid grid-cols-1 gap-6">
          {/* Estado de Validación del Último Corte */}
          <AnimatedCard delay={0.6}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estado de Validación
                </CardTitle>
                <CardDescription>
                  {lastCorteMonth ? `Distribución ${lastCorteMonth.label}` : 'Último corte'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={300} />
                ) : validationPieData.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Activity className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No hay datos de validación disponibles
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={validationPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: { name?: string; value?: number }) => {
                          if (!props.value || !props.name) return '';
                          const total = validationPieData.reduce((sum, d) => sum + d.value, 0);
                          const percent = ((props.value / total) * 100).toFixed(0);
                          return `${props.name}: ${percent}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {validationPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | string) => formatNumber(value)}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Histórico de Cantidades Mensuales */}
        {corteData?.summary && corteData.summary.length > 0 && !loading && (
          <AnimatedCard delay={0.7}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico de Cantidades por Mes
                </CardTitle>
                <CardDescription>
                  Registros totales de cada corte mensual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {corteData.summary.map((item, index) => (
                    <div 
                      key={item.month}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === 0 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' 
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <p className={`text-xs font-medium mb-2 ${
                          index === 0 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.label}
                          {index === 0 && (
                            <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">
                              Actual
                            </Badge>
                          )}
                        </p>
                        <p className={`text-2xl font-bold ${
                          index === 0 
                            ? 'text-indigo-700 dark:text-indigo-300' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {formatNumber(item.total)}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          registros
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <div className="animate-pulse space-y-3 w-full">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      ))}
                    </div>
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
                  historialCargas.map((carga) => (
                    <div key={carga.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          carga.estado === 'EXITOSO' ? 'bg-green-500' :
                          carga.estado === 'ERROR' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} aria-label={`Estado: ${carga.estado}`}></div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {carga.tipo_carga === 'CORTE_FONASA' ? 'Corte FONASA' : 'HP Trakcare'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sanitizeText(carga.usuario)} - {formatNumber(carga.total_registros)} registros
                            {carga.validados !== undefined && ` (${formatNumber(carga.validados)} validados)`}
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