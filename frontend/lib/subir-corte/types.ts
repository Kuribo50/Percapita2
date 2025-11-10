export type DatasetKey = "corte" | "trakcare" | "nuevosUsuarios";

export interface UploadState {
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

export interface UploadHistoryItem {
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
  estadoCarga: string;
  reemplazo: boolean;
  observaciones?: string;
  tasaExito: number;
  tiempoProcesamiento?: number;
}

export interface HistoryFilters {
  usuario: string;
  periodo: string;
  tipo: "all" | "corte" | "trakcare";
}

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface UploadOverlayState {
  dataset: DatasetKey;
  progress: number;
  etaSeconds: number;
  totalRows: number;
  startedAt: number;
  estimatedMs: number;
  currentPhase: "uploading" | "processing" | "finalizing";
}
