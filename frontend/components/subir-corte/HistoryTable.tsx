"use client";

import { Database, User, Clock, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UploadHistoryItem } from "@/lib/subir-corte/types";

interface HistoryTableProps {
  history: UploadHistoryItem[];
  isLoading: boolean;
  formatFechaCorte: (
    fechaCorte?: string,
    periodoStr?: string,
    tipoCarga?: string
  ) => string;
  getEstadoCargaBadge: (estado: string) => React.ReactNode;
}

export default function HistoryTable({
  history,
  isLoading,
  formatFechaCorte,
  getEstadoCargaBadge,
}: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <FolderOpen className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                No hay cargas registradas
              </p>
              <CardDescription>
                Las cargas aparecerán aquí cuando se procesen archivos
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      {history.map((item) => {
        const isFonasa = item.tipoCarga === "CORTE_FONASA";
        return (
          <Card
            key={item.id}
            className={`hover:shadow-md transition-all duration-200 ${
              isFonasa
                ? "border-l-4 border-l-blue-500 dark:border-l-blue-400"
                : "border-l-4 border-l-purple-500 dark:border-l-purple-400"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        isFonasa
                          ? "bg-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-purple-100 hover:bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      }
                    >
                      <Database className="w-3 h-3 mr-1" />
                      {item.tipoCargaDisplay}
                    </Badge>
                    {getEstadoCargaBadge(item.estadoCarga)}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate mb-1">
                    {item.nombreArchivo}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.usuario}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.fechaCarga).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Periodo</p>
                    <p className="text-sm font-semibold">
                      {formatFechaCorte(
                        item.fechaCorte,
                        item.periodoStr,
                        item.tipoCarga
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Registros</p>
                    <p className="text-lg font-bold text-foreground">
                      {(isFonasa
                        ? item.totalPeriodo || 0
                        : item.totalRegistros
                      ).toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
