"use client";

import {
  CheckCircle2,
  Database,
  Loader2,
  Upload,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadOverlayState } from "@/lib/subir-corte/types";
import { DATASET_LABELS } from "@/lib/subir-corte/constants";

interface UploadProgressModalProps {
  uploadProgress: UploadOverlayState | null;
  onClose: () => void;
}

export default function UploadProgressModal({
  uploadProgress,
  onClose,
}: UploadProgressModalProps) {
  if (!uploadProgress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {uploadProgress.progress >= 100 ? (
                  <CheckCircle2 className="h-10 w-10 text-white" />
                ) : (
                  <Database className="h-10 w-10 text-white" />
                )}
              </div>
              {uploadProgress.progress < 100 && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center">
            {uploadProgress.progress >= 100
              ? "Carga Completada"
              : `Cargando ${DATASET_LABELS[uploadProgress.dataset]}`}
          </h3>
          <p className="text-blue-100 text-center mt-2 text-sm">
            {uploadProgress.totalRows.toLocaleString("es-CL")} registros{" "}
            {uploadProgress.progress >= 100 ? "procesados" : "en proceso"}
          </p>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          {/* Estado actual */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {uploadProgress.currentPhase === "uploading" && (
                <>
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-bounce" />
                  <span>Enviando datos al servidor...</span>
                </>
              )}
              {uploadProgress.currentPhase === "processing" && (
                <>
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span>Procesando y validando registros...</span>
                </>
              )}
              {uploadProgress.currentPhase === "finalizing" && (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>
                    {uploadProgress.progress >= 100
                      ? "¡Carga exitosa!"
                      : "Finalizando carga..."}
                  </span>
                </>
              )}
            </div>

            {uploadProgress.progress > 0 && uploadProgress.progress < 100 && (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Procesando registros...
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Progreso General
              </span>
              <span className="font-bold text-2xl text-blue-600 dark:text-blue-400 tabular-nums">
                {uploadProgress.progress}%
              </span>
            </div>

            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${uploadProgress.progress}%` }}
              >
                <div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    animation: "shimmer 2s infinite",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
              {uploadProgress.progress > 0 && uploadProgress.progress < 100 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-white shadow-lg transition-all duration-300"
                  style={{ left: `${uploadProgress.progress}%` }}
                />
              )}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                {uploadProgress.progress >= 100 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Completado
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span className="tabular-nums">
                      {uploadProgress.etaSeconds > 0
                        ? `~${uploadProgress.etaSeconds}s restantes`
                        : "Calculando..."}
                    </span>
                  </>
                )}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium tabular-nums">
                {uploadProgress.totalRows.toLocaleString("es-CL")} registros
              </span>
            </div>
          </div>

          {/* Indicadores de fase */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  uploadProgress.progress > 0
                    ? "bg-green-500 shadow-lg shadow-green-500/50"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Enviado
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  uploadProgress.progress > 30
                    ? "bg-green-500 shadow-lg shadow-green-500/50"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Procesando
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  uploadProgress.progress >= 100
                    ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Finalizado
              </span>
            </div>
          </div>

          {/* Mensaje de info */}
          {uploadProgress.progress < 100 && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Por favor espera...
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Los registros se están procesando en segundo plano. No cierres
                  esta ventana.
                </p>
              </div>
            </div>
          )}

          {/* Botón de cierre (solo cuando está completado) */}
          {uploadProgress.progress >= 100 && (
            <Button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
