"use client";

import type { ChangeEvent } from "react";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Loader2,
  Download,
  ArrowUpCircle,
  Calendar,
  Eye,
  Maximize2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import NumberTicker from "@/components/magicui/number-ticker";
import type { DatasetKey, UploadState } from "@/lib/subir-corte/types";
import { DATASET_DESCRIPTIONS } from "@/lib/subir-corte/constants";

interface UploadCardProps {
  dataset: DatasetKey;
  uploadState: UploadState;
  isUploading: boolean;
  replaceCorte?: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onCancel: () => void;
  onDownloadTemplate: () => void;
  onExpandPreview: () => void;
  onReplaceCorteChange?: (checked: boolean) => void;
  initialPreviewRows?: number;
  maxPreviewColumns?: number;
}

export default function UploadCard({
  dataset,
  uploadState,
  isUploading,
  replaceCorte = false,
  onFileChange,
  onUpload,
  onCancel,
  onDownloadTemplate,
  onExpandPreview,
  onReplaceCorteChange,
  initialPreviewRows = 7,
  maxPreviewColumns = 6,
}: UploadCardProps) {
  const canShowReplaceCheckbox =
    dataset === "corte" && uploadState.total > 0 && !uploadState.error;

  // Calculate preview data from uploadState
  const previewRows = uploadState.rows.slice(0, initialPreviewRows);
  const previewColumns = uploadState.columns.slice(0, maxPreviewColumns);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card de Carga - 1 columna */}
      <div className="lg:col-span-1">
        <Card className="h-full shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ArrowUpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Cargar Archivo</CardTitle>
                <CardDescription>
                  {DATASET_DESCRIPTIONS[dataset]}
                </CardDescription>
              </div>
              <Button
                onClick={onDownloadTemplate}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isUploading}
              >
                <Download className="h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop */}
            <label
              htmlFor={`file-input-${dataset}`}
              className={`group flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isUploading
                  ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/5 hover:shadow-lg"
              }`}
            >
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Upload
                  className={`h-10 w-10 ${
                    isUploading
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-base font-semibold ${
                    isUploading
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {isUploading
                    ? "Carga en proceso..."
                    : "Selecciona o arrastra un archivo"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  CSV o Excel (.xlsx, .xls) • Máximo 50MB
                </p>
              </div>
              <input
                id={`file-input-${dataset}`}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={onFileChange}
                disabled={isUploading}
              />
            </label>

            {/* File Info */}
            {uploadState.file && (
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {uploadState.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(uploadState.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        onClick={onCancel}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {uploadState.progress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Procesando archivo...
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {uploadState.progress}%
                        </span>
                      </div>
                      <Progress value={uploadState.progress} className="h-2" />
                    </div>
                  )}

                  {uploadState.progress === 100 && !uploadState.error && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                          {uploadState.total.toLocaleString("es-CL")} registros
                          listos
                        </p>
                        {uploadState.monthDetected && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Período: {uploadState.monthDetected}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {uploadState.error && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900 dark:text-red-200">
                        {uploadState.error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Replace Checkbox */}
            {canShowReplaceCheckbox && onReplaceCorteChange && (
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceCorte}
                      onChange={(e) => onReplaceCorteChange(e.target.checked)}
                      disabled={isUploading}
                      className="h-4 w-4 mt-0.5 rounded border-amber-300 dark:border-amber-700 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Reemplazar período anterior
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Sobrescribe registros existentes del mes indicado
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                disabled={isUploading || !uploadState.file}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={onUpload}
                disabled={
                  isUploading ||
                  uploadState.total === 0 ||
                  Boolean(uploadState.error)
                }
                className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Archivo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista Previa - 2 columnas */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>
                    Primeros registros del archivo
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploadState.total > 0 && (
                  <>
                    <Button
                      onClick={onExpandPreview}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Expandir
                    </Button>
                    <Badge variant="secondary" className="text-sm">
                      <NumberTicker value={uploadState.total} /> registros
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {uploadState.total === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  No hay datos para mostrar
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Carga un archivo para ver la vista previa
                </p>
              </div>
            ) : (
              <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        #
                      </th>
                      {previewColumns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                      {uploadState.columns.length > maxPreviewColumns && (
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-500 border-b border-gray-300 dark:border-gray-600">
                          ...
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {previewRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">
                          {idx + 1}
                        </td>
                        {previewColumns.map((col, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                          >
                            {String(row[col] ?? "-")}
                          </td>
                        ))}
                        {uploadState.columns.length > maxPreviewColumns && (
                          <td className="px-3 py-2 text-gray-400 dark:text-gray-500">
                            ···
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
