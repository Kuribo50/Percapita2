"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  ClockIcon,
  RefreshCw,
  Loader2,
  Search,
  X,
  FileDown,
  Copy,
  Info,
} from "lucide-react";
import { formatRut, handleRutInput, validateRut } from "@/lib/utils";
import EditUsuarioModal from "@/components/nuevos-usuarios/EditUsuarioModal";
import { validarUsuariosEnMasa } from "@/lib/validacionUsuarios";
import { useNuevosUsuarios, useCatalogos } from "@/lib/hooks";
import { NuevoUsuario } from "@/types";
import { toast } from "sonner";
import { useSelectedNuevoUsuario } from "@/contexts/SelectedNuevoUsuarioContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GestionNuevosUsuariosPage() {
  // Custom hooks para data y lógica
  const {
    usuarios,
    estadisticas: estadisticasHoy,
    loading,
    fetchUsuarios,
  } = useNuevosUsuarios();
  const router = useRouter();
  const { setSelectedNuevoUsuario, clearSelectedNuevoUsuario } =
    useSelectedNuevoUsuario();

  const { etnias, nacionalidades, sectores, subsectores, establecimientos } =
    useCatalogos();

  // Estados del formulario
  const [formData, setFormData] = useState({
    run: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaInscripcion: new Date().toISOString().split("T")[0],
    nacionalidad: "",
    etnia: "",
    sector: "",
    codigoSector: "",
    subsector: "",
    codigoPercapita: "",
    centro: "",
    establecimiento: "",
    observaciones: "",
  });

  // Estados de la aplicación
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState<string | null>(
    null
  );

  // Estados para búsqueda
  const [searchRun, setSearchRun] = useState("");
  const [searchNombre, setSearchNombre] = useState("");
  const [soloRutsInvalidos, setSoloRutsInvalidos] = useState(false);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina, setUsuariosPorPagina] = useState(10);

  // Estados para modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<NuevoUsuario | null>(
    null
  );

  // Estados para exportación
  const [fechaInicioExport, setFechaInicioExport] = useState("");
  const [fechaFinExport, setFechaFinExport] = useState("");
  const [establecimientoExport, setEstablecimientoExport] = useState("todos");
  const [exportando, setExportando] = useState(false);

  // useEffect para resetear paginación cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchRun, searchNombre, soloRutsInvalidos, usuariosPorPagina]);

  // Handlers de formulario
  const handleRutChange = (value: string) => {
    const cleaned = handleRutInput(value);
    const formatted = formatRut(cleaned);
    setFormData({ ...formData, run: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateRut(formData.run)) {
      setError("RUT inválido");
      return;
    }

    if (!formData.nombres.trim() || !formData.apellidoPaterno.trim()) {
      setError("El nombre y apellido paterno son requeridos");
      return;
    }

    try {
      setSaving(true);

      // Extraer el mes y año desde la fecha de inscripción ingresada
      const fechaInsc = new Date(formData.fechaInscripcion);
      const mesInscripcion = fechaInsc.getMonth() + 1;
      const anioInscripcion = fechaInsc.getFullYear();

      const payload = {
        ...formData,
        run: formatRut(formData.run),
        periodoMes: mesInscripcion,
        periodoAnio: anioInscripcion,
      };

      const response = await fetch(`${API_URL}/api/nuevos-usuarios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al registrar usuario");
      }

      setSuccess("Usuario registrado exitosamente");

      setFormData({
        run: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaInscripcion: new Date().toISOString().split("T")[0],
        nacionalidad: "",
        etnia: "",
        sector: "",
        codigoSector: "",
        subsector: "",
        codigoPercapita: "",
        centro: "",
        establecimiento: "",
        observaciones: "",
      });

      fetchUsuarios();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar usuario"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNacionalidadNombre = (id?: number) => {
    if (!id) return "N/A";
    const nac = nacionalidades.find((n) => n.id === id);
    return nac?.nombre || "N/A";
  };

  const getSectorNombre = (id?: number) => {
    if (!id) return "N/A";
    const sec = sectores.find((s) => s.id === id);
    return sec?.nombre || "N/A";
  };

  const getSectorClass = (id?: number) => {
    if (!id)
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 uppercase text-xs";
    const sec = sectores.find((s) => s.id === id);
    const nombre = sec?.nombre?.toUpperCase() || "";

    if (nombre.includes("COCHOLQUE")) {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 uppercase text-xs";
    }
    if (nombre.includes("CENTENARIO")) {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 uppercase text-xs";
    }
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 uppercase text-xs";
  };

  const handleViewUsuario = (usuario: NuevoUsuario) => {
    if (!usuario.id) {
      toast.error("No se encontró el identificador del usuario");
      return;
    }
    setSelectedNuevoUsuario({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      estado: usuario.estado,
    });
    router.push(`/dashboard/revision-de-usuarios/nuevos-usuarios/gestion/${usuario.id}`);
  };

  const handleEditUsuario = (usuario: NuevoUsuario) => {
    setSelectedUsuario(usuario);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUsuarios();
    setEditModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleCopiarRut = async (rut: string) => {
    try {
      await navigator.clipboard.writeText(rut);
      toast.success("RUT copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el RUT");
    }
  };

  useEffect(() => {
    clearSelectedNuevoUsuario();
  }, [clearSelectedNuevoUsuario]);

  // Función para exportar usuarios a Excel
  const handleExportar = async () => {
    try {
      setExportando(true);
      setError(null);

      // Construir parámetros de consulta
      const params = new URLSearchParams();
      if (fechaInicioExport) params.append("fecha_inicio", fechaInicioExport);
      if (fechaFinExport) params.append("fecha_fin", fechaFinExport);
      if (establecimientoExport && establecimientoExport !== "todos") {
        params.append("establecimiento", establecimientoExport);
      }

      const url = `${API_URL}/api/nuevos-usuarios/exportar/?${params.toString()}`;
      console.log("URL de exportación:", url);

      // Hacer petición al backend sin el header Accept específico
      const response = await fetch(url, {
        method: "GET",
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      console.log("Content-Type:", response.headers.get("Content-Type"));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Error al exportar datos: ${response.status} - ${errorText}`
        );
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      console.log("Blob size:", blob.size);

      // Crear URL temporal para descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `nuevos_usuarios_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setSuccess("¡Archivo exportado exitosamente!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error al exportar:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al exportar datos. Por favor, intente nuevamente."
      );
    } finally {
      setExportando(false);
    }
  };

  // Validar todos los usuarios automáticamente
  const handleValidarTodos = async () => {
    if (usuarios.length === 0) {
      setMensajeValidacion("No hay usuarios para validar");
      setTimeout(() => setMensajeValidacion(null), 3000);
      return;
    }

    setValidando(true);
    setMensajeValidacion(`Validando ${usuarios.length} usuarios...`);

    try {
      const resultado = await validarUsuariosEnMasa(usuarios);

      // Actualizar la lista de usuarios con los nuevos estados
      if (resultado.totalActualizados > 0) {
        await fetchUsuarios();
        setMensajeValidacion(
          `✓ Validación completada: ${resultado.totalActualizados} de ${resultado.totalValidados} usuarios actualizados`
        );
      } else {
        setMensajeValidacion("✓ Todos los usuarios ya están actualizados");
      }

      setTimeout(() => setMensajeValidacion(null), 5000);
    } catch (err) {
      console.error("Error al validar usuarios:", err);
      setMensajeValidacion(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Error al validar usuarios"
      );
      setTimeout(() => setMensajeValidacion(null), 5000);
    } finally {
      setValidando(false);
    }
  };

  // Función para filtrar usuarios
  const filtrarUsuarios = (listaUsuarios: NuevoUsuario[]) => {
    return listaUsuarios.filter((usuario) => {
      const matchRun =
        searchRun.trim() === "" ||
        usuario.run
          .toLowerCase()
          .includes(searchRun.toLowerCase().replace(/[.\s-]/g, ""));
      const matchNombre =
        searchNombre.trim() === "" ||
        usuario.nombreCompleto
          .toLowerCase()
          .includes(searchNombre.toLowerCase());
      const matchRutValido =
        !soloRutsInvalidos || !validateRut(usuario.run || "");
      return matchRun && matchNombre && matchRutValido;
    });
  };

  // Función para ordenar usuarios (más recientes primero)
  const ordenarUsuarios = (listaUsuarios: NuevoUsuario[]) => {
    return [...listaUsuarios].sort((a, b) => {
      const fechaA = new Date(a.creadoEl || 0).getTime();
      const fechaB = new Date(b.creadoEl || 0).getTime();
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });
  };

  // Función para paginar usuarios
  const paginarUsuarios = (
    listaUsuarios: NuevoUsuario[],
    pagina: number,
    porPagina: number
  ) => {
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    return listaUsuarios.slice(inicio, fin);
  };

  // Preparar catalogos para los modales
  const catalogos = {
    etnias: etnias.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      codigo: e.codigo,
      activo: e.activo,
    })),
    nacionalidades: nacionalidades.map((n) => ({
      id: n.id,
      nombre: n.nombre,
      codigo: n.codigo,
      activo: n.activo,
    })),
    sectores: sectores.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      codigo: s.codigo,
      activo: s.activo,
    })),
    subsectores: subsectores.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      codigo: s.codigo,
      activo: s.activo,
    })),
    establecimientos: establecimientos.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      codigo: e.codigo,
      activo: e.activo,
    })),
  };

  // Función para renderizar la tabla de usuarios
  const renderTablaUsuarios = (usuariosLista: NuevoUsuario[], tipo: string) => {
    // Ordenar usuarios (más recientes primero)
    const usuariosOrdenados = ordenarUsuarios(usuariosLista);

    // Filtrar usuarios
    const usuariosFiltrados = filtrarUsuarios(usuariosOrdenados);
    const hayFiltros =
      searchRun.trim() !== "" ||
      searchNombre.trim() !== "" ||
      soloRutsInvalidos;

    // Calcular paginación
    const totalPaginas = Math.ceil(
      usuariosFiltrados.length / usuariosPorPagina
    );
    const usuariosPaginados = paginarUsuarios(
      usuariosFiltrados,
      paginaActual,
      usuariosPorPagina
    );

    return (
      <>
        {/* Buscadores y controles */}
        <div className="mb-6 space-y-4">
          {/* Buscadores */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por RUN..."
                value={searchRun}
                onChange={(e) => {
                  setSearchRun(e.target.value);
                }}
                className="pl-10 bg-white dark:bg-gray-900/50"
              />
              {searchRun && (
                <button
                  onClick={() => {
                    setSearchRun("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchNombre}
                onChange={(e) => {
                  setSearchNombre(e.target.value);
                }}
                className="pl-10 bg-white dark:bg-gray-900/50"
              />
              {searchNombre && (
                <button
                  onClick={() => {
                    setSearchNombre("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro de RUTs inválidos */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="soloRutsInvalidos"
              checked={soloRutsInvalidos}
              onChange={(e) => {
                setSoloRutsInvalidos(e.target.checked);
              }}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="soloRutsInvalidos"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              Mostrar solo RUTs inválidos
            </label>
          </div>

          {/* Controles de paginación y resultados */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hayFiltros ? (
                <>
                  {usuariosFiltrados.length} resultado
                  {usuariosFiltrados.length !== 1 ? "s" : ""} encontrado
                  {usuariosFiltrados.length !== 1 ? "s" : ""}
                  {usuariosFiltrados.length < usuariosLista.length &&
                    ` de ${usuariosLista.length} total`}
                </>
              ) : (
                <>
                  Mostrando{" "}
                  {Math.min(usuariosPaginados.length, usuariosFiltrados.length)}{" "}
                  de {usuariosFiltrados.length} usuarios
                </>
              )}
            </div>

            {/* Selector de usuarios por página */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mostrar:
              </span>
              <Select
                value={usuariosPorPagina.toString()}
                onValueChange={(value) => {
                  setUsuariosPorPagina(Number(value));
                }}
              >
                <SelectTrigger className="w-24 bg-white dark:bg-gray-900/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800/50">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                  {tipo === "Listado" && (
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    RUN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Código Percápita
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nacionalidad
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Inscripción
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td
                        colSpan={tipo === "Listado" ? 9 : 8}
                        className="py-4 px-4"
                      >
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : usuariosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tipo === "Listado" ? 9 : 8}
                      className="py-12 text-center"
                    >
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {hayFiltros
                          ? "No se encontraron resultados"
                          : "No hay usuarios para mostrar"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {hayFiltros
                          ? "Intenta con otros términos de búsqueda"
                          : tipo === "Listado"
                          ? "Registra nuevos usuarios para verlos aquí"
                          : `No hay usuarios ${tipo.toLowerCase()}`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuariosPaginados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewUsuario(usuario)}
                            className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditUsuario(usuario)}
                            className="h-8 w-8 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      {tipo === "Listado" && (
                        <td className="py-3 px-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant="outline"
                                    className={
                                      usuario.estado === "VALIDADO"
                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 uppercase text-xs"
                                        : usuario.estado === "NO_VALIDADO"
                                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 uppercase text-xs"
                                        : usuario.estado === "FALLECIDO"
                                        ? "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/40 dark:text-gray-200 uppercase text-xs"
                                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 uppercase text-xs"
                                    }
                                  >
                                    {usuario.estado === "VALIDADO"
                                      ? "Validado"
                                      : usuario.estado === "NO_VALIDADO"
                                      ? "No Validado"
                                      : usuario.estado === "FALLECIDO"
                                      ? "Fallecido"
                                      : "Pendiente"}
                                  </Badge>
                                  {usuario.infoValidacion && (
                                    <Info className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              {usuario.infoValidacion && (
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-2">
                                    {usuario.infoValidacion
                                      .aceptadoRechazado && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          Estado FONASA:
                                        </p>
                                        <p className="text-sm font-medium">
                                          {
                                            usuario.infoValidacion
                                              .aceptadoRechazado
                                          }
                                        </p>
                                      </div>
                                    )}
                                    {usuario.infoValidacion.motivo && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          Motivo:
                                        </p>
                                        <p className="text-sm">
                                          {usuario.infoValidacion.motivo}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            {usuario.run}
                          </span>
                          {!validateRut(usuario.run || "") && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm font-semibold">
                                    RUT Inválido
                                  </p>
                                  <p className="text-xs">
                                    El dígito verificador no es correcto
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopiarRut(usuario.run || "")}
                            className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            title="Copiar RUT"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {usuario.nombreCompleto}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={getSectorClass(
                            typeof usuario.sector === "number"
                              ? usuario.sector
                              : undefined
                          )}
                        >
                          {getSectorNombre(
                            typeof usuario.sector === "number"
                              ? usuario.sector
                              : undefined
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {usuario.codigoPercapita || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 uppercase text-xs"
                        >
                          {getNacionalidadNombre(
                            typeof usuario.nacionalidad === "number"
                              ? usuario.nacionalidad
                              : undefined
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatFecha(usuario.fechaInscripcion || "")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatFecha(usuario.creadoEl || "")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Controles de paginación inferior */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginaActual} de {totalPaginas}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
                className="px-3"
              >
                Primera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3"
              >
                Anterior
              </Button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {[...Array(totalPaginas)].map((_, index) => {
                  const numeroPagina = index + 1;
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numeroPagina === 1 ||
                    numeroPagina === totalPaginas ||
                    (numeroPagina >= paginaActual - 1 &&
                      numeroPagina <= paginaActual + 1)
                  ) {
                    return (
                      <Button
                        key={numeroPagina}
                        variant={
                          paginaActual === numeroPagina ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPaginaActual(numeroPagina)}
                        className={`w-10 ${
                          paginaActual === numeroPagina
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : ""
                        }`}
                      >
                        {numeroPagina}
                      </Button>
                    );
                  } else if (
                    numeroPagina === paginaActual - 2 ||
                    numeroPagina === paginaActual + 2
                  ) {
                    return (
                      <span key={numeroPagina} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3"
              >
                Siguiente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="px-3"
              >
                Última
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Pantalla de carga para validación */}
      {validando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Spinner animado */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>

              {/* Título */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Validando Usuarios
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mensajeValidacion || "Procesando..."}
                </p>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 w-full">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Validación en proceso
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Estamos verificando los estados de {usuarios.length}{" "}
                      usuarios contra la base de datos de FONASA. Este proceso
                      puede tardar unos segundos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicador de progreso */}
              <div className="w-full">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Header con título grande */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">
                Usuarios Nuevos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Registro e inscripción de nuevos usuarios en el sistema de salud
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleValidarTodos}
                disabled={validando || usuarios.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {validando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Validar Estados
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mensaje de validación */}
          {mensajeValidacion && (
            <div className="mt-4">
              <Alert
                className={`${
                  mensajeValidacion.includes("Error")
                    ? "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800"
                    : "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{mensajeValidacion}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Estadísticas con barras de color */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-purple-500 to-purple-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.total}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-blue-500 to-blue-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Hoy
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.hoy}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-cyan-500 to-cyan-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Este Mes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.mes}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-amber-500 to-amber-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Pendientes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.pendientes}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Eye className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-green-500 to-green-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Validados
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.validados}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-red-500 to-red-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    No Validados
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.noValidados}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-gray-400 to-gray-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Fallecidos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticasHoy.fallecidos}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="h-1 bg-linear-to-r from-orange-500 to-orange-600"></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    RUTs Inválidos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {usuarios.filter((u) => !validateRut(u.run || "")).length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs principales */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50">
          <Tabs defaultValue="registro" className="p-6">
            <TabsList className="bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="registro"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <UserPlus className="w-4 h-4" />
                Nuevo Usuario
              </TabsTrigger>
              <TabsTrigger
                value="listado"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <Users className="w-4 h-4" />
                Listado ({usuarios.length})
              </TabsTrigger>
              <TabsTrigger
                value="validados"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <CheckCircle className="w-4 h-4" />
                Validados ({estadisticasHoy.validados})
              </TabsTrigger>
              <TabsTrigger
                value="pendientes"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <ClockIcon className="w-4 h-4" />
                Pendientes ({estadisticasHoy.pendientes})
              </TabsTrigger>
              <TabsTrigger
                value="noValidados"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <XCircle className="w-4 h-4" />
                No Validados ({estadisticasHoy.noValidados})
              </TabsTrigger>
              <TabsTrigger
                value="fallecidos"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <AlertCircle className="w-4 h-4" />
                Fallecidos ({estadisticasHoy.fallecidos})
              </TabsTrigger>
              <TabsTrigger
                value="exportar"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-4 py-2"
              >
                <FileDown className="w-4 h-4" />
                Exportar
              </TabsTrigger>
            </TabsList>

            {/* Tab de Registro */}
            <TabsContent value="registro" className="space-y-0 mt-0">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Registro de Nuevo Usuario
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete todos los campos para registrar un nuevo usuario
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 text-green-900 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* Fecha de Inscripción */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="fechaInscripcion"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Fecha de Inscripción
                    </Label>
                    <Input
                      id="fechaInscripcion"
                      type="date"
                      value={formData.fechaInscripcion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaInscripcion: e.target.value,
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                      required
                    />
                  </div>

                  {/* RUN/NIP */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="run"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      RUN/NIP
                    </Label>
                    <Input
                      id="run"
                      placeholder="41.349.643-8"
                      value={formData.run}
                      onChange={(e) => handleRutChange(e.target.value)}
                      maxLength={12}
                      className="bg-white dark:bg-gray-900/50"
                      required
                    />
                  </div>

                  {/* Nacionalidad */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="nacionalidad"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Nacionalidad
                    </Label>
                    <Select
                      value={formData.nacionalidad}
                      onValueChange={(value) =>
                        setFormData({ ...formData, nacionalidad: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {nacionalidades.map((nac) => (
                          <SelectItem key={nac.id} value={nac.id.toString()}>
                            {nac.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Etnia */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="etnia"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Etnia
                    </Label>
                    <Select
                      value={formData.etnia}
                      onValueChange={(value) =>
                        setFormData({ ...formData, etnia: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {etnias.map((etnia) => (
                          <SelectItem
                            key={etnia.id}
                            value={etnia.id.toString()}
                          >
                            {etnia.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nombres y Apellidos */}
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="nombres"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Nombres
                    </Label>
                    <Input
                      id="nombres"
                      placeholder="JUAN CARLOS"
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombres: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="apellidoPaterno"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Apellido Paterno
                    </Label>
                    <Input
                      id="apellidoPaterno"
                      placeholder="GONZÁLEZ"
                      value={formData.apellidoPaterno}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidoPaterno: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="apellidoMaterno"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Apellido Materno
                    </Label>
                    <Input
                      id="apellidoMaterno"
                      placeholder="APONTE"
                      value={formData.apellidoMaterno}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidoMaterno: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* Sector */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="sector"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Sector
                    </Label>
                    <Select
                      value={formData.sector}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sector: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectores.map((sector) => (
                          <SelectItem
                            key={sector.id}
                            value={sector.id.toString()}
                          >
                            {sector.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Código de Sector */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="codigoSector"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Código Sector
                    </Label>
                    <Input
                      id="codigoSector"
                      placeholder="U1, R2, etc."
                      value={formData.codigoSector}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoSector: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                    />
                  </div>

                  {/* Subsector */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="subsector"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Subsector
                    </Label>
                    <Select
                      value={formData.subsector}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subsector: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {subsectores.map((subsector) => (
                          <SelectItem
                            key={subsector.id}
                            value={subsector.id.toString()}
                          >
                            {subsector.nombre}{" "}
                            {subsector.sectorNombre &&
                              `(${subsector.sectorNombre})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Centro de Salud */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="centro"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Centro de Salud
                    </Label>
                    <Input
                      id="centro"
                      placeholder="CESFAM Norte, Centro Salud, etc."
                      value={formData.centro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          centro: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* Código Percápita */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="codigoPercapita"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Código Percápita
                    </Label>
                    <Input
                      id="codigoPercapita"
                      placeholder="CARR6000617"
                      value={formData.codigoPercapita}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoPercapita: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-white dark:bg-gray-900/50"
                    />
                  </div>

                  {/* Establecimiento */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="establecimiento"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Establecimiento
                    </Label>
                    <Select
                      value={formData.establecimiento}
                      onValueChange={(value) =>
                        setFormData({ ...formData, establecimiento: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {establecimientos.map((est) => (
                          <SelectItem key={est.id} value={est.id.toString()}>
                            {est.nombre} {est.tipo && `(${est.tipo})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label
                    htmlFor="observaciones"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    rows={3}
                    className="bg-white dark:bg-gray-900/50 resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        run: "",
                        nombres: "",
                        apellidoPaterno: "",
                        apellidoMaterno: "",
                        fechaInscripcion: new Date()
                          .toISOString()
                          .split("T")[0],
                        nacionalidad: "",
                        etnia: "",
                        sector: "",
                        codigoSector: "",
                        subsector: "",
                        codigoPercapita: "",
                        centro: "",
                        establecimiento: "",
                        observaciones: "",
                      })
                    }
                    className="px-6"
                  >
                    Limpiar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {saving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Registrar Usuario
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Tab de Listado Completo */}
            <TabsContent value="listado" className="space-y-0 mt-0">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Todos los Usuarios Registrados
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {usuarios.length} usuarios encontrados
                </p>
              </div>
              {renderTablaUsuarios(usuarios, "Listado")}
            </TabsContent>

            {/* Tab de Validados */}
            <TabsContent value="validados" className="space-y-0 mt-0">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Usuarios Validados
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {estadisticasHoy.validados} usuarios validados
                </p>
              </div>
              {renderTablaUsuarios(
                usuarios.filter((u) => u.estado === "VALIDADO"),
                "Validados"
              )}
            </TabsContent>

            {/* Tab de Pendientes */}
            <TabsContent value="pendientes" className="space-y-0 mt-0">
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Usuarios Pendientes de Validación
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {estadisticasHoy.pendientes} usuarios pendientes de revisión
                </p>
              </div>
              {renderTablaUsuarios(
                usuarios.filter((u) => u.estado === "PENDIENTE"),
                "Pendientes"
              )}
            </TabsContent>

            {/* Tab de No Validados */}
            <TabsContent value="noValidados" className="space-y-0 mt-0">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Usuarios No Validados
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {estadisticasHoy.noValidados} usuarios no validados
                </p>
              </div>
              {renderTablaUsuarios(
                usuarios.filter((u) => u.estado === "NO_VALIDADO"),
                "No Validados"
              )}
            </TabsContent>

            {/* Tab de Fallecidos */}
            <TabsContent value="fallecidos" className="space-y-0 mt-0">
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Usuarios Reportados como Fallecidos
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {estadisticasHoy.fallecidos} usuarios marcados como fallecidos
                  en el último corte
                </p>
              </div>
              {renderTablaUsuarios(
                usuarios.filter((u) => u.estado === "FALLECIDO"),
                "Fallecidos"
              )}
            </TabsContent>

            {/* Tab de Exportación */}
            <TabsContent value="exportar" className="space-y-0 mt-0">
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Exportar Usuarios a Excel
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecciona los filtros y descarga los datos en formato Excel
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 text-green-900 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Filtros de Exportación
                  </h3>

                  <div className="grid gap-5 md:grid-cols-3">
                    {/* Fecha Inicio */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="fechaInicioExport"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Fecha Inicio
                      </Label>
                      <Input
                        id="fechaInicioExport"
                        type="date"
                        value={fechaInicioExport}
                        onChange={(e) => setFechaInicioExport(e.target.value)}
                        className="bg-white dark:bg-gray-900/50"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Filtrar desde esta fecha (opcional)
                      </p>
                    </div>

                    {/* Fecha Fin */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="fechaFinExport"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Fecha Fin
                      </Label>
                      <Input
                        id="fechaFinExport"
                        type="date"
                        value={fechaFinExport}
                        onChange={(e) => setFechaFinExport(e.target.value)}
                        className="bg-white dark:bg-gray-900/50"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Filtrar hasta esta fecha (opcional)
                      </p>
                    </div>

                    {/* Establecimiento */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="establecimientoExport"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Establecimiento
                      </Label>
                      <Select
                        value={establecimientoExport}
                        onValueChange={(value) =>
                          setEstablecimientoExport(value)
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-900/50">
                          <SelectValue placeholder="Todos los establecimientos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {establecimientos.map((est) => (
                            <SelectItem key={est.id} value={est.id.toString()}>
                              {est.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Filtrar por centro (opcional)
                      </p>
                    </div>
                  </div>

                  {/* Información de exportación */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Columnas del Excel
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          El archivo incluirá: FECHA, RUN, NOMBRE USUARIO,
                          NACIONALIDAD, ETNIA, SECTOR, SUBSECTOR, COD PERCAPITA,
                          ESTABLECIMIENTO, OBSERVACION, ESTADO
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFechaInicioExport("");
                      setFechaFinExport("");
                      setEstablecimientoExport("todos");
                    }}
                    className="px-6"
                  >
                    Limpiar Filtros
                  </Button>
                  <Button
                    type="button"
                    onClick={handleExportar}
                    disabled={exportando}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {exportando ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4 mr-2" />
                        Exportar a Excel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de Edición */}
      {editModalOpen && selectedUsuario && (
        <EditUsuarioModal
          usuario={selectedUsuario}
          catalogos={catalogos}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUsuario(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
