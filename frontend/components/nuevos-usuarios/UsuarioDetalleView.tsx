"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Globe,
  Skull,
  Database,
  Phone,
  Heart,
  Users,
  History,
  Info,
  Activity,
  AlertTriangle,
  ArrowDown,
  MapPinned,
  FileCheck,
} from "lucide-react";
import { formatRut } from "@/lib/utils";
import { NuevoUsuario } from "@/types";
import { toast } from "sonner";
import RevisionPanel from "./RevisionPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Catalogo {
  id?: number;
  nombre: string;
  codigo?: string | null;
  activo: boolean;
}

interface Catalogos {
  etnias: Catalogo[];
  nacionalidades: Catalogo[];
  sectores: Catalogo[];
  subsectores: Catalogo[];
  establecimientos: Catalogo[];
}

interface TrakcareData {
  id?: number;
  codFamilia?: string | null;
  relacionParentezco?: string | null;
  idTrakcare?: string | null;
  codRegistro?: string | null;
  RUN?: string | null;
  apPaterno?: string | null;
  apMaterno?: string | null;
  nombre?: string | null;
  genero?: string | null;
  fechaNacimiento?: string | null;
  edad?: number | null;
  direccion?: string | null;
  telefono?: string | null;
  telefonoCelular?: string | null;
  TelefonoRecado?: string | null;
  servicioSalud?: string | null;
  centroInscripcion?: string | null;
  sector?: string | null;
  prevision?: string | null;
  planTrakcare?: string | null;
  praisTrakcare?: string | null;
  fechaIncorporacion?: string | null;
  fechaUltimaModif?: string | null;
  fechaDefuncion?: string | null;
  etnia?: string | null;
  nacionalidad?: string | null;
}

interface HistorialMensual {
  mes: number;
  anio: number;
  mesStr: string;
  estado: "VALIDADO" | "RECHAZADO" | "INSCRIPCION" | "AUSENTE";
  tipoRegistro?: "corte" | "nuevo_usuario" | null;
  // Campos de CorteFonasa (cuando estado = VALIDADO o RECHAZADO)
  nombreCompleto?: string;
  tramo?: string;
  genero?: string;
  motivo?: string;
  fechaCorte?: string;
  validadoManualmente?: boolean;
  // Nuevos campos de procedencia y destino
  centroDeProcedencia?: string;
  comunaDeProcedencia?: string;
  centroActual?: string;
  comunaActual?: string;
  aceptadoRechazado?: string;
  // Campos de NuevoUsuario (cuando estado = INSCRIPCION)
  centro?: string;
  establecimiento?: string;
  sector?: string;
  codigoPercapita?: string;
  fechaInscripcion?: string;
  observaciones?: string;
  estadoValidacion?: string;
}

interface UsuarioDetalleViewProps {
  usuario: NuevoUsuario;
  catalogos: Catalogos;
  onDelete?: (id: number) => Promise<void> | void;
  onEdit?: (usuario: NuevoUsuario) => void;
}

export default function UsuarioDetalleView({
  usuario,
  catalogos,
  onDelete,
  onEdit,
}: UsuarioDetalleViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingTrakcare, setLoadingTrakcare] = useState(false);
  const [trakcareData, setTrakcareData] = useState<TrakcareData | null>(null);
  const [trakcareError, setTrakcareError] = useState<string | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historial, setHistorial] = useState<HistorialMensual[]>([]);

  const fetchHistorialMensual = useCallback(async () => {
    if (!usuario?.run) {
      setHistorial([]);
      return;
    }

    setLoadingHistorial(true);
    try {
      const response = await fetch(
        `${API_URL}/api/nuevos-usuarios/historial/?run=${usuario.run}`
      );
      if (!response.ok) {
        throw new Error("Error al cargar historial");
      }
      const data = await response.json();
      setHistorial(data);
    } catch (error) {
      console.error("Error fetching historial:", error);
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }, [usuario?.run]);

  const fetchTrakcareData = useCallback(async () => {
    if (!usuario?.run) {
      setTrakcareData(null);
      return;
    }

    try {
      setLoadingTrakcare(true);
      setTrakcareError(null);
      const response = await fetch(
        `${API_URL}/api/hp-trakcare/buscar/?run=${usuario.run}`
      );

      if (!response.ok) {
        setTrakcareData(null);
        if (response.status !== 404) {
          throw new Error("No fue posible obtener los datos de HP Trakcare");
        }
        return;
      }

      const data = await response.json();
      setTrakcareData(data);
    } catch (error) {
      console.error("Error al cargar datos de HP Trakcare:", error);
      setTrakcareData(null);
      setTrakcareError("No fue posible cargar los datos de HP Trakcare");
    } finally {
      setLoadingTrakcare(false);
    }
  }, [usuario?.run]);

  useEffect(() => {
    fetchTrakcareData();
  }, [fetchTrakcareData]);

  useEffect(() => {
    fetchHistorialMensual();
  }, [fetchHistorialMensual]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(usuario);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !usuario?.id) return;
    await onDelete(usuario.id);
    setShowDeleteConfirm(false);
  };

  const handleCopyRut = async () => {
    try {
      await navigator.clipboard.writeText(usuario.run);
      toast.success("RUT copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el RUT");
    }
  };

  const handleMarcarRevisado = async (
    revisadoManualmente: boolean,
    observaciones?: string,
    checklist?: Record<string, boolean>
  ) => {
    if (!usuario?.id) {
      toast.error("No se puede marcar como revisado: usuario no válido");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/nuevos-usuarios/${usuario.id}/marcar-revisado/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revisadoManualmente,
            observacionesTrakcare: observaciones || "",
            checklistTrakcare: checklist || {},
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al marcar como revisado");
      }

      const data = await response.json();
      toast.success(
        revisadoManualmente
          ? "Usuario marcado como revisado manualmente"
          : "Usuario marcado como revisado"
      );

      // Actualizar el usuario con los datos devueltos por el servidor
      if (onEdit) {
        onEdit(data);
      }
    } catch (error) {
      console.error("Error al marcar como revisado:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al marcar como revisado"
      );
    }
  };

  const findCatalogo = (
    lista: Catalogo[],
    value?: string | number | null
  ): Catalogo | undefined => {
    if (value === undefined || value === null) return undefined;
    const cleaned = String(value).trim();
    if (!cleaned) return undefined;
    return lista.find((item) => {
      const codigo = item.codigo?.trim();
      if (codigo && codigo === cleaned) {
        return true;
      }
      if (item.id !== undefined && String(item.id) === cleaned) {
        return true;
      }
      return false;
    });
  };

  const getNacionalidadNombre = (): string => {
    return (
      findCatalogo(catalogos.nacionalidades, usuario.nacionalidad)?.nombre ||
      "No especificada"
    );
  };

  const getEtniaNombre = (): string => {
    return (
      findCatalogo(catalogos.etnias, usuario.etnia)?.nombre || "No especificada"
    );
  };

  const getSectorNombre = (): string => {
    return (
      findCatalogo(catalogos.sectores, usuario.sector)?.nombre ||
      "No especificado"
    );
  };

  const getSubsectorNombre = (): string => {
    return (
      findCatalogo(catalogos.subsectores, usuario.subsector)?.nombre ||
      "No especificado"
    );
  };

  const getEstablecimientoNombre = (): string => {
    return (
      findCatalogo(catalogos.establecimientos, usuario.establecimiento)
        ?.nombre || "No especificado"
    );
  };

  const formatFecha = (fecha?: string): string => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getEstadoConfig = () => {
    const configs = {
      VALIDADO: {
        label: "Validado",
        icon: CheckCircle,
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600",
      },
      NO_VALIDADO: {
        label: "No Validado",
        icon: XCircle,
        variant: "destructive" as const,
        className: "",
      },
      PENDIENTE: {
        label: "Pendiente",
        icon: Clock,
        variant: "secondary" as const,
        className: "bg-amber-500 hover:bg-amber-600 text-white",
      },
      FALLECIDO: {
        label: "Fallecido",
        icon: Skull,
        variant: "outline" as const,
        className: "bg-gray-800 text-white hover:bg-gray-900",
      },
    };

    return configs[usuario.estado] || configs.PENDIENTE;
  };

  const estadoConfig = getEstadoConfig();
  const EstadoIcon = estadoConfig.icon;

  const getNombresDisplay = () => {
    if (usuario.nombres) return usuario.nombres;
    const partes = usuario.nombreCompleto?.split(" ") || [];
    if (partes.length >= 3) {
      return partes.slice(0, -2).join(" ");
    }
    return usuario.nombreCompleto || "No disponible";
  };

  const getApellidoPaternoDisplay = () => {
    if (usuario.apellidoPaterno) return usuario.apellidoPaterno;
    const partes = usuario.nombreCompleto?.split(" ") || [];
    if (partes.length >= 2) {
      return partes[partes.length - 2];
    }
    return "No disponible";
  };

  const getApellidoMaternoDisplay = () => {
    if (usuario.apellidoMaterno) return usuario.apellidoMaterno;
    const partes = usuario.nombreCompleto?.split(" ") || [];
    if (partes.length >= 3) {
      return partes[partes.length - 1];
    }
    return "No disponible";
  };

  // Componente de campo de información reutilizable
  const InfoField = ({
    label,
    value,
    icon: Icon,
    mono = false,
  }: {
    label: string;
    value: string | number;
    icon?: React.ElementType;
    mono?: boolean;
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={`text-sm font-medium ${
          mono ? "font-mono" : ""
        } text-foreground`}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Compacto con Información Principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">
                  {usuario.nombreCompleto}
                </CardTitle>
                <Badge
                  className={estadoConfig.className}
                  variant={estadoConfig.variant}
                >
                  <EstadoIcon className="w-3 h-3 mr-1" />
                  {estadoConfig.label}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="font-mono font-semibold text-foreground">
                  {formatRut(usuario.run)}
                </span>
                <Button
                  onClick={handleCopyRut}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-1">¿Estás seguro?</p>
              <p className="text-sm">
                Esta acción eliminará permanentemente el usuario{" "}
                <strong>{usuario.nombreCompleto}</strong> (RUN:{" "}
                {formatRut(usuario.run)}). Esta operación no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button onClick={handleDelete} variant="destructive" size="sm">
                Eliminar
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Principal */}
      <Tabs defaultValue="informacion" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="informacion" className="gap-2">
            <User className="w-4 h-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="familia" className="gap-2">
            <Users className="w-4 h-4" />
            Familia
          </TabsTrigger>
          <TabsTrigger value="revision" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Revisión
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-2">
            <History className="w-4 h-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Tab Información General - Datos Personales + Trakcare lado a lado */}
        <TabsContent value="informacion" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Datos del Usuario */}
            <div className="space-y-4">
              {/* Datos Personales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Datos Personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoField
                      label="Nombre Completo"
                      value={usuario.nombreCompleto}
                    />
                  </div>
                  <InfoField label="Nombres" value={getNombresDisplay()} />
                  <InfoField
                    label="Apellido Paterno"
                    value={getApellidoPaternoDisplay()}
                  />
                  <InfoField
                    label="Apellido Materno"
                    value={getApellidoMaternoDisplay()}
                  />
                  <InfoField
                    label="Nacionalidad"
                    icon={Globe}
                    value={getNacionalidadNombre()}
                  />
                  <div className="col-span-2">
                    <InfoField label="Etnia" value={getEtniaNombre()} />
                  </div>
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fechas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <InfoField
                    label="Fecha de Inscripción"
                    value={formatFecha(
                      usuario.fechaInscripcion || usuario.fechaSolicitud
                    )}
                  />
                  <InfoField
                    label="Periodo"
                    value={
                      usuario.periodoStr ||
                      `${usuario.periodoMes}/${usuario.periodoAnio}`
                    }
                  />
                  <InfoField
                    label="Fecha de Registro"
                    value={formatFecha(usuario.creadoEl)}
                  />
                  {usuario.modificadoEl && (
                    <InfoField
                      label="Última Modificación"
                      value={formatFecha(usuario.modificadoEl)}
                    />
                  )}
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
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoField
                      label="Centro de Salud"
                      value={usuario.centro || "No especificado"}
                    />
                  </div>
                  <div className="col-span-2">
                    <InfoField
                      label="Establecimiento"
                      icon={Building2}
                      value={getEstablecimientoNombre()}
                    />
                  </div>
                  <InfoField label="Sector" value={getSectorNombre()} />
                  <InfoField
                    label="Código Sector"
                    value={usuario.codigoSector || "N/A"}
                    mono
                  />
                  <InfoField label="Subsector" value={getSubsectorNombre()} />
                  <InfoField
                    label="Cód. Percápita"
                    value={usuario.codigoPercapita || "N/A"}
                    mono
                  />
                </CardContent>
              </Card>

              {/* Observaciones */}
              {usuario.observaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Observaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {usuario.observaciones}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna Derecha: Información HP Trakcare */}
            <div className="space-y-4">
              <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Información HP Trakcare
                    </CardTitle>
                    {loadingTrakcare && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {loadingTrakcare ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : trakcareError ? (
                    <Alert variant="destructive">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{trakcareError}</AlertDescription>
                    </Alert>
                  ) : !trakcareData ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No se encontraron datos en HP Trakcare para este RUN
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6">
                      {/* Datos Personales Trakcare */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                          <User className="w-4 h-4" />
                          Datos Personales
                        </h4>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                          <div className="col-span-2">
                            <InfoField
                              label="Nombre Completo"
                              value={
                                `${trakcareData.nombre || ""} ${
                                  trakcareData.apPaterno || ""
                                } ${trakcareData.apMaterno || ""}`.trim() ||
                                "N/A"
                              }
                            />
                          </div>
                          <InfoField
                            label="Género"
                            value={trakcareData.genero || "N/A"}
                          />
                          <InfoField
                            label="Edad"
                            value={
                              trakcareData.edad
                                ? `${trakcareData.edad} años`
                                : "N/A"
                            }
                          />
                          <div className="col-span-2">
                            <InfoField
                              label="Fecha Nacimiento"
                              value={
                                trakcareData.fechaNacimiento
                                  ? formatFecha(trakcareData.fechaNacimiento)
                                  : "N/A"
                              }
                            />
                          </div>
                          <InfoField
                            label="Nacionalidad"
                            value={trakcareData.nacionalidad || "N/A"}
                          />
                          <InfoField
                            label="Etnia"
                            value={trakcareData.etnia || "N/A"}
                          />
                        </div>
                      </div>

                      {/* Contacto */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                          <Phone className="w-4 h-4" />
                          Contacto
                        </h4>
                        <div className="space-y-4 pl-6">
                          <div className="col-span-2">
                            <InfoField
                              label="Dirección"
                              value={trakcareData.direccion || "N/A"}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <InfoField
                              label="Teléfono"
                              value={trakcareData.telefono || "N/A"}
                              mono
                            />
                            <InfoField
                              label="Celular"
                              value={trakcareData.telefonoCelular || "N/A"}
                              mono
                            />
                          </div>
                          <InfoField
                            label="Teléfono Recado"
                            value={trakcareData.TelefonoRecado || "N/A"}
                            mono
                          />
                        </div>
                      </div>

                      {/* Información de Salud */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                          <Heart className="w-4 h-4" />
                          Información de Salud
                        </h4>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                          <div className="col-span-2">
                            <InfoField
                              label="Servicio de Salud"
                              value={trakcareData.servicioSalud || "N/A"}
                            />
                          </div>
                          <div className="col-span-2">
                            <InfoField
                              label="Centro Inscripción"
                              value={trakcareData.centroInscripcion || "N/A"}
                            />
                          </div>
                          <InfoField
                            label="Sector"
                            value={trakcareData.sector || "N/A"}
                          />
                          <InfoField
                            label="Previsión"
                            value={trakcareData.prevision || "N/A"}
                          />
                          <InfoField
                            label="Plan Trakcare"
                            value={trakcareData.planTrakcare || "N/A"}
                          />
                          <InfoField
                            label="PRAIS"
                            value={trakcareData.praisTrakcare || "N/A"}
                          />
                        </div>
                      </div>

                      {/* Fechas del Sistema */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                          <Calendar className="w-4 h-4" />
                          Fechas del Sistema
                        </h4>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                          <InfoField
                            label="Fecha Incorporación"
                            value={
                              trakcareData.fechaIncorporacion
                                ? formatFecha(trakcareData.fechaIncorporacion)
                                : "N/A"
                            }
                          />
                          <InfoField
                            label="Última Modificación"
                            value={
                              trakcareData.fechaUltimaModif
                                ? formatFecha(trakcareData.fechaUltimaModif)
                                : "N/A"
                            }
                          />
                          {trakcareData.fechaDefuncion && (
                            <div className="col-span-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                              <InfoField
                                label="Fecha Defunción"
                                value={formatFecha(trakcareData.fechaDefuncion)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Familia */}
        <TabsContent value="familia" className="space-y-4 mt-4">
          {loadingTrakcare ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ) : !trakcareData ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No hay información familiar disponible. Los datos de familia se
                obtienen desde HP Trakcare.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información Familiar */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Información Familiar
                  </CardTitle>
                  <CardDescription>
                    Datos del grupo familiar registrado en Trakcare
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoField
                      label="Código Familia"
                      value={trakcareData.codFamilia || "No disponible"}
                      mono
                    />
                  </div>
                  <div className="col-span-2">
                    <InfoField
                      label="Relación Parentesco"
                      value={
                        trakcareData.relacionParentezco || "No especificado"
                      }
                    />
                  </div>
                  <InfoField
                    label="ID Trakcare"
                    value={trakcareData.idTrakcare || "N/A"}
                    mono
                  />
                  <InfoField
                    label="Cód. Registro"
                    value={trakcareData.codRegistro || "N/A"}
                    mono
                  />
                </CardContent>
              </Card>

              {/* Placeholder para futuros miembros de familia */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Miembros del Grupo Familiar
                  </CardTitle>
                  <CardDescription>
                    Información de otros miembros registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      La información detallada de otros miembros del grupo
                      familiar estará disponible próximamente.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab Revisión */}
        <TabsContent value="revision" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Estado de Revisión y Checklist HP Trakcare
              </CardTitle>
              <CardDescription>
                Marcar como revisado después de verificar los datos del usuario
                en HP Trakcare y completar el checklist de validación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevisionPanel
                usuario={usuario}
                onMarcarRevisado={handleMarcarRevisado}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Historial */}
        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Historial Completo de Registros
              </CardTitle>
              <CardDescription>
                Seguimiento mensual mostrando validaciones, rechazos,
                inscripciones y ausencias en cortes FONASA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistorial ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : historial.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No hay registros históricos disponibles para este usuario en
                    los cortes subidos
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {/* Leyenda */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <span className="text-xs font-medium">Leyenda:</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs">Mantiene inscripción</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs">Rechazado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs">Nuevo (inscrito)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs">Ausente</span>
                    </div>
                  </div>

                  {/* Lista de registros */}
                  {historial.map((registro) => {
                    const isValidado = registro.estado === "VALIDADO";
                    const isRechazado = registro.estado === "RECHAZADO";
                    const isInscripcion = registro.estado === "INSCRIPCION";
                    const isAusente = registro.estado === "AUSENTE";
                    const estadoAceptacion = (
                      registro.aceptadoRechazado || ""
                    ).toUpperCase();
                    const isAceptadoDestino =
                      estadoAceptacion.startsWith("ACEPTADO");

                    return (
                      <div
                        key={`${registro.anio}-${registro.mes}`}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          isValidado
                            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                            : isRechazado
                            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                            : isInscripcion
                            ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                            : "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Icono */}
                            <div className="mt-0.5">
                              {isValidado ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              ) : isRechazado ? (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                              ) : isInscripcion ? (
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              )}
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                              {/* Encabezado */}
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-base">
                                  {registro.mesStr}
                                </span>
                                <Badge
                                  variant={
                                    isValidado
                                      ? "default"
                                      : isRechazado
                                      ? "destructive"
                                      : isInscripcion
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    isValidado
                                      ? "bg-green-600 hover:bg-green-700"
                                      : isRechazado
                                      ? "bg-red-600 hover:bg-red-700"
                                      : isInscripcion
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-gray-400 hover:bg-gray-500"
                                  }
                                >
                                  {registro.estado}
                                </Badge>
                                {isValidado && registro.validadoManualmente && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800 border-green-300"
                                  >
                                    Validado
                                  </Badge>
                                )}
                              </div>

                              {/* Detalles */}
                              {(isValidado || isRechazado) && (
                                <>
                                  {/* Timeline Vertical - Centros de Salud (Prominente) */}
                                  {(registro.centroDeProcedencia ||
                                    registro.centroActual) && (
                                    <div className="mb-4">
                                      <div className="relative">
                                        {/* Línea vertical conectora */}
                                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-400 via-gray-300 to-green-500 dark:from-amber-500 dark:via-gray-600 dark:to-green-400"></div>

                                        <div className="space-y-4">
                                          {/* Centro de Procedencia */}
                                          {registro.centroDeProcedencia && (
                                            <div className="relative flex gap-4">
                                              {/* Punto indicador */}
                                              <div className="relative z-10 flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 flex items-center justify-center shadow-lg">
                                                  <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                              </div>

                                              {/* Contenido */}
                                              <div className="flex-1 pt-1">
                                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-md">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                                                      ORIGEN
                                                    </Badge>
                                                    <span className="text-xs font-medium text-amber-900 dark:text-amber-100">
                                                      Centro de Procedencia
                                                    </span>
                                                  </div>
                                                  <h4 className="text-base font-bold text-amber-950 dark:text-amber-50 mb-2">
                                                    {
                                                      registro.centroDeProcedencia
                                                    }
                                                  </h4>
                                                  {registro.comunaDeProcedencia && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                      <MapPinned className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                                      <span className="text-amber-800 dark:text-amber-200">
                                                        <span className="font-semibold">
                                                          Comuna:
                                                        </span>{" "}
                                                        {
                                                          registro.comunaDeProcedencia
                                                        }
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {/* Centro Actual */}
                                          {registro.centroActual && (
                                            <div className="relative flex gap-4">
                                              {/* Punto indicador */}
                                              <div className="relative z-10 flex-shrink-0">
                                                <div
                                                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                                    isValidado
                                                      ? "bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"
                                                      : "bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700"
                                                  }`}
                                                >
                                                  <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                              </div>

                                              {/* Contenido */}
                                              <div className="flex-1 pt-1">
                                                <div
                                                  className={`rounded-xl p-4 shadow-md border-2 ${
                                                    isValidado
                                                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700"
                                                      : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-300 dark:border-red-700"
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                      className={
                                                        isValidado
                                                          ? "bg-green-600 hover:bg-green-700 text-white"
                                                          : "bg-red-600 hover:bg-red-700 text-white"
                                                      }
                                                    >
                                                      DESTINO
                                                    </Badge>
                                                    <span
                                                      className={`text-xs font-medium ${
                                                        isValidado
                                                          ? "text-green-900 dark:text-green-100"
                                                          : "text-red-900 dark:text-red-100"
                                                      }`}
                                                    >
                                                      Centro Actual
                                                    </span>
                                                    {registro.aceptadoRechazado && (
                                                      <Badge
                                                        variant={
                                                          isAceptadoDestino
                                                            ? "default"
                                                            : "destructive"
                                                        }
                                                        className={
                                                          isAceptadoDestino
                                                            ? "bg-green-700 hover:bg-green-800"
                                                            : "bg-red-700 hover:bg-red-800"
                                                        }
                                                      >
                                                        {
                                                          registro.aceptadoRechazado
                                                        }
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <h4
                                                    className={`text-base font-bold mb-2 ${
                                                      isValidado
                                                        ? "text-green-950 dark:text-green-50"
                                                        : "text-red-950 dark:text-red-50"
                                                    }`}
                                                  >
                                                    {registro.centroActual}
                                                  </h4>
                                                  {registro.comunaActual && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                      <MapPinned
                                                        className={`w-4 h-4 ${
                                                          isValidado
                                                            ? "text-green-700 dark:text-green-300"
                                                            : "text-red-700 dark:text-red-300"
                                                        }`}
                                                      />
                                                      <span
                                                        className={
                                                          isValidado
                                                            ? "text-green-800 dark:text-green-200"
                                                            : "text-red-800 dark:text-red-200"
                                                        }
                                                      >
                                                        <span className="font-semibold">
                                                          Comuna:
                                                        </span>{" "}
                                                        {registro.comunaActual}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Información Adicional */}
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mt-3 pt-3 border-t border-current/10">
                                    {!registro.centroDeProcedencia &&
                                      !registro.centroActual && (
                                        <div>
                                          <span className="text-muted-foreground">
                                            Centro:{" "}
                                          </span>
                                          <span className="font-medium">
                                            {registro.centro || "N/A"}
                                          </span>
                                        </div>
                                      )}
                                    {registro.tramo && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Tramo:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {registro.tramo}
                                        </span>
                                      </div>
                                    )}
                                    {registro.genero && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Género:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {registro.genero}
                                        </span>
                                      </div>
                                    )}
                                    {registro.motivo && (
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">
                                          Motivo:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {registro.motivo}
                                        </span>
                                      </div>
                                    )}
                                    {registro.fechaCorte && (
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">
                                          Fecha Corte:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {formatFecha(registro.fechaCorte)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {isInscripcion && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                  {registro.centro && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Centro:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {registro.centro}
                                      </span>
                                    </div>
                                  )}
                                  {registro.establecimiento && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Establecimiento:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {registro.establecimiento}
                                      </span>
                                    </div>
                                  )}
                                  {registro.sector && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Sector:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {registro.sector}
                                      </span>
                                    </div>
                                  )}
                                  {registro.codigoPercapita && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Cód. Percápita:{" "}
                                      </span>
                                      <span className="font-medium font-mono">
                                        {registro.codigoPercapita}
                                      </span>
                                    </div>
                                  )}
                                  {registro.fechaInscripcion && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Fecha Inscripción:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {formatFecha(registro.fechaInscripcion)}
                                      </span>
                                    </div>
                                  )}
                                  {registro.observaciones && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">
                                        Observaciones:{" "}
                                      </span>
                                      <span className="font-medium text-xs">
                                        {registro.observaciones}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {isAusente && (
                                <p className="text-sm text-muted-foreground">
                                  El usuario no aparece en el corte de este mes
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
