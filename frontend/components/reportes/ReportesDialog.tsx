"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  descargarReporteEstadisticas,
  descargarReporteUsuarios,
  descargarReporteLogs,
} from "@/services/reportes";
import { FileText, Download, Loader2 } from "lucide-react";

interface ReportesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: "estadisticas" | "usuarios" | "logs";
}

export function ReportesDialog({
  open,
  onOpenChange,
  tipo = "estadisticas",
}: ReportesDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  const [accion, setAccion] = useState("");

  const handleDescargar = async () => {
    try {
      setLoading(true);

      switch (tipo) {
        case "estadisticas":
          await descargarReporteEstadisticas();
          break;
        case "usuarios":
          await descargarReporteUsuarios({
            fecha_desde: fechaDesde || undefined,
            fecha_hasta: fechaHasta || undefined,
            estado: estado || undefined,
          });
          break;
        case "logs":
          await descargarReporteLogs({
            fecha_desde: fechaDesde || undefined,
            fecha_hasta: fechaHasta || undefined,
            accion: accion || undefined,
          });
          break;
      }

      toast({
        title: "Reporte generado",
        description: "El archivo PDF se ha descargado correctamente",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error descargando reporte:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.detail ||
          "No se pudo generar el reporte. Verifica que ReportLab esté instalado en el backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case "estadisticas":
        return "Reporte de Estadísticas";
      case "usuarios":
        return "Reporte de Usuarios";
      case "logs":
        return "Reporte de Logs";
      default:
        return "Generar Reporte";
    }
  };

  const getDescripcion = () => {
    switch (tipo) {
      case "estadisticas":
        return "Descarga un reporte PDF con estadísticas generales del sistema";
      case "usuarios":
        return "Descarga un listado de usuarios en formato PDF";
      case "logs":
        return "Descarga un reporte de logs de auditoría en PDF";
      default:
        return "Selecciona los filtros y descarga el reporte";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getTitulo()}
          </DialogTitle>
          <DialogDescription>{getDescripcion()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filtros comunes */}
          <div className="space-y-2">
            <Label htmlFor="fecha-desde">Fecha Desde (opcional)</Label>
            <Input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha-hasta">Fecha Hasta (opcional)</Label>
            <Input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          {/* Filtros específicos para usuarios */}
          {tipo === "usuarios" && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado (opcional)</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="VALIDADO">Validado</SelectItem>
                  <SelectItem value="NO_VALIDADO">No Validado</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="FALLECIDO">Fallecido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtros específicos para logs */}
          {tipo === "logs" && (
            <div className="space-y-2">
              <Label htmlFor="accion">Acción (opcional)</Label>
              <Select value={accion} onValueChange={setAccion}>
                <SelectTrigger id="accion">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREAR">Crear</SelectItem>
                  <SelectItem value="EDITAR">Editar</SelectItem>
                  <SelectItem value="ELIMINAR">Eliminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleDescargar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
