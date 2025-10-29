'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { read, utils } from 'xlsx';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  X,
  Loader2,
  Eye,
  AlertTriangle,
  Calendar,
  Database,
  TrendingUp,
  User,
  Clock,
  RefreshCw,
  Plus,
  Edit,
  Layers,
  Minus,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AnimatedCard } from '@/components/magicui/animated-card';
import NumberTicker from '@/components/magicui/number-ticker';

type DatasetKey = 'corte' | 'trakcare';

interface UploadState {
  file: File | null;
  progress: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  error: string | null;
  uploaded: boolean;
  total: number;
  monthDetected?: string;
  dateDetected?: string;
  created?: number;
  updated?: number;
  invalid?: number;
}

interface UploadHistoryItem {
  id: number;
  tipoCarga: string;
  tipoCargaDisplay: string;
  nombreArchivo: string;
  usuario: string;
  fechaCarga: string;
  periodoMes?: number;
  periodoAnio?: number;
  periodoStr: string;
  fechaCorte?: string;
  totalRegistros: number;
  registrosCreados: number;
  registrosActualizados: number;
  registrosInvalidos: number;
  validados: number;
  noValidados: number;
  totalPeriodo: number;
  estado: string;
  estadoDisplay: string;
  reemplazo: boolean;
  observaciones?: string;
  tasaExito: number;
  tiempoProcesamiento?: number;
}

interface HistoryFilters {
  usuario: string;
  periodo: string;
  tipo: 'all' | 'corte' | 'trakcare';
}

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface UploadOverlayState {
  dataset: DatasetKey;
  progress: number;
  etaSeconds: number;
  totalRows: number;
  startedAt: number;
  estimatedMs: number;
  currentPhase: 'uploading' | 'processing' | 'finalizing';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

const UPLOAD_ENDPOINTS: Record<DatasetKey, string> = {
  corte: '/api/corte-fonasa/',
  trakcare: '/api/hp-trakcare/',
};

const EXPECTED_COLUMNS = {
  corte: [
    'run',
    'nombres',
    'apPaterno',
    'apMaterno',
    'fechaNacimiento',
    'genero',
    'tramo',
    'fehcaCorte',
    'codGenero',
    'nombreCentro',
    'motivo',
  ],
  trakcare: [
    'codFamilia',
    'relacionParentezco',
    'idTrakcare',
    'etnia',
    'codRegistro',
    'nacionalidad',
    'RUN',
    'apPaterno',
    'apMaterno',
    'nombre',
    'genero',
    'fechaNacimiento',
    'edad',
    'direccion',
    'telefono',
    'telefonoCelular',
    'TelefonoRecado',
    'servicioSalud',
    'centroInscripcion',
    'sector',
    'prevision',
    'planTrakcare',
    'praisTrakcare',
    'fechaIncorporacion',
    'fechaUltimaModif',
    'fechaDefuncion',
  ],
} as const;

const DATASET_LABELS: Record<DatasetKey, string> = {
  corte: 'Corte FONASA',
  trakcare: 'HP Trakcare',
};

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const createUploadState = (): UploadState => ({
  file: null,
  progress: 0,
  columns: [],
  rows: [],
  error: null,
  uploaded: false,
  total: 0,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const computeEstimatedMs = (rows: number) => Math.min(25000, Math.max(5000, rows * 30 + 4000));

const formatRunChilean = (run: string): string => {
  if (!run) return '';
  
  // Limpiar el RUN: mantener solo dígitos, K y guiones
  const cleaned = String(run).trim().toUpperCase().replace(/[^0-9K-]/g, '');
  if (!cleaned) return '';
  
  // Si ya tiene guion, retornarlo tal cual (ya está bien formateado)
  if (cleaned.includes('-')) {
    return cleaned;
  }
  
  // Si no tiene guion, separar el cuerpo del dígito verificador
  // El DV es el último caracter (puede ser número o K)
  const dv = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);
  
  // Validar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) {
    return cleaned; // Retornar sin cambios si no es válido
  }
  
  // Retornar con guion
  return `${body}-${dv}`;
};

const extractDateFromRows = (
  rows: Array<Record<string, unknown>>
): { month?: string; date?: string } => {
  if (rows.length === 0) return {};

  // Buscar en la primera fila
  const firstRow = rows[0];
  
  // Intentar diferentes nombres de columna
  const possibleDateFields = ['fehcaCorte', 'fechaCorte', 'fecha_corte', 'fecha'];
  let fechaCorteValue: unknown = null;
  
  for (const field of possibleDateFields) {
    if (firstRow?.[field]) {
      fechaCorteValue = firstRow[field];
      break;
    }
  }

  if (!fechaCorteValue) {
    // Si no encontramos la fecha en las columnas, buscar en todas las columnas de fecha
    const dateValue = Object.entries(firstRow).find(([key, value]) => {
      const keyLower = key.toLowerCase();
      return (keyLower.includes('fecha') || keyLower.includes('date')) && value;
    })?.[1];
    
    if (dateValue) {
      fechaCorteValue = dateValue;
    } else {
      return {};
    }
  }

  const dateStr = String(fechaCorteValue).trim();

  try {
    let date: Date | null = null;

    // Formato: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dateStr.split('T')[0]);
    }
    // Formato: DD/MM/YYYY
    else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      const [day, month, year] = dateStr.split('/');
      date = new Date(Number(year), Number(month) - 1, Number(day));
    }
    // Formato: YYYY/MM/DD
    else if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}/)) {
      const [year, month, day] = dateStr.split('/');
      date = new Date(Number(year), Number(month) - 1, Number(day));
    }
    // Formato: DD-MM-YYYY
    else if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) {
      const [day, month, year] = dateStr.split('-');
      date = new Date(Number(year), Number(month) - 1, Number(day));
    }
    // Intentar parsear directamente
    else {
      date = new Date(dateStr);
    }

    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const day = date.getDate();
      
      const formattedDate = `${String(day).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`;

      return {
        month: `${MONTHS[monthIndex]} ${year}`,
        date: formattedDate,
      };
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return {};
  }

  return {};
};

const sanitizeDatasetRows = (rows: Array<Record<string, unknown>>) => {
  return rows.map((row) => {
    const nextRow = { ...row } as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(nextRow, 'run')) {
      nextRow.run = formatRunChilean(String(nextRow.run ?? ''));
    }
    if (Object.prototype.hasOwnProperty.call(nextRow, 'RUN')) {
      nextRow.RUN = formatRunChilean(String(nextRow.RUN ?? ''));
    }
    return nextRow;
  });
};

function ToastNotification({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: (id: string) => void;
}) {
  const icons: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Zap className="h-5 w-5" />,
  };

  const colors: Record<NotificationType, string> = {
    success:
      'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200',
    error:
      'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200',
    warning:
      'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200',
  };

  const iconColors: Record<NotificationType, string> = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-right transition-all ${colors[notification.type]}`}
    >
      <div className={iconColors[notification.type]}>{icons[notification.type]}</div>
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button
        onClick={() => onClose(notification.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function SubirCortePage() {
  const { user } = useAuth();
  const [corteState, setCorteState] = useState<UploadState>(createUploadState);
  const [trakcareState, setTrakcareState] = useState<UploadState>(createUploadState);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadOverlayState | null>(null);
  const [replaceCorte, setReplaceCorte] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DatasetKey>('corte');
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    usuario: '',
    periodo: '',
    tipo: 'all',
  });
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const corteHistory = useMemo(
    () => uploadHistory.filter((item) => item.tipoCarga === 'CORTE_FONASA'),
    [uploadHistory],
  );
  const corteHistoryTotals = useMemo(() => {
    return corteHistory.reduce(
      (acc, item) => {
        acc.validated += item.validados;
  acc.nonValidated += item.noValidados;
  acc.total += item.totalPeriodo ?? item.totalRegistros;
        return acc;
      },
      { validated: 0, nonValidated: 0, total: 0 },
    );
  }, [corteHistory]);
  const latestCorteLoads = useMemo(() => corteHistory.slice(0, 5), [corteHistory]);

  const cargarHistorial = useCallback(async (filters: HistoryFilters) => {
    try {
      setHistoryLoading(true);
      const url = new URL(`${API_BASE_URL}/api/historial-cargas/`);
      url.searchParams.set('limit', '50');

      if (filters.usuario.trim()) {
        url.searchParams.set('usuario', filters.usuario.trim());
      }

      if (filters.periodo) {
        url.searchParams.set('periodo', filters.periodo);
      }

      if (filters.tipo === 'corte') {
        url.searchParams.set('tipo', 'CORTE_FONASA');
      } else if (filters.tipo === 'trakcare') {
        url.searchParams.set('tipo', 'HP_TRAKCARE');
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setUploadHistory(data);
      } else {
        console.error('Error cargando historial:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      void cargarHistorial(historyFilters);
    }, 350);

    return () => {
      window.clearTimeout(handler);
    };
  }, [cargarHistorial, historyFilters]);

  const handleHistoryFilterChange = (field: keyof HistoryFilters, value: string) => {
    setHistoryFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetHistoryFilters = () => {
    setHistoryFilters({ usuario: '', periodo: '', tipo: 'all' });
  };

  const guardarHistorial = async (
    tipoCarga: 'CORTE_FONASA' | 'HP_TRAKCARE',
    nombreArchivo: string,
    periodoMes: number | null,
    periodoAnio: number | null,
    fechaCorte: string | null,
    totalRegistros: number,
    registrosCreados: number,
    registrosActualizados: number,
    registrosInvalidos: number,
    reemplazo: boolean,
    tiempoProcesamiento: number
  ) => {
    try {
      const estado = registrosInvalidos > 0 ? 'PARCIAL' : 'EXITOSO';
      
      const response = await fetch(`${API_BASE_URL}/api/historial-cargas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_carga: tipoCarga,
          nombre_archivo: nombreArchivo,
          usuario: user ? `${user.nombre} ${user.apellido}` : 'Anónimo',
          periodo_mes: periodoMes,
          periodo_anio: periodoAnio,
          fecha_corte: fechaCorte,
          total_registros: totalRegistros,
          registros_creados: registrosCreados,
          registros_actualizados: registrosActualizados,
          registros_invalidos: registrosInvalidos,
          estado,
          reemplazo,
          tiempo_procesamiento: tiempoProcesamiento,
        }),
      });

      if (response.ok) {
        await cargarHistorial(historyFilters); // Recargar historial conservando filtros
      } else {
        const errorData = await response.text();
        console.error('Error guardando historial:', response.statusText, errorData);
        addNotification('error', 'No se pudo guardar el historial de carga');
      }
    } catch (error) {
      console.error('Error guardando historial:', error);
      addNotification('error', 'Error al guardar el historial de carga');
    }
  };

  const addNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    const notification: Notification = { id, type, message, duration: 5000 };
    setNotifications((prev) => [...prev, notification]);

    if (notification.duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, notification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const buildEndpointUrl = useCallback(
    (dataset: DatasetKey, params?: Record<string, unknown>) => {
      const url = new URL(UPLOAD_ENDPOINTS[dataset], API_BASE_URL);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined) return;
          if (typeof value === 'boolean') {
            url.searchParams.set(key, value ? 'true' : 'false');
            return;
          }
          url.searchParams.set(key, String(value));
        });
      }
      return url.toString();
    },
    []
  );

  const parseCsv = (text: string) => {
    const parsed: Papa.ParseResult<Record<string, unknown>> = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    const columns = (parsed.meta.fields ?? []).map((field: string) => field.trim());
    const rows = parsed.data.filter((row: Record<string, unknown>) =>
      Object.values(row).some((value) => `${value ?? ''}`.trim() !== '')
    );

    return { columns, rows };
  };

  const parseExcel = (buffer: ArrayBuffer) => {
    const workbook = read(new Uint8Array(buffer), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const headerMatrix = utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      blankrows: false,
    });
    const headerRow = (headerMatrix[0] ?? []).map((header) => String(header ?? '').trim());

    const rows = utils
      .sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
        blankrows: false,
      })
      .filter((row) => Object.values(row).some((value) => `${value ?? ''}`.trim() !== ''));

    return { columns: headerRow, rows };
  };

  const validateColumns = (dataset: DatasetKey, columns: string[]) => {
    const required = [...EXPECTED_COLUMNS[dataset]];
    const missing = required.filter((col) => !columns.includes(col));
    return missing.length === 0
      ? { isValid: true, message: '' }
      : { isValid: false, message: `Faltan columnas: ${missing.join(', ')}` };
  };

  const getUploadState = (dataset: DatasetKey) => (dataset === 'corte' ? corteState : trakcareState);
  const setUploadState = (dataset: DatasetKey, state: UploadState) => {
    if (dataset === 'corte') setCorteState(state);
    else setTrakcareState(state);
  };

  const handleFileChange = (dataset: DatasetKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addNotification('info', `Procesando ${DATASET_LABELS[dataset]}…`);
    setUploadState(dataset, { ...createUploadState(), file, progress: 5 });

    const reader = new FileReader();

    reader.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadState(dataset, { ...getUploadState(dataset), progress: Math.min(percent, 99) });
      }
    };

    reader.onerror = () => {
      addNotification('error', 'No se pudo leer el archivo.');
      const state = getUploadState(dataset);
      setUploadState(dataset, { ...state, error: 'Error al leer el archivo', progress: 0 });
    };

    reader.onload = () => {
      try {
        let columns: string[] = [];
        let rows: Array<Record<string, unknown>> = [];
        const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        const isExcel =
          file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

        if (isCsv) {
          const text = String(reader.result ?? '');
          ({ columns, rows } = parseCsv(text));
        } else if (isExcel) {
          const buffer = reader.result as ArrayBuffer;
          ({ columns, rows } = parseExcel(buffer));
        } else {
          throw new Error('Formato no soportado.');
        }

        const sanitizedRows = sanitizeDatasetRows(rows);
        const validation = validateColumns(dataset, columns);

        if (!validation.isValid) {
          addNotification('error', validation.message);
          setUploadState(dataset, {
            ...createUploadState(),
            file,
            columns,
            rows: sanitizedRows,
            progress: 100,
            error: validation.message,
            total: sanitizedRows.length,
          });
          return;
        }

        const { month, date } = extractDateFromRows(sanitizedRows);

        setUploadState(dataset, {
          ...createUploadState(),
          file,
          columns,
          rows: sanitizedRows,
          progress: 100,
          total: sanitizedRows.length,
          monthDetected: month,
          dateDetected: date,
        });

        addNotification(
          'success',
          month
            ? `✓ ${sanitizedRows.length.toLocaleString('es-CL')} registros • ${month}`
            : `✓ ${sanitizedRows.length.toLocaleString('es-CL')} registros`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error procesando archivo.';
        addNotification('error', message);
        const state = getUploadState(dataset);
        setUploadState(dataset, { ...state, error: message, progress: 0 });
      }
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'utf-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const sendDatasetToApi = async (
    dataset: DatasetKey
  ): Promise<{ created: number; updated: number; invalid: number; total: number }> => {
    const state = getUploadState(dataset);
    const params: Record<string, unknown> = {};
    if (dataset === 'corte' && replaceCorte) params.replace = true;

    const response = await fetch(buildEndpointUrl(dataset, params), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: state.rows }),
    });

    let payload: Record<string, unknown> = {};
    try {
      payload = await response.json();
    } catch {}

    if (!response.ok) {
      throw new Error((payload?.detail as string) ?? 'Error cargando datos.');
    }

    return {
      created: Number(payload?.created ?? 0),
      updated: Number(payload?.updated ?? 0),
      invalid: Number(payload?.invalid ?? 0),
      total: Number(payload?.total ?? state.rows.length),
    };
  };

  const uploadDataset = async (dataset: DatasetKey) => {
    const state = getUploadState(dataset);
    const estimatedMs = computeEstimatedMs(state.rows.length);
    const startedAt = Date.now();

    setUploadProgress({
      dataset,
      progress: 0,
      etaSeconds: Math.ceil(estimatedMs / 1000),
      totalRows: state.rows.length,
      startedAt,
      estimatedMs,
      currentPhase: 'uploading',
    });

    const interval = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev.dataset !== dataset) {
          window.clearInterval(interval);
          return prev;
        }

        const elapsed = Date.now() - startedAt;
  const projected = Math.min(90, Math.round((elapsed / estimatedMs) * 100));
        const etaSeconds = Math.max(Math.ceil((estimatedMs - elapsed) / 1000), 0);

        let currentPhase: UploadOverlayState['currentPhase'] = 'uploading';
        if (projected > 30 && projected < 70) {
          currentPhase = 'processing';
        } else if (projected >= 70) {
          currentPhase = 'finalizing';
        }

        return {
          ...prev,
          progress: Math.max(prev.progress, projected),
          etaSeconds,
          currentPhase,
        };
      });
    }, 300);

    try {
      const payload = await sendDatasetToApi(dataset);
      window.clearInterval(interval);

      setUploadProgress((prev) =>
        prev && prev.dataset === dataset
          ? { ...prev, progress: 100, etaSeconds: 0, currentPhase: 'finalizing' }
          : prev
      );

      const currentState = getUploadState(dataset);
      const tiempoProcesamiento = (Date.now() - startedAt) / 1000; // en segundos

      // Extraer mes y año del periodo detectado
      let periodoMes: number | null = null;
      let periodoAnio: number | null = null;
      let fechaCorteStr: string | null = null;

      if (currentState.monthDetected && dataset === 'corte') {
        // currentState.monthDetected viene en formato "Octubre 2024"
        const partes = currentState.monthDetected.split(' ');
        if (partes.length === 2) {
          const mes = MONTHS.indexOf(partes[0]);
          periodoMes = mes >= 0 ? mes + 1 : null;
          periodoAnio = parseInt(partes[1], 10);
        }
        // Convertir dateDetected de DD/MM/YYYY a YYYY-MM-DD
        if (currentState.dateDetected) {
          const [dia, mes, anio] = currentState.dateDetected.split('/');
          fechaCorteStr = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        } else {
          fechaCorteStr = new Date().toISOString().split('T')[0];
        }
      }

      // Guardar en el historial
      await guardarHistorial(
        dataset === 'corte' ? 'CORTE_FONASA' : 'HP_TRAKCARE',
        currentState.file?.name || 'archivo.xlsx',
        periodoMes,
        periodoAnio,
        fechaCorteStr,
        payload.total,
        payload.created,
        payload.updated,
        payload.invalid,
        replaceCorte,
        tiempoProcesamiento
      );

      // Limpiar el estado DESPUÉS de agregar al historial
      setUploadState(dataset, createUploadState());

      await wait(800);
      setUploadProgress(null);

      addNotification(
        payload.invalid > 0 ? 'warning' : 'success',
        payload.invalid > 0
          ? `✓ ${payload.created} nuevos, ${payload.updated} actualizados • ⚠️ ${payload.invalid} errores`
          : `✓ ${payload.created} nuevos, ${payload.updated} actualizados`
      );
    } catch (error) {
      window.clearInterval(interval);
      setUploadProgress(null);
      addNotification('error', error instanceof Error ? error.message : 'Error subiendo datos.');
      throw error;
    }
  };

  const handleUpload = async () => {
    if (uploadProgress && uploadProgress.progress < 100) {
      addNotification('info', 'Espera a que finalice la carga en curso.');
      return;
    }

    const state = getUploadState(activeTab);

    if (state.total === 0) {
      addNotification('error', 'Selecciona un archivo.');
      return;
    }

    if (state.error) {
      addNotification('error', 'Corrige las columnas.');
      return;
    }

    try {
      await uploadDataset(activeTab);
    } catch {
      // Error ya notificado
    }
  };

  const isUploading = uploadProgress !== null;
  const currentState = getUploadState(activeTab);

  // Obtener primeros 7 registros para preview
  const previewRows = currentState.rows.slice(0, 7);
  const previewColumns = currentState.columns.slice(0, 6); // Mostrar máximo 6 columnas

  return (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Upload Modal - MEJORADO */}
      {uploadProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Database className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center">
                Cargando {DATASET_LABELS[uploadProgress.dataset]}
              </h3>
              <p className="text-blue-100 text-center mt-2 text-sm">
                {uploadProgress.totalRows.toLocaleString('es-CL')} registros en proceso
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Fase actual */}
              <div className="flex items-center justify-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadProgress.currentPhase === 'uploading' && (
                  <>
                    <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Enviando datos...</span>
                  </>
                )}
                {uploadProgress.currentPhase === 'processing' && (
                  <>
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span>Procesando registros...</span>
                  </>
                )}
                {uploadProgress.currentPhase === 'finalizing' && (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span>Finalizando...</span>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Progreso</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    {uploadProgress.progress}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${uploadProgress.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {uploadProgress.progress >= 100 ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Completado
                      </span>
                    ) : (
                      `Tiempo estimado: ${uploadProgress.etaSeconds}s`
                    )}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {uploadProgress.totalRows.toLocaleString('es-CL')} registros
                  </span>
                </div>
              </div>

              {/* Info adicional */}
              {uploadProgress.progress < 100 && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    No cierres esta ventana mientras se procesa la carga
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-6 right-6 z-30 space-y-3 w-full max-w-sm">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Subir Cortes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Carga de archivos de Corte Mensual e Histórico de Pacientes
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {new Date().toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Upload Section with Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {(['corte', 'trakcare'] as DatasetKey[]).map((dataset) => (
              <button
                key={dataset}
                onClick={() => setActiveTab(dataset)}
                disabled={isUploading}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === dataset
                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                {DATASET_LABELS[dataset]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sección de carga */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Cargar Nuevo Archivo
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Seleccione un archivo CSV o Excel con los datos del {DATASET_LABELS[activeTab]}
                  </p>
                </div>

                {/* Drag and Drop Area */}
                <label
                  htmlFor={`file-input-${activeTab}`}
                  className={`flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isUploading
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/5'
                  }`}
                >
                  <div className="text-center">
                    <Upload
                      className={`h-12 w-12 mx-auto mb-3 ${
                        isUploading
                          ? 'text-gray-300 dark:text-gray-600'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <p
                      className={`text-base font-semibold ${
                        isUploading
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {isUploading ? 'Carga en proceso...' : 'Haga clic para seleccionar un archivo'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      o arrastre y suelte aquí
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Formatos soportados: CSV, Excel (.xls, .xlsx) – Máximo 50MB
                    </p>
                  </div>
                  <input
                    id={`file-input-${activeTab}`}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange(activeTab)}
                    disabled={isUploading}
                  />
                </label>

                {/* File Info */}
                {currentState.file && (
                  <div className="rounded-xl bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-5 space-y-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {currentState.file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(currentState.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={() => setUploadState(activeTab, createUploadState())}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </button>
                      )}
                    </div>

                    {/* Progress */}
                    {currentState.progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Leyendo archivo…</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {currentState.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                            style={{ width: `${currentState.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    {currentState.progress === 100 && !currentState.error && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                            {currentState.total.toLocaleString('es-CL')} registros listos
                          </p>
                          {currentState.monthDetected && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                              <p className="text-xs text-green-700 dark:text-green-300">
                                <span className="font-semibold">Período:</span>{' '}
                                {currentState.monthDetected}
                              </p>
                            </div>
                          )}
                          {currentState.dateDetected && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              <span className="font-semibold">Fecha de corte:</span>{' '}
                              {currentState.dateDetected}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {currentState.error && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-900 dark:text-red-200">{currentState.error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Replace Checkbox (solo Corte) */}
                {activeTab === 'corte' && currentState.total > 0 && !currentState.error && (
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={replaceCorte}
                      onChange={(e) => setReplaceCorte(e.target.checked)}
                      disabled={isUploading}
                      className="h-4 w-4 mt-0.5 rounded border-amber-300 dark:border-amber-700 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Reemplazar período anterior
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Sobrescribe registros existentes del mes indicado. Use esta opción cuando desee
                        actualizar completamente los datos de un período.
                      </p>
                    </div>
                  </label>
                )}

                {/* Upload Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setUploadState(activeTab, createUploadState());
                      setReplaceCorte(false);
                    }}
                    disabled={isUploading || !currentState.file}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || currentState.total === 0 || Boolean(currentState.error)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      isUploading || currentState.total === 0 || currentState.error
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 shadow-lg shadow-blue-500/30'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Subiendo…
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Subir Archivo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Vista previa de datos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Vista Previa
                      </CardTitle>
                      <CardDescription>
                        Primeros 7 registros del archivo cargado
                      </CardDescription>
                    </div>
                    {currentState.total > 0 && (
                      <Badge variant="secondary" className="text-sm">
                        <Database className="h-3 w-3 mr-1" />
                        <NumberTicker value={currentState.total} /> registros
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {currentState.total > 0 && !currentState.error ? (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                #
                              </th>
                              {previewColumns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                                >
                                  {col}
                                </th>
                              ))}
                              {currentState.columns.length > 6 && (
                                <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                  ...
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {previewRows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                              >
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">
                                  {rowIdx + 1}
                                </td>
                                {previewColumns.map((col, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                  >
                                    {String(row[col] ?? '-')}
                                  </td>
                                ))}
                                {currentState.columns.length > 6 && (
                                  <td className="px-3 py-2 text-gray-400 dark:text-gray-500">···</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          Mostrando {previewRows.length} de {currentState.total.toLocaleString('es-CL')} registros
                        </span>
                        {currentState.columns.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{currentState.columns.length - 6} columnas más
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <Eye className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        No hay datos para previsualizar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Selecciona un archivo para ver su contenido
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de Cargas
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Registro de todos los archivos procesados en el sistema
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {uploadHistory.length} {uploadHistory.length === 1 ? 'registro' : 'registros'}
              </div>
            </div>

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold text-blue-600 dark:text-blue-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Total validados en historial
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-200">
                    {corteHistoryTotals.validated.toLocaleString('es-CL')}
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-1">
                    Suma de todos los cortes cargados
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-900/10 p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Total observados en historial
                  </p>
                  <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-200">
                    {corteHistoryTotals.nonValidated.toLocaleString('es-CL')}
                  </p>
                  <p className="text-xs text-red-600/70 dark:text-red-300/70 mt-1">
                    Suma de todos los cortes cargados
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Database className="h-4 w-4" /> Cortes registrados
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {corteHistory.length.toLocaleString('es-CL')}
                  </p>
                  <p className="text-xs text-gray-600/70 dark:text-gray-300/70 mt-1">
                    Archivos de corte procesados
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" /> Últimas cargas de Corte FONASA
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cada corte muestra validados/observados de su mes específico
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {corteHistory.length} {corteHistory.length === 1 ? 'corte registrado' : 'cortes registrados'}
                  </span>
                </div>
                {latestCorteLoads.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {latestCorteLoads.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 p-2">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(item.fechaCarga).toLocaleString('es-CL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.periodoStr !== 'N/A' ? item.periodoStr : 'Sin período asociado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {item.validados.toLocaleString('es-CL')}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-2 py-1">
                            <AlertCircle className="h-3 w-3" />
                            {item.noValidados.toLocaleString('es-CL')}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-200 px-2 py-1">
                            <Database className="h-3 w-3" />
                            {(item.totalPeriodo ?? item.totalRegistros).toLocaleString('es-CL')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aún no hay cargas de Corte FONASA registradas.
                  </div>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="historial-usuario" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Usuario
                </label>
                <input
                  id="historial-usuario"
                  type="text"
                  value={historyFilters.usuario}
                  onChange={(event) => handleHistoryFilterChange('usuario', event.target.value)}
                  placeholder="Buscar por nombre"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="historial-periodo" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Mes de Corte (YYYY-MM)
                </label>
                <input
                  id="historial-periodo"
                  type="month"
                  value={historyFilters.periodo}
                  onChange={(event) => handleHistoryFilterChange('periodo', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="historial-tipo" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tipo de carga
                </label>
                <select
                  id="historial-tipo"
                  value={historyFilters.tipo}
                  onChange={(event) => handleHistoryFilterChange('tipo', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="corte">Corte FONASA</option>
                  <option value="trakcare">HP Trakcare</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Acciones
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetHistoryFilters}
                    className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Fecha y Hora
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Archivo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Tipo
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Acción
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Mes de Corte
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Validados
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      No Validados
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Creados
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Actualizados
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Errores
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Estado
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Éxito
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={14} className="py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Cargando historial…
                      </td>
                    </tr>
                  ) : uploadHistory.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron registros con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    uploadHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {new Date(item.fechaCarga).toLocaleString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-900 dark:text-white">{item.usuario}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span
                              className="text-gray-900 dark:text-white truncate max-w-xs"
                              title={item.nombreArchivo}
                            >
                              {item.nombreArchivo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                              item.tipoCarga === 'CORTE_FONASA'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {item.tipoCargaDisplay}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.reemplazo ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                              <RefreshCw className="h-3 w-3" />
                              Reemplazo
                            </span>
                          ) : item.registrosCreados > 0 && item.registrosActualizados === 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              <Plus className="h-3 w-3" />
                              Nuevos datos
                            </span>
                          ) : item.registrosActualizados > 0 && item.registrosCreados === 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              <Edit className="h-3 w-3" />
                              Actualización
                            </span>
                          ) : item.registrosCreados > 0 && item.registrosActualizados > 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              <Layers className="h-3 w-3" />
                              Mixto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              <Minus className="h-3 w-3" />
                              Sin cambios
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          <div className="flex flex-col">
                            {item.fechaCorte ? (
                              <>
                                <span className="font-semibold">
                                  {new Date(item.fechaCorte).toLocaleDateString('es-CL', {
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(item.fechaCorte).toLocaleDateString('es-CL')}
                                </span>
                              </>
                            ) : item.periodoStr !== 'N/A' ? (
                              <span>{item.periodoStr}</span>
                            ) : (
                              <span>-</span>
                            )}
                            {item.reemplazo && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">(Reemplazo)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">
                          {item.validados.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-semibold">
                          {item.noValidados.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                          {item.totalRegistros.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">
                          +{item.registrosCreados.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">
                          {item.registrosActualizados.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.registrosInvalidos > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                              {item.registrosInvalidos}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              item.estado === 'EXITOSO'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : item.estado === 'PARCIAL'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {item.estado === 'EXITOSO' ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {item.estadoDisplay}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-semibold ${
                                (item.tasaExito ?? 0) >= 95
                                  ? 'text-green-600 dark:text-green-400'
                                  : (item.tasaExito ?? 0) >= 80
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {(item.tasaExito ?? 0).toFixed(1)}%
                            </span>
                            {item.tiempoProcesamiento && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.tiempoProcesamiento.toFixed(1)}s
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}