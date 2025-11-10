"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { User, MapPin, Building2, FileText, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRut, handleRutInput, validateRut } from "@/lib/utils";
import type { NuevoUsuario } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CatalogoOption {
  id?: number;
  nombre: string;
  codigo?: string | null;
  activo?: boolean;
}

interface Catalogos {
  etnias: CatalogoOption[];
  nacionalidades: CatalogoOption[];
  sectores: CatalogoOption[];
  subsectores: CatalogoOption[];
  establecimientos: CatalogoOption[];
}

interface EditUsuarioModalProps {
  usuario: NuevoUsuario | null;
  catalogos: Catalogos;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "VALIDADO", label: "Validado" },
  { value: "NO_VALIDADO", label: "No Validado" },
  { value: "FALLECIDO", label: "Fallecido" },
];

type FormState = {
  run: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaInscripcion: string;
  nacionalidad: string;
  etnia: string;
  sector: string;
  codigoSector: string;
  subsector: string;
  codigoPercapita: string;
  centro: string;
  establecimiento: string;
  observaciones: string;
  estado: NuevoUsuario["estado"];
};

const splitNombreCompleto = (
  nombreCompleto?: string
): Pick<FormState, "nombres" | "apellidoPaterno" | "apellidoMaterno"> => {
  if (!nombreCompleto) {
    return { nombres: "", apellidoPaterno: "", apellidoMaterno: "" };
  }

  const partes = nombreCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    return { nombres: partes[0], apellidoPaterno: "", apellidoMaterno: "" };
  }

  if (partes.length === 2) {
    return {
      nombres: partes[0],
      apellidoPaterno: partes[1],
      apellidoMaterno: "",
    };
  }

  const apellidoMaterno = partes.pop() ?? "";
  const apellidoPaterno = partes.pop() ?? "";
  const nombres = partes.join(" ");

  return { nombres, apellidoPaterno, apellidoMaterno };
};

const buildInitialState = (usuario: NuevoUsuario | null): FormState => {
  const fechaBase = usuario?.fechaInscripcion || usuario?.fechaSolicitud;
  const nombresSeparados = splitNombreCompleto(usuario?.nombreCompleto);
  return {
    run: usuario?.run ? formatRut(usuario.run) : "",
    nombres: usuario?.nombres ?? nombresSeparados.nombres,
    apellidoPaterno:
      usuario?.apellidoPaterno ?? nombresSeparados.apellidoPaterno,
    apellidoMaterno:
      usuario?.apellidoMaterno ?? nombresSeparados.apellidoMaterno,
    fechaInscripcion: fechaBase ?? new Date().toISOString().split("T")[0],
    nacionalidad: usuario?.nacionalidad ? String(usuario.nacionalidad) : "none",
    etnia: usuario?.etnia ? String(usuario.etnia) : "none",
    sector: usuario?.sector ? String(usuario.sector) : "none",
    codigoSector: usuario?.codigoSector ?? "",
    subsector: usuario?.subsector ? String(usuario.subsector) : "none",
    codigoPercapita: usuario?.codigoPercapita ?? "",
    centro: usuario?.centro ?? "",
    establecimiento: usuario?.establecimiento
      ? String(usuario.establecimiento)
      : "none",
    observaciones: usuario?.observaciones ?? "",
    estado: usuario?.estado ?? "PENDIENTE",
  };
};

export default function EditUsuarioModal({
  usuario,
  catalogos,
  isOpen,
  onClose,
  onSuccess,
}: EditUsuarioModalProps) {
  const [formData, setFormData] = useState<FormState>(
    buildInitialState(usuario)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData(buildInitialState(usuario));
    }
  }, [usuario, isOpen]);

  const handleRutChange = (value: string) => {
    const cleaned = handleRutInput(value);
    const formatted = formatRut(cleaned);
    setFormData((prev) => ({ ...prev, run: formatted }));
  };

  const handleFieldChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuario?.id) {
      toast.error("No se encontró el identificador del usuario");
      return;
    }

    if (!validateRut(formData.run)) {
      toast.error("RUT inválido");
      return;
    }

    try {
      setSaving(true);

      // Extraer el mes y año desde la fecha de inscripción ingresada
      const fechaInsc = new Date(formData.fechaInscripcion);
      const mesInscripcion = fechaInsc.getMonth() + 1;
      const anioInscripcion = fechaInsc.getFullYear();

      const payload = {
        run: formatRut(formData.run),
        nombres: formData.nombres.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim(),
        fechaInscripcion: formData.fechaInscripcion,
        periodoMes: mesInscripcion,
        periodoAnio: anioInscripcion,
        nacionalidad:
          formData.nacionalidad && formData.nacionalidad !== "none"
            ? formData.nacionalidad
            : null,
        etnia:
          formData.etnia && formData.etnia !== "none" ? formData.etnia : null,
        sector:
          formData.sector && formData.sector !== "none"
            ? formData.sector
            : null,
        codigoSector: formData.codigoSector.trim(),
        subsector:
          formData.subsector && formData.subsector !== "none"
            ? formData.subsector
            : null,
        codigoPercapita: formData.codigoPercapita.trim(),
        centro: formData.centro.trim(),
        establecimiento:
          formData.establecimiento && formData.establecimiento !== "none"
            ? formData.establecimiento
            : null,
        observaciones: formData.observaciones.trim(),
        estado: formData.estado,
      };

      console.log("Enviando actualización:", payload);

      const response = await fetch(
        `${API_URL}/api/nuevos-usuarios/${usuario.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const detail = await response.text();
        console.error("Error response:", detail);
        throw new Error(
          detail || "No fue posible actualizar la información del usuario"
        );
      }

      const responseData = await response.json();
      console.log("Usuario actualizado:", responseData);

      toast.success("Usuario actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el usuario";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const nacionalidadesActivas = useMemo(
    () => catalogos.nacionalidades.filter((item) => item.activo !== false),
    [catalogos.nacionalidades]
  );

  const etniasActivas = useMemo(
    () => catalogos.etnias.filter((item) => item.activo !== false),
    [catalogos.etnias]
  );

  const sectoresActivos = useMemo(
    () => catalogos.sectores.filter((item) => item.activo !== false),
    [catalogos.sectores]
  );

  const subsectoresActivos = useMemo(
    () => catalogos.subsectores.filter((item) => item.activo !== false),
    [catalogos.subsectores]
  );

  const establecimientosActivos = useMemo(
    () => catalogos.establecimientos.filter((item) => item.activo !== false),
    [catalogos.establecimientos]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (!open ? handleClose() : null)}
    >
      <DialogContent className="!max-w-[75vw] w-[75vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza los datos del usuario. Los campos marcados con{" "}
            <span className="text-destructive">*</span> son obligatorios.
          </DialogDescription>
        </DialogHeader>

        {!usuario ? (
          <p className="text-sm text-muted-foreground">
            No se pudo cargar la información del usuario.
          </p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Información Básica */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-run">
                      RUN / NIP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-run"
                      value={formData.run}
                      onChange={(event) => handleRutChange(event.target.value)}
                      required
                      maxLength={12}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-nombres">
                      Nombres <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-nombres"
                      value={formData.nombres}
                      onChange={(event) =>
                        handleFieldChange(
                          "nombres",
                          event.target.value.toUpperCase()
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-apellido-paterno">
                      Ap. Paterno <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-apellido-paterno"
                      value={formData.apellidoPaterno}
                      onChange={(event) =>
                        handleFieldChange(
                          "apellidoPaterno",
                          event.target.value.toUpperCase()
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-apellido-materno">Ap. Materno</Label>
                    <Input
                      id="edit-apellido-materno"
                      value={formData.apellidoMaterno}
                      onChange={(event) =>
                        handleFieldChange(
                          "apellidoMaterno",
                          event.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos Demográficos y Estado */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Datos Demográficos y Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-fecha-inscripcion">
                      Fecha Inscripción{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-fecha-inscripcion"
                      type="date"
                      value={formData.fechaInscripcion}
                      onChange={(event) =>
                        handleFieldChange(
                          "fechaInscripcion",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-nacionalidad">Nacionalidad</Label>
                    <Select
                      value={formData.nacionalidad}
                      onValueChange={(value) =>
                        handleFieldChange("nacionalidad", value)
                      }
                    >
                      <SelectTrigger id="edit-nacionalidad">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {nacionalidadesActivas.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-etnia">Etnia</Label>
                    <Select
                      value={formData.etnia}
                      onValueChange={(value) =>
                        handleFieldChange("etnia", value)
                      }
                    >
                      <SelectTrigger id="edit-etnia">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {etniasActivas.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-estado">
                      Estado <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) =>
                        handleFieldChange(
                          "estado",
                          value as FormState["estado"]
                        )
                      }
                    >
                      <SelectTrigger id="edit-estado">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación y Sector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación y Sector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-sector">Sector</Label>
                    <Select
                      value={formData.sector}
                      onValueChange={(value) =>
                        handleFieldChange("sector", value)
                      }
                    >
                      <SelectTrigger id="edit-sector">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {sectoresActivos.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-codigo-sector">Código Sector</Label>
                    <Input
                      id="edit-codigo-sector"
                      value={formData.codigoSector}
                      onChange={(event) =>
                        handleFieldChange(
                          "codigoSector",
                          event.target.value.toUpperCase()
                        )
                      }
                      className="font-mono"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-subsector">Subsector</Label>
                    <Select
                      value={formData.subsector}
                      onValueChange={(value) =>
                        handleFieldChange("subsector", value)
                      }
                    >
                      <SelectTrigger id="edit-subsector">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {subsectoresActivos.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-codigo-percapita">
                      Cód. Percápita
                    </Label>
                    <Input
                      id="edit-codigo-percapita"
                      value={formData.codigoPercapita}
                      onChange={(event) =>
                        handleFieldChange(
                          "codigoPercapita",
                          event.target.value.toUpperCase()
                        )
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Establecimiento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Establecimiento de Salud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-centro">Centro de Salud</Label>
                    <Input
                      id="edit-centro"
                      value={formData.centro}
                      onChange={(event) =>
                        handleFieldChange(
                          "centro",
                          event.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="edit-establecimiento">
                      Establecimiento
                    </Label>
                    <Select
                      value={formData.establecimiento}
                      onValueChange={(value) =>
                        handleFieldChange("establecimiento", value)
                      }
                    >
                      <SelectTrigger id="edit-establecimiento">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {establecimientosActivos.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="edit-observaciones"
                  rows={3}
                  value={formData.observaciones}
                  onChange={(event) =>
                    handleFieldChange("observaciones", event.target.value)
                  }
                  placeholder="Ingrese cualquier observación relevante..."
                />
              </CardContent>
            </Card>

            <DialogFooter className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
