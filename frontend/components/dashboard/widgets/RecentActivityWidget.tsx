"use client";

import { useEffect, useState } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLogs } from "@/services/auditoria";
import type { LogActividad, TipoAccion } from "@/types";
import { Activity, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function RecentActivityWidget() {
  const [logs, setLogs] = useState<LogActividad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const loadRecentLogs = async () => {
    try {
      const response = await getLogs({ limit: 10 });
      setLogs(response.results);
    } catch (error) {
      console.error("Error cargando logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccionColor = (accion: TipoAccion) => {
    switch (accion) {
      case "CREAR":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "EDITAR":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "ELIMINAR":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "LOGIN":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <ModernCard variant="gradient" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium leading-tight">
                      {log.usuario.nombre_completo}
                    </p>
                    <Badge className={getAccionColor(log.accion)}>
                      {log.accion_display}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {log.descripcion}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </ModernCard>
  );
}
