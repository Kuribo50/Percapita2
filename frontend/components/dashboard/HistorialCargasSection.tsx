"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  FileUp,
  Search,
  RefreshCw,
  Filter,
  User,
  Clock,
  FileText,
  Database,
  X,
  CheckCircle2,
  Sparkles,
  Trash2,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HistorialCarga {
  id: number;
  tipoCarga: string;
  tipoCargaDisplay: string;
  nombreArchivo: string;
  usuario: string;
  fechaCarga: string;
  periodoMes?: number;
  periodoAnio?: number;
  periodoStr?: string;
  fechaCorte?: string;
  totalRegistros: number;
  registrosCreados: number;
  registrosActualizados: number;
  registrosInvalidos: number;
  validados: number;
  noValidados: number;
  totalPeriodo: number; // Cantidad de usuarios en ese corte específico
  estado: string;
  estadoDisplay: string;
  estadoCarga: string; // NUEVO, ACTIVO, SOBRESCRITO, ELIMINADO
  tasaExito: number;
  tiempoProcesamiento?: number;
  observaciones?: string;
}

type SortField = "fechaCarga" | "totalRegistros" | "tasaExito" | "usuario";
type SortOrder = "asc" | "desc";

export function HistorialCargasSection() {
  const [cargas, setCargas] = useState<HistorialCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("TODOS");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("ACTIVOS");
  const [sortField, setSortField] = useState<SortField>("fechaCarga");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchCargas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/historial-cargas/?limit=100`
      );
      if (!response.ok) {
        throw new Error("Error al cargar historial");
      }
      const data = await response.json();
      console.log("📊 Historial cargas cargado:", data.length, "registros");
      console.log(
        "HP Trakcare:",
        data.filter((c: HistorialCarga) => c.tipoCarga === "HP_TRAKCARE").length
      );
      setCargas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setCargas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCargas();
  }, [fetchCargas]);

  // Filtrar y ordenar cargas
  const cargasFiltradas = useMemo(() => {
    let filtered = [...cargas];

    if (estadoFiltro === "ACTIVOS") {
      filtered = filtered.filter(
        (c) => c.estado === "EXITOSO" || c.estado === "PARCIAL"
      );
    } else if (estadoFiltro === "INACTIVOS") {
      filtered = filtered.filter(
        (c) => c.estado === "ERROR" || c.estado === "EN_PROCESO"
      );
    }

    if (tipoFiltro !== "TODOS") {
      filtered = filtered.filter((c) => c.tipoCarga === tipoFiltro);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombreArchivo.toLowerCase().includes(term) ||
          c.usuario.toLowerCase().includes(term) ||
          c.periodoStr?.toLowerCase().includes(term) ||
          c.tipoCargaDisplay.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === "fechaCarga") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    console.log("🔍 Cargas filtradas:", filtered.length);
    console.log(
      "HP Trakcare filtrado:",
      filtered.filter((c) => c.tipoCarga === "HP_TRAKCARE").length
    );

    return filtered;
  }, [cargas, searchTerm, tipoFiltro, estadoFiltro, sortField, sortOrder]);

  const getTipoBadge = (tipo: string) => {
    if (tipo === "CORTE_FONASA") {
      return (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-300 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-400 dark:border-blue-800 font-semibold shadow-sm"
        >
          <Database className="w-3.5 h-3.5 mr-1.5" />
          Corte FONASA
        </Badge>
      );
    }
    if (tipo === "HP_TRAKCARE") {
      return (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-300 dark:from-purple-950/50 dark:to-pink-950/50 dark:text-purple-400 dark:border-purple-800 font-semibold shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          HP Trakcare
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 dark:from-green-950/50 dark:to-emerald-950/50 dark:text-green-400 dark:border-green-800 font-semibold shadow-sm"
      >
        <User className="w-3.5 h-3.5 mr-1.5" />
        Nuevos Usuarios
      </Badge>
    );
  };

  const getEstadoCargaBadge = (estadoCarga: string) => {
    switch (estadoCarga) {
      case "NUEVO":
        return (
          <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 dark:from-green-950/50 dark:to-emerald-950/50 dark:text-green-400 dark:border-green-700 font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Nuevo
          </Badge>
        );
      case "ACTIVO":
        return (
          <Badge className="bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border-blue-300 dark:from-blue-950/50 dark:to-sky-950/50 dark:text-blue-400 dark:border-blue-700 font-semibold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Activo
          </Badge>
        );
      case "SOBRESCRITO":
        return (
          <Badge className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300 dark:from-amber-950/50 dark:to-yellow-950/50 dark:text-amber-400 dark:border-amber-700 font-semibold shadow-sm">
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Sobrescrito
          </Badge>
        );
      case "ELIMINADO":
        return (
          <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300 dark:from-red-950/50 dark:to-rose-950/50 dark:text-red-400 dark:border-red-700 font-semibold shadow-sm">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Eliminado
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCorte = (
    fechaCorte: string | undefined,
    periodoStr: string | undefined,
    tipoCarga: string
  ) => {
    // Para HP Trakcare siempre mostrar "Histórico"
    if (tipoCarga === "HP_TRAKCARE") {
      return "Histórico";
    }

    if (fechaCorte) {
      const fecha = new Date(fechaCorte);
      return fecha.toLocaleDateString("es-CL", {
        month: "long",
        year: "numeric",
      });
    }
    return periodoStr || "N/A";
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-CL").format(num);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTipoFiltro("TODOS");
    setEstadoFiltro("ACTIVOS");
    setSortField("fechaCarga");
    setSortOrder("desc");
  };

  const hasActiveFilters = Boolean(
    searchTerm || tipoFiltro !== "TODOS" || estadoFiltro !== "ACTIVOS"
  );

  return (
    <Card className="border shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20">
              <FileUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Historial de Cargas</CardTitle>
              <CardDescription className="mt-1">
                Registro de archivos procesados
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCargas}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros y Búsqueda */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por archivo, usuario o periodo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los tipos</SelectItem>
                  <SelectItem value="CORTE_FONASA">Corte FONASA</SelectItem>
                  <SelectItem value="HP_TRAKCARE">HP Trakcare</SelectItem>
                  <SelectItem value="NUEVOS_USUARIOS">
                    Nuevos Usuarios
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVOS">Activos</SelectItem>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="INACTIVOS">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fechaCarga-desc">Más reciente</SelectItem>
                  <SelectItem value="fechaCarga-asc">Más antiguo</SelectItem>
                  <SelectItem value="totalRegistros-desc">
                    Más registros
                  </SelectItem>
                  <SelectItem value="totalRegistros-asc">
                    Menos registros
                  </SelectItem>
                  <SelectItem value="tasaExito-desc">Mayor éxito</SelectItem>
                  <SelectItem value="tasaExito-asc">Menor éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Barra de estado y limpiar filtros */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">
                {cargasFiltradas.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-foreground">
                {cargas.length}
              </span>{" "}
              cargas
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Lista de Cargas */}
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {loading ? (
            <LoadingSkeleton />
          ) : cargasFiltradas.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} />
          ) : (
            cargasFiltradas.map((carga) => (
              <CargaCard
                key={carga.id}
                carga={carga}
                getTipoBadge={getTipoBadge}
                getEstadoCargaBadge={getEstadoCargaBadge}
                formatFecha={formatFecha}
                formatFechaCorte={formatFechaCorte}
                formatNumber={formatNumber}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de tarjeta de carga individual
function CargaCard({
  carga,
  getTipoBadge,
  getEstadoCargaBadge,
  formatFecha,
  formatFechaCorte,
  formatNumber,
}: {
  carga: HistorialCarga;
  getTipoBadge: (tipo: string) => React.ReactNode;
  getEstadoCargaBadge: (estadoCarga: string) => React.ReactNode;
  formatFecha: (fecha: string) => string;
  formatFechaCorte: (
    fechaCorte: string | undefined,
    periodoStr: string | undefined,
    tipoCarga: string
  ) => string;
  formatNumber: (num: number) => string;
}) {
  const isFonasa = carga.tipoCarga === "CORTE_FONASA";
  const isNuevosUsuarios = carga.tipoCarga === "NUEVOS_USUARIOS";
  const borderColor = isFonasa
    ? "border-l-4 border-l-blue-500 dark:border-l-blue-400"
    : isNuevosUsuarios
    ? "border-l-4 border-l-green-500 dark:border-l-green-400"
    : "border-l-4 border-l-purple-500 dark:border-l-purple-400";

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 overflow-hidden ${borderColor}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Información Principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getTipoBadge(carga.tipoCarga)}
              {getEstadoCargaBadge(carga.estadoCarga)}
            </div>
            <p className="text-sm font-semibold text-foreground truncate mb-1">
              {carga.nombreArchivo}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {carga.usuario}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatFecha(carga.fechaCarga)}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Periodo</p>
              <p className="text-sm font-semibold">
                {formatFechaCorte(
                  carga.fechaCorte,
                  carga.periodoStr,
                  carga.tipoCarga
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {isFonasa ? "Usuarios" : "Registros"}
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(
                  isFonasa ? carga.totalPeriodo || 0 : carga.totalRegistros
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de skeleton de carga
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente de estado vacío
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">
              {hasFilters
                ? "No se encontraron resultados"
                : "No hay cargas registradas"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Intenta ajustar los filtros de búsqueda"
                : "Las cargas aparecerán aquí cuando se procesen archivos"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
