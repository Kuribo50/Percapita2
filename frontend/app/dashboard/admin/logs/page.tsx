"use client";

import { useState, useEffect } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { ModernTable } from "@/components/ui/modern-table";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getLogs,
  getLogDetail,
  getAccionesDisponibles,
  getModulosDisponibles,
} from "@/services/auditoria";
import type {
  LogActividad,
  LogFiltros,
  AccionDisponible,
  ModuloDisponible,
  TipoAccion,
  ModuloSistema,
} from "@/types";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Shield,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogActividad | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState<LogFiltros>({
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [acciones, setAcciones] = useState<AccionDisponible[]>([]);
  const [modulos, setModulos] = useState<ModuloDisponible[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [filtros]);

  const loadInitialData = async () => {
    try {
      const [accionesData, modulosData] = await Promise.all([
        getAccionesDisponibles(),
        getModulosDisponibles(),
      ]);
      setAcciones(accionesData);
      setModulos(modulosData);
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getLogs(filtros);
      setLogs(response.results);
    } catch (error) {
      console.error("Error cargando logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los logs del sistema",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFiltros({ ...filtros, search: searchTerm });
  };

  const handleViewDetail = async (log: LogActividad) => {
    try {
      const detail = await getLogDetail(log.id);
      setSelectedLog(detail);
      setShowDetail(true);
    } catch (error) {
      console.error("Error cargando detalle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el detalle del log",
      });
    }
  };

  const handleClearFilters = () => {
    setFiltros({ limit: 50 });
    setSearchTerm("");
  };

  const getAccionBadgeVariant = (accion: TipoAccion) => {
    switch (accion) {
      case "CREAR":
        return "default";
      case "EDITAR":
        return "secondary";
      case "ELIMINAR":
        return "destructive";
      case "LOGIN":
        return "outline";
      default:
        return "secondary";
    }
  };

  const columns = [
    {
      key: "timestamp",
      label: "Fecha/Hora",
      render: (log: LogActividad) => (
        <div className="text-sm">
          <div className="font-medium">
            {format(new Date(log.timestamp), "dd/MM/yyyy", { locale: es })}
          </div>
          <div className="text-muted-foreground">
            {format(new Date(log.timestamp), "HH:mm:ss", { locale: es })}
          </div>
        </div>
      ),
    },
    {
      key: "usuario",
      label: "Usuario",
      render: (log: LogActividad) => (
        <div className="text-sm">
          <div className="font-medium">{log.usuario.nombre_completo}</div>
          <div className="text-muted-foreground">@{log.usuario.username}</div>
        </div>
      ),
    },
    {
      key: "accion",
      label: "Acción",
      render: (log: LogActividad) => (
        <Badge variant={getAccionBadgeVariant(log.accion)}>
          {log.accion_display}
        </Badge>
      ),
    },
    {
      key: "modulo",
      label: "Módulo",
      render: (log: LogActividad) => (
        <Badge variant="outline">{log.modulo_display}</Badge>
      ),
    },
    {
      key: "descripcion",
      label: "Descripción",
      render: (log: LogActividad) => (
        <div className="max-w-md truncate text-sm">{log.descripcion}</div>
      ),
    },
    {
      key: "ip_address",
      label: "IP",
      render: (log: LogActividad) => (
        <div className="text-xs text-muted-foreground font-mono">
          {log.ip_address || "N/A"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (log: LogActividad) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(log)}
        >
          <FileText className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Logs de Auditoría
          </h1>
          <p className="text-muted-foreground">
            Historial completo de actividades del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Filtros */}
      <ModernCard variant="gradient" className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar en descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Acción */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Acción</label>
              <Select
                value={filtros.accion || ""}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    accion: value as TipoAccion | undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las acciones</SelectItem>
                  {acciones.map((accion) => (
                    <SelectItem key={accion.value} value={accion.value}>
                      {accion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Módulo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Módulo</label>
              <Select
                value={filtros.modulo || ""}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    modulo: value as ModuloSistema | undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los módulos</SelectItem>
                  {modulos.map((modulo) => (
                    <SelectItem key={modulo.value} value={modulo.value}>
                      {modulo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={filtros.fecha_desde || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_desde: e.target.value })
                }
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={filtros.fecha_hasta || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_hasta: e.target.value })
                }
              />
            </div>

            {/* Límite */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resultados</label>
              <Select
                value={filtros.limit?.toString() || "50"}
                onValueChange={(value) =>
                  setFiltros({ ...filtros, limit: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón limpiar */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Tabla de Logs */}
      <ModernCard>
        {logs.length === 0 && !loading ? (
          <ModernEmptyState
            icon={FileText}
            title="No hay logs"
            description="No se encontraron logs con los filtros aplicados"
            variant="search"
          />
        ) : (
          <ModernTable
            columns={columns}
            data={logs}
            loading={loading}
            highlightOnHover
          />
        )}
      </ModernCard>

      {/* Modal de Detalle */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Log</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Usuario
                  </label>
                  <p className="mt-1 font-medium">
                    {selectedLog.usuario.nombre_completo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{selectedLog.usuario.username}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha/Hora
                  </label>
                  <p className="mt-1 font-medium">
                    {format(
                      new Date(selectedLog.timestamp),
                      "dd/MM/yyyy HH:mm:ss",
                      { locale: es }
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Acción
                  </label>
                  <div className="mt-1">
                    <Badge variant={getAccionBadgeVariant(selectedLog.accion)}>
                      {selectedLog.accion_display}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Módulo
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedLog.modulo_display}</Badge>
                  </div>
                </div>

                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dirección IP
                    </label>
                    <p className="mt-1 font-mono text-sm">
                      {selectedLog.ip_address}
                    </p>
                  </div>
                )}

                {selectedLog.objeto_tipo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Objeto Afectado
                    </label>
                    <p className="mt-1">
                      {selectedLog.objeto_tipo} #{selectedLog.objeto_id}
                    </p>
                    {selectedLog.objeto_str && (
                      <p className="text-sm text-muted-foreground">
                        {selectedLog.objeto_str}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Descripción
                </label>
                <p className="mt-1">{selectedLog.descripcion}</p>
              </div>

              {/* Cambios */}
              {selectedLog.cambios && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cambios Realizados
                  </label>
                  <div className="mt-2 rounded-lg bg-muted p-4">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.cambios, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.user_agent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Navegador / Dispositivo
                  </label>
                  <p className="mt-1 text-sm font-mono text-muted-foreground">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
