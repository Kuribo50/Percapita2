"use client";

import { useState } from "react";
import { X, Eye, Database, Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetLabel: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  total: number;
}

export default function ExpandedPreviewModal({
  isOpen,
  onClose,
  datasetLabel,
  columns,
  rows,
  total,
}: ExpandedPreviewModalProps) {
  const [displayedRows, setDisplayedRows] = useState(20);

  if (!isOpen) return null;

  const visibleRows = rows.slice(0, displayedRows);
  const hasMore = displayedRows < rows.length;

  const loadMore = () => {
    setDisplayedRows((prev) => Math.min(prev + 50, rows.length));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-sm p-4">
      <div className="w-[90vw] max-w-7xl h-[85vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Compacto */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Vista Completa - {datasetLabel}
              </h3>
              <p className="text-blue-100 text-xs">
                {total.toLocaleString("es-CL")} registros • {columns.length}{" "}
                columnas
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
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-auto max-h-[calc(85vh-180px)]">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800 min-w-[60px]">
                      #
                    </th>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visibleRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                        rowIdx % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 font-medium border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-inherit">
                        {rowIdx + 1}
                      </td>
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                        >
                          {String(row[col] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón cargar más */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Cargar más registros ({displayedRows} de {total})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Compacto */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Mostrando:{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {visibleRows.length} / {total.toLocaleString("es-CL")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Columnas:{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {columns.length}
                </span>
              </span>
            </div>
          </div>
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
