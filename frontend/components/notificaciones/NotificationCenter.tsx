"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  getNotificacionesNoLeidasCount,
} from "@/services/notificaciones";
import type { NotificacionSistema, TipoNotificacion } from "@/types";
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCount();
    // Actualizar contador cada 30 segundos
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotificaciones();
    }
  }, [open]);

  const loadCount = async () => {
    try {
      const newCount = await getNotificacionesNoLeidasCount();
      setCount(newCount);
    } catch (error) {
      console.error("Error cargando contador:", error);
    }
  };

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await getNotificaciones(undefined, 20);
      setNotificaciones(response.results);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (
    e: React.MouseEvent,
    notificacion: NotificacionSistema
  ) => {
    e.stopPropagation();
    if (notificacion.leida) return;

    try {
      await marcarNotificacionLeida(notificacion.id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
      );
      setCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando como leída:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
      });
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setCount(0);
      toast({
        title: "Éxito",
        description: "Todas las notificaciones marcadas como leídas",
      });
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar todas como leídas",
      });
    }
  };

  const handleNotificationClick = async (notificacion: NotificacionSistema) => {
    // Marcar como leída
    if (!notificacion.leida) {
      await marcarNotificacionLeida(notificacion.id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
      );
      setCount((prev) => Math.max(0, prev - 1));
    }

    // Navegar si tiene URL
    if (notificacion.url) {
      router.push(notificacion.url);
      setOpen(false);
    }
  };

  const getNotificationIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "SUCCESS":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "ERROR":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBgClass = (tipo: TipoNotificacion, leida: boolean) => {
    if (leida) return "bg-muted/30";

    switch (tipo) {
      case "SUCCESS":
        return "bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500";
      case "WARNING":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500";
      case "ERROR":
        return "bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500";
      default:
        return "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificaciones</h3>
            {count > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {count} nuevas
              </Badge>
            )}
          </div>
          {notificaciones.some((n) => !n.leida) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLeidas}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  onClick={() => handleNotificationClick(notificacion)}
                  className={cn(
                    "p-4 transition-colors cursor-pointer hover:bg-accent",
                    getNotificationBgClass(notificacion.tipo, notificacion.leida),
                    !notificacion.leida && "font-medium"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notificacion.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {notificacion.titulo}
                        </p>
                        {!notificacion.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleMarcarLeida(e, notificacion)}
                          >
                            <CheckCheck className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notificacion.mensaje}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notificacion.timestamp),
                            {
                              addSuffix: true,
                              locale: es,
                            }
                          )}
                        </span>
                        {notificacion.url && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
