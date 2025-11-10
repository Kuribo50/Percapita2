"use client";

import { X, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DatasetKey = "corte" | "trakcare" | "nuevosUsuarios";

interface DownloadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (dataset: DatasetKey) => void;
  datasets: Array<{
    key: DatasetKey;
    label: string;
    description: string;
    columns: number;
  }>;
}

export default function DownloadTemplateModal({
  isOpen,
  onClose,
  onDownload,
  datasets,
}: DownloadTemplateModalProps) {
  if (!isOpen) return null;

  const handleDownload = (dataset: DatasetKey) => {
    onDownload(dataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Descargar Plantilla</h3>
              <p className="text-green-100 text-xs">
                Selecciona el tipo de plantilla que necesitas
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-lg h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3">
          {datasets.map((dataset) => (
            <div
              key={dataset.key}
              className="group border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
              onClick={() => handleDownload(dataset.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {dataset.label}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {dataset.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {dataset.columns} columnas
                  </Badge>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(dataset.key);
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info adicional */}
        <div className="px-6 pb-6">
          <div className="flex items-start gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-medium text-green-900 dark:text-green-200 mb-1">
                ¿Cómo usar las plantillas?
              </p>
              <p className="text-green-700 dark:text-green-300">
                Las plantillas contienen los nombres exactos de las columnas
                requeridas. Descarga el archivo Excel, completa los datos en las
                columnas correspondientes y súbelo en la sección de carga.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
