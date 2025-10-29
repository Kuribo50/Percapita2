'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Search, 
  Save,
  X,
  RefreshCw,
  Database,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';

import { EDITABLE_FIELDS, DatasetRecord, buildDetailUrl, buildEndpointUrl } from '../data';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

type Notification = {
  type: NotificationType;
  message: string;
} | null;

const NOTIFICATION_STYLES: Record<NotificationType, string> = {
  success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function TrakcarePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<DatasetRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [notification, setNotification] = useState<Notification>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<DatasetRecord | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const visibleColumns = useMemo(
    () => columns.filter((column) => column !== 'id'),
    [columns],
  );

  const fetchData = useCallback(
    async (pageValue: number, pageSizeValue: number) => {
      setIsLoading(true);
      try {
        const offset = (pageValue - 1) * pageSizeValue;
        const response = await fetch(
          buildEndpointUrl('trakcare', { params: { offset, limit: pageSizeValue } }),
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail ?? 'No se pudo obtener los registros.');
        }

        const fetchedColumns = Array.isArray(payload.columns) ? (payload.columns as string[]) : [];
        const fetchedRows = Array.isArray(payload.rows)
          ? (payload.rows as Array<Record<string, unknown>>).map((row) => ({
              ...row,
              id: Number((row as Record<string, unknown>).id ?? 0),
            }))
          : [];

        setColumns(fetchedColumns);
        setRows(fetchedRows as DatasetRecord[]);
        setTotal(Number(payload.total ?? fetchedRows.length));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cargar los registros.';
        setNotification({ type: 'error', message });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchData(page, pageSize);
  }, [fetchData, page, pageSize]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const handleOpenEditor = (record: DatasetRecord) => {
    setEditingRecord(record);
    const initialValues = EDITABLE_FIELDS.trakcare.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = String(record[field.key] ?? '');
      return acc;
    }, {});
    setFormValues(initialValues);
  };

  const handleSaveRecord = async () => {
    if (!editingRecord) return;

    setIsSavingRecord(true);
    const payload = Object.entries(formValues).reduce<Record<string, string | null>>(
      (acc, [key, value]) => {
        const trimmed = value.trim();
        acc[key] = trimmed === '' ? null : trimmed;
        return acc;
      },
      {},
    );

    try {
      const response = await fetch(buildDetailUrl('trakcare', editingRecord.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? 'No se pudo actualizar.');

      setNotification({ type: 'success', message: '✓ Registro actualizado correctamente' });
      setEditingRecord(null);
      setFormValues({});
      await fetchData(page, pageSize);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar.';
      setNotification({ type: 'error', message });
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleDeleteBase = async () => {
    const password = window.prompt(
      '⚠️ ATENCIÓN: Esta acción eliminará PERMANENTEMENTE toda la base de datos de Trakcare.\n\nEsta operación NO se puede deshacer.\n\nIngrese la contraseña de administrador para confirmar:'
    );

    if (!password?.trim()) {
      setNotification({ type: 'info', message: 'Operación cancelada.' });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(buildEndpointUrl('trakcare'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_password: password.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? 'No se pudo eliminar.');
      }

      setNotification({ type: 'success', message: '✓ Base eliminada correctamente' });
      setPage(1);
      await fetchData(1, pageSize);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar.';
      setNotification({ type: 'error', message });
    } finally {
      setIsDeleting(false);
    }
  };

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
            Gestión
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="font-semibold text-gray-900 dark:text-white">HP Trakcare</span>
        </nav>

        {/* Header Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">HP Trakcare</h1>
                  <p className="text-indigo-100 text-sm">
                    Base de datos histórica • {total.toLocaleString('es-CL')} pacientes
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void fetchData(page, pageSize)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all ring-1 ring-white/20"
                  title="Actualizar datos"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={() => void handleDeleteBase()}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar base'}
                </button>
                <Link
                  href="/dashboard/bases"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all ring-1 ring-white/20"
                >
                  Volver
                </Link>
              </div>
            </div>
          </div>

          {notification && (
            <div className={`m-6 rounded-xl border p-4 text-sm flex items-center gap-3 ${NOTIFICATION_STYLES[notification.type]}`}>
              {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
              {notification.type === 'warning' && <AlertCircle className="h-5 w-5 shrink-0" />}
              {notification.type === 'info' && <AlertCircle className="h-5 w-5 shrink-0" />}
              <span className="flex-1 font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Total Registros
              </p>
            </div>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {total.toLocaleString('es-CL')}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Página Actual
              </p>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {page} / {totalPages}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Registros en Página
              </p>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {rows.length}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">registros</span>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en tabla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Página {page} de {totalPages}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
                <Clock className="absolute inset-0 m-auto h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando registros...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      {visibleColumns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                      <th className="px-4 py-4 text-right font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider w-24">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={visibleColumns.length + 1}
                          className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          <Database className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                          <p className="font-medium">No hay registros disponibles</p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            editingRecord?.id === row.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          {visibleColumns.map((col) => (
                            <td
                              key={`${row.id}-${col}`}
                              className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs"
                            >
                              <span className="truncate block max-w-xs">{row[col] ?? '—'}</span>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleOpenEditor(row)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                              title="Editar registro"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {rows.length > 0
                    ? `Mostrando ${((page - 1) * pageSize + 1).toLocaleString('es-CL')} - ${((page - 1) * pageSize + rows.length).toLocaleString('es-CL')} de ${total.toLocaleString('es-CL')} registros`
                    : 'Sin registros'}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Edit2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Editar Registro</h2>
                      <p className="text-sm text-indigo-100">ID: #{editingRecord.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingRecord(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSaveRecord();
                }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EDITABLE_FIELDS.trakcare.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={formValues[key] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </form>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleSaveRecord()}
                    disabled={isSavingRecord}
                    className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    {isSavingRecord ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}