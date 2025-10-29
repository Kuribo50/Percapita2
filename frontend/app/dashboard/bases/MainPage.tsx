'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  ChevronRight, 
  Database, 
  Clock, 
  Upload, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';

import {
  DATASET_LABELS,
  DatasetKey,
  DatasetState,
  buildEndpointUrl,
  createDatasetState,
  parseSummaryEntries,
} from './data';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

type Notification = {
  type: NotificationType;
  message: string;
} | null;

const NOTIFICATION_STYLES: Record<NotificationType, string> = {
  success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200',
};

const SAMPLE_LIMIT = 10;

export default function MainPage() {
  const [notification, setNotification] = useState<Notification>(null);
  const [corteState, setCorteState] = useState<DatasetState>(createDatasetState);
  const [trakcareState, setTrakcareState] = useState<DatasetState>(createDatasetState);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedDataset, setExpandedDataset] = useState<DatasetKey | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshDataset = useCallback(
    async (dataset: DatasetKey) => {
      try {
        const response = await fetch(
          buildEndpointUrl(dataset, { params: { limit: SAMPLE_LIMIT, offset: 0 } }),
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail ?? `No se pudo obtener ${DATASET_LABELS[dataset]}.`);
        }

        const columns = Array.isArray(payload.columns) ? (payload.columns as string[]) : [];
        const rows = Array.isArray(payload.rows)
          ? (payload.rows as Array<Record<string, unknown>>)
          : [];
        const summary = parseSummaryEntries(dataset, payload.summary);
        const total = Number(payload.total ?? rows.length);
        const validated = dataset === 'corte' ? Number(payload.validated ?? 0) : 0;
        const nonValidated =
          dataset === 'corte'
            ? Number(payload.non_validated ?? payload.nonValidated ?? 0)
            : 0;

        const nextState: DatasetState = {
          columns,
          rows,
          total,
          validated,
          nonValidated,
          summary,
        };

        if (dataset === 'corte') {
          setCorteState(nextState);
        } else {
          setTrakcareState(nextState);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `Error al recuperar ${DATASET_LABELS[dataset]}.`;
        setNotification({ type: 'error', message });
      }
    },
    [],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshDataset('corte'), refreshDataset('trakcare')]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
    setNotification({ type: 'success', message: 'Datos actualizados correctamente' });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([refreshDataset('corte'), refreshDataset('trakcare')]);
      setIsLoading(false);
      setLastUpdate(new Date());
    };
    void loadData();
  }, [refreshDataset]);

  const corteMetrics = {
    loads: corteState.summary.length,
    validated: corteState.validated,
    nonValidated: corteState.nonValidated,
  };

  const trakcareMetrics = useMemo(() => {
    return {
      loads: trakcareState.summary.length,
      total: trakcareState.total,
    };
  }, [trakcareState.summary, trakcareState.total]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero Header */}
  <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm ring-1 ring-white/30">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Gestor de Bases de Datos</h1>
                  <p className="text-blue-100 text-base">
                    Administra y visualiza tus cargas de datos en tiempo real
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 flex items-center gap-2 ring-1 ring-white/20 hover:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
                <Link
                  href="/dashboard/configuracion"
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 flex items-center gap-2 ring-1 ring-white/20 hover:ring-white/30"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </Link>
                <Link
                  href="/dashboard/subir-corte"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 flex items-center gap-2 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  Nueva carga
                </Link>
              </div>
            </div>

            {/* Last Update Info */}
            <div className="mt-6 flex items-center gap-2 text-sm text-blue-100">
              <Clock className="w-4 h-4" />
              <span>Última actualización: {lastUpdate.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`rounded-xl border p-4 text-sm flex items-center gap-3 shadow-sm ${NOTIFICATION_STYLES[notification.type]}`}>
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="flex-1 font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="shrink-0 hover:opacity-70 transition-opacity p-1 rounded-lg hover:bg-black/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <Database className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando bases de datos...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Corte FONASA Card */}
            <DatabaseCard
              title="Corte FONASA"
              description="Base de datos mensual de beneficiarios"
              icon={<Database className="h-6 w-6" />}
              color="blue"
              stats={[
                { 
                  label: 'Cargas mensuales', 
                  value: corteMetrics.loads, 
                  icon: <Calendar className="h-4 w-4" />,
                  color: 'text-blue-600 dark:text-blue-400'
                },
                { 
                  label: 'Validaciones', 
                  value: corteMetrics.validated, 
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  color: 'text-green-600 dark:text-green-400'
                },
                { 
                  label: 'Observaciones', 
                  value: corteMetrics.nonValidated, 
                  icon: <AlertCircle className="h-4 w-4" />,
                  color: 'text-red-600 dark:text-red-400'
                },
                { 
                  label: 'Total registros', 
                  value: corteState.total, 
                  icon: <BarChart3 className="h-4 w-4" />,
                  color: 'text-gray-600 dark:text-gray-400'
                },
              ]}
              isExpanded={expandedDataset === 'corte'}
              onToggle={() => setExpandedDataset(expandedDataset === 'corte' ? null : 'corte')}
              detailLink="/dashboard/subir-corte/gestion"
              detailText="Ver cortes por mes"
            >
              {corteState.summary.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Últimas cargas
                    </p>
                    <Link
                      href="/dashboard/subir-corte/gestion"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Ver todas
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {corteState.summary.slice(0, 4).map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-3 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {entry.label}
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 font-medium">
                                <CheckCircle2 className="h-3 w-3" />
                                {(entry.validated ?? 0).toLocaleString('es-CL')}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 font-medium">
                                <AlertCircle className="h-3 w-3" />
                                {(entry.nonValidated ?? 0).toLocaleString('es-CL')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {entry.total.toLocaleString('es-CL')} registros
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DatabaseCard>

            {/* Trakcare Card */}
            <DatabaseCard
              title="Histórico Trakcare"
              description="Base de datos completa de pacientes"
              icon={<Clock className="h-6 w-6" />}
              color="indigo"
              stats={[
                { 
                  label: 'Cargas históricas', 
                  value: trakcareMetrics.loads, 
                  icon: <Upload className="h-4 w-4" />,
                  color: 'text-indigo-600 dark:text-indigo-400'
                },
                { 
                  label: 'Total pacientes', 
                  value: trakcareMetrics.total, 
                  icon: <TrendingUp className="h-4 w-4" />,
                  color: 'text-purple-600 dark:text-purple-400'
                },
              ]}
              isExpanded={expandedDataset === 'trakcare'}
              onToggle={() => setExpandedDataset(expandedDataset === 'trakcare' ? null : 'trakcare')}
              detailLink="/dashboard/bases/trakcare"
              detailText="Ver todos los registros"
              isDangerous
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/subir-corte"
            className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Subir archivo</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carga nuevos datos de Corte FONASA o Trakcare
            </p>
          </Link>

          <Link
            href="/dashboard/subir-corte/gestion"
            className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg transition-all hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Ver reportes</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consulta estadísticas y análisis de datos
            </p>
          </Link>

          <Link
            href="/dashboard/configuracion"
            className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Configuración</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administra usuarios y permisos del sistema
            </p>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

interface DatabaseCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'indigo';
  stats: Array<{ 
    label: string; 
    value: number; 
    icon: React.ReactNode;
    color: string;
  }>;
  isExpanded: boolean;
  onToggle: () => void;
  detailLink: string;
  detailText: string;
  children?: React.ReactNode;
  isDangerous?: boolean;
}

function DatabaseCard({
  title,
  description,
  icon,
  color,
  stats,
  isExpanded,
  onToggle,
  detailLink,
  detailText,
  children,
  isDangerous = false,
}: DatabaseCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      hover: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      hover: 'group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    },
  };

  const colors = isDangerous ? colorClasses.indigo : colorClasses[color];

  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg transition-all ${colors.border}`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group rounded-t-2xl"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.hover} transition-colors`}>
            <div className={colors.text}>{icon}</div>
          </div>
          <div className="text-left">
            <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${colors.text} transition-colors`}>
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          </div>
        </div>
        <ChevronRight
          className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Stats Grid */}
  <div className="border-t border-gray-100 dark:border-gray-800 bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={stat.color}>{stat.icon}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
                  {stat.label}
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString('es-CL')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
          {children}
          <div className="flex gap-3 mt-6">
            <Link
              href={detailLink}
              className={`flex-1 rounded-xl ${colors.bg} px-6 py-3 text-sm font-semibold ${colors.text} transition-all hover:shadow-lg flex items-center justify-center gap-2`}
            >
              <BarChart3 className="w-4 h-4" />
              {detailText}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}