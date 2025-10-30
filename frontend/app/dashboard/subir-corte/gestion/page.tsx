'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Database,
  FileText,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  BarChart3,
  Info,
  CheckCheck,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AnimatedCard } from '@/components/magicui/animated-card';
import NumberTicker from '@/components/magicui/number-ticker';
import { ShineBorder } from '@/components/magicui/shine-border';

type CorteMensual = {
  month: string;
  label: string;
  total: number;
  validated: number;
  nonValidated: number;
  year: number;
  monthNumber: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type SortField = 'fecha' | 'total' | 'validated' | 'nonValidated';
type SortOrder = 'asc' | 'desc';

export default function GestionCortesPage() {
  const [cortes, setCortes] = useState<CorteMensual[]>([]);
  const [filteredCortes, setFilteredCortes] = useState<CorteMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const mostrarMensaje = (msg: string, esError = false) => {
    if (esError) {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } else {
      setMensaje(msg);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const cargarCortes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/corte-fonasa/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extraer los cortes del summary
      const cortesData: CorteMensual[] = (data.summary || []).map((item: any) => {
        const [year, month] = item.month.split('-').map(Number);
        return {
          month: item.month,
          label: item.label,
          total: item.total || 0,
          validated: item.validated || 0,
          nonValidated: item.nonValidated || item.non_validated || 0,
          year,
          monthNumber: month,
        };
      });

      setCortes(cortesData);
      setFilteredCortes(cortesData);
    } catch (error) {
      console.error('Error al cargar cortes:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      mostrarMensaje(`Error al cargar los cortes: ${errorMsg}`, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCortes();
  }, []);

  // Filtrar y ordenar cortes
  useEffect(() => {
    let result = [...cortes];

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(corte =>
        corte.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        corte.month.includes(searchTerm)
      );
    }

    // Filtrar por año
    if (selectedYear !== 'all') {
      result = result.filter(corte => corte.year === parseInt(selectedYear));
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'fecha':
          if (a.year !== b.year) {
            comparison = a.year - b.year;
          } else {
            comparison = a.monthNumber - b.monthNumber;
          }
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'validated':
          comparison = a.validated - b.validated;
          break;
        case 'nonValidated':
          comparison = a.nonValidated - b.nonValidated;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCortes(result);
  }, [cortes, searchTerm, selectedYear, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const eliminarCorte = async (month: string, label: string) => {
    const confirmed = window.confirm(
      `⚠️ ATENCIÓN: Esta acción eliminará PERMANENTEMENTE todos los registros de ${label}.\n\nEsta operación NO se puede deshacer.\n\n¿Deseas continuar?`
    );
    
    if (!confirmed) return;

    const password = prompt('Ingresa la contraseña de administrador para confirmar:');
    if (!password) {
      mostrarMensaje('Operación cancelada', false);
      return;
    }

    setEliminando(month);
    try {
      const response = await fetch(`${API_URL}/api/corte-fonasa/?month=${month}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_password: password }),
      });

      if (response.ok) {
        await cargarCortes();
        mostrarMensaje(`✓ Corte de ${label} eliminado correctamente`);
      } else {
        const errorData = await response.json();
        mostrarMensaje(errorData.detail || 'Error al eliminar el corte', true);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarMensaje('Error de conexión', true);
    } finally {
      setEliminando(null);
    }
  };

  const calcularPorcentaje = (parte: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((parte / total) * 100);
  };

  const availableYears = Array.from(new Set(cortes.map(c => c.year))).sort((a, b) => b - a);

  const totalRegistros = cortes.reduce((sum, c) => sum + c.total, 0);
  const totalValidados = cortes.reduce((sum, c) => sum + c.validated, 0);
  const totalNoValidados = cortes.reduce((sum, c) => sum + c.nonValidated, 0);
  const tasaValidacionGlobal = totalRegistros > 0 ? ((totalValidados / totalRegistros) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/bases"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Bases de datos
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="font-semibold text-gray-900 dark:text-white">Gestión de Cortes FONASA</span>
        </nav>

        {/* Header Premium */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm ring-1 ring-white/30">
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Gestión de Cortes FONASA</h1>
                  <p className="text-blue-100">
                    Visualiza y administra los cortes mensuales cargados en el sistema
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cargarCortes}
                  disabled={loading}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 flex items-center gap-2 ring-1 ring-white/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <Link
                  href="/dashboard/bases"
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 flex items-center gap-2 ring-1 ring-white/20"
                >
                  <Database className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/subir-corte"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 flex items-center gap-2 shadow-lg"
                >
                  <FileText className="w-4 h-4" />
                  Subir nuevo corte
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-green-800 dark:text-green-200 font-medium">{mensaje}</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400" />
              <Calendar className="absolute inset-0 m-auto h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Cargando cortes mensuales...</p>
          </div>
        ) : cortes.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No hay cortes cargados
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comienza subiendo tu primer corte mensual de FONASA
                </p>
              </div>
              <Link
                href="/dashboard/subir-corte"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5" />
                Subir primer corte
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedCard delay={0}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="secondary">Períodos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-bold mb-1">
                      <NumberTicker value={cortes.length} />
                    </CardTitle>
                    <CardDescription>Total de períodos cargados</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.1}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Database className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <Badge variant="secondary">Registros</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-bold mb-1">
                      <NumberTicker value={totalRegistros} />
                    </CardTitle>
                    <CardDescription>Total de registros en el sistema</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <Card className="border-green-200 dark:border-green-900/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <CheckCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge variant="success">Validados</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      <NumberTicker value={totalValidados} />
                    </CardTitle>
                    <CardDescription>Registros validados correctamente</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge variant="outline">Métrica</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {tasaValidacionGlobal}%
                    </CardTitle>
                    <CardDescription>Tasa global de validación</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por período o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filtro por año */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos los años</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Ordenamiento */}
                <button
                  onClick={() => toggleSort('fecha')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Ordenar</span>
                </button>
              </div>

              {/* Resultados */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredCortes.length}</span> de{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{cortes.length}</span> cortes
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Cortes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cortes Mensuales</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona y visualiza los períodos cargados
                </p>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCortes.length === 0 ? (
                  <div className="p-12 text-center">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      No se encontraron cortes con los filtros aplicados
                    </p>
                  </div>
                ) : (
                  filteredCortes.map((corte, index) => {
                    const porcentajeValidado = calcularPorcentaje(corte.validated, corte.total);
                    const porcentajeError = calcularPorcentaje(corte.nonValidated, corte.total);
                    const tasaValidacion = porcentajeValidado;

                    return (
                      <AnimatedCard key={corte.month} delay={index * 0.05}>
                        <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Información del corte */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/20 p-3">
                                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {corte.label}
                                    </h3>
                                    {tasaValidacion >= 95 ? (
                                      <Badge variant="success" className="flex items-center gap-1">
                                        <CheckCheck className="h-3 w-3" />
                                        Excelente
                                      </Badge>
                                    ) : tasaValidacion >= 80 ? (
                                      <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
                                        <CheckCircle className="h-3 w-3" />
                                        Bueno
                                      </Badge>
                                    ) : tasaValidacion >= 60 ? (
                                      <Badge variant="warning" className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Regular
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive" className="flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Bajo
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Código: <span className="font-mono font-semibold">{corte.month}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Estadísticas Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total */}
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                    <Database className="h-3.5 w-3.5" />
                                    Total Registros
                                  </p>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {corte.total.toLocaleString('es-CL')}
                                  </p>
                                </div>

                                {/* Validados */}
                                <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
                                  <CardContent className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-1.5">
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        Validados
                                      </p>
                                      <Badge variant="success" className="text-xs">
                                        {porcentajeValidado}%
                                      </Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                      {corte.validated.toLocaleString('es-CL')}
                                    </p>
                                    <Progress value={porcentajeValidado} className="h-2 bg-green-100 dark:bg-green-950">
                                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all" />
                                    </Progress>
                                  </CardContent>
                                </Card>

                                {/* No Validados */}
                                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                                  <CardContent className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                                        <XCircle className="h-3.5 w-3.5" />
                                        No Validados
                                      </p>
                                      <Badge variant="destructive" className="text-xs">
                                        {porcentajeError}%
                                      </Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                      {corte.nonValidated.toLocaleString('es-CL')}
                                    </p>
                                    <Progress value={porcentajeError} className="h-2 bg-red-100 dark:bg-red-950">
                                      <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all" />
                                    </Progress>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex lg:flex-col gap-2">
                              <Button asChild variant="outline" className="flex-1 lg:flex-none">
                                <Link href={`/dashboard/bases/corte/${corte.month}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </Link>
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => eliminarCorte(corte.month, corte.label)}
                                disabled={eliminando === corte.month}
                                className="flex-1 lg:flex-none"
                              >
                                {eliminando === corte.month ? (
                                  <>
                                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Eliminando...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}   