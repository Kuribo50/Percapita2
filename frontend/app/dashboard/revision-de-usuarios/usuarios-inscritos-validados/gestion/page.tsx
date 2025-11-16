"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  FormEvent,
  Fragment,
  useDeferredValue,
} from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  Calendar,
  Users,
  Search,
  Eye,
  X,
  RefreshCw,
  Send,
  Loader2,
  Paperclip,
  Copy,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  UserX,
  Building2,
  UserCircle,
  CalendarClock,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { validateRut } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Usuario {
  id: number;
  run: string;
  nombres?: string;
  nombre?: string;
  nombre_completo?: string;
  nombreCompleto?: string;
  apPaterno?: string;
  apMaterno?: string;
  ap_paterno?: string;
  ap_materno?: string;
  centro_salud?: string;
  centro_actual?: string;
  centroActual?: string;
  nombre_centro?: string;
  nombreCentro?: string;
  nombre_centro_actual?: string;
  rut_centro_procedencia?: string;
  rut_centro_actual?: string;
  centroDeProcedencia?: string;
  comunaDeProcedencia?: string;
  comunaActual?: string;
  genero?: string;
  nacionalidad?: string | number;
  tramo?: string;
  aceptado_rechazado?: string;
  aceptadoRechazado?: string;
  motivo?: string;
  motivo_rechazo?: string;
  motivo_no_validado?: string;
  motivo_original?: string;
  motivo_normalizado?: string;
  fecha_corte?: string;
  fechaCorte?: string;
  fehcaCorte?: string;
  fechaNacimiento?: string;
  estado_validacion?: string;
  estado_categoria?: string;
  mes?: string;
  ano?: number;
  fechaInscripcion?: string;
  creadoEl?: string;
  isValidated?: boolean;
}

interface Observacion {
  id: number;
  corteId: number;
  run: string;
  titulo: string;
  texto: string;
  estadoRevision: string;
  tipo: string;
  adjuntoUrl?: string | null;
  adjuntoNombre?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  autorNombre?: string | null;
  autorId?: number | null;
  centroActual?: string | null;
  fechaCorte?: string | null;
}

type ObservacionForm = {
  titulo: string;
  texto: string;
  estadoRevision: string;
  file: File | null;
};

const estadoBadgeStyles: Record<string, string> = {
  PENDIENTE: "border-amber-200 bg-amber-100 text-amber-800",
  CONTACTADO: "border-sky-200 bg-sky-100 text-sky-700",
  AGENDADO: "border-indigo-200 bg-indigo-100 text-indigo-700",
  RESUELTO: "border-emerald-200 bg-emerald-100 text-emerald-700",
  NO_LOCALIZADO: "border-rose-200 bg-rose-100 text-rose-700",
};

function getEstadoBadgeClasses(estado: string): string {
  return (
    estadoBadgeStyles[estado] || "border-slate-200 bg-slate-100 text-slate-700"
  );
}

const observacionMetaChipClasses =
  "inline-flex items-center gap-1 rounded-full border border-gray-200/70 bg-gray-100/80 px-2 py-0.5 font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100";

export default function GestionUsuariosInscritosValidadosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Para saber si ya cargó alguna vez

  // Estados para búsqueda
  const [searchRun, setSearchRun] = useState("");
  const [searchNombre, setSearchNombre] = useState("");

  // Estados para filtros adicionales
  const [selectedMes, setSelectedMes] = useState("");
  const [selectedAno, setSelectedAno] = useState("");
  const [selectedCentro, setSelectedCentro] = useState("");

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina, setUsuariosPorPagina] = useState(10);
  const [tabActivo, setTabActivo] = useState("todos");

  const [expandedRuns, setExpandedRuns] = useState<Record<string, boolean>>({});
  const [observacionesPorRun, setObservacionesPorRun] = useState<
    Record<string, Observacion[]>
  >({});
  const [observacionesLoading, setObservacionesLoading] = useState<
    Record<string, boolean>
  >({});
  const [observacionForm, setObservacionForm] = useState<
    Record<string, ObservacionForm>
  >({});
  const [observacionSaving, setObservacionSaving] = useState<
    Record<string, boolean>
  >({});
  const [observacionDeleting, setObservacionDeleting] = useState<
    Record<number, boolean>
  >({});

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Cargar observaciones para usuarios paginados específicos
  const fetchObservacionesPaginadas = useCallback(
    async (usuariosList: Usuario[]) => {
      if (!usuariosList.length) return;

      const token = localStorage.getItem("authToken");
      const promises = usuariosList
        .filter((user) => user.run)
        .map(async (usuario) => {
          try {
            const response = await fetch(
              `${API_URL}/api/usuarios-no-validados/${encodeURIComponent(
                usuario.run
              )}/observaciones/`,
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : "",
                },
              }
            );

            if (response.ok) {
              const data: Observacion[] = await response.json();
              return { run: usuario.run, observaciones: data };
            }
          } catch (error) {
            console.error(
              "Error al cargar observaciones de",
              usuario.run,
              error
            );
          }
          return null;
        });

      const resultados = await Promise.all(promises);
      const observacionesMap: Record<string, Observacion[]> = {};

      resultados.forEach((resultado) => {
        if (resultado) {
          observacionesMap[resultado.run] = resultado.observaciones;
        }
      });

      setObservacionesPorRun((prev) => ({ ...prev, ...observacionesMap }));
    },
    []
  );

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setUsuarios([]); // Limpiar usuarios anteriores

      const token = localStorage.getItem("authToken");

      // Cargar TODOS los usuarios ACEPTADOS de una vez - el backend filtra directamente
      const response = await fetch(
        `${API_URL}/api/corte-fonasa/?validated_only=true&all=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }

      const data = await response.json();
      console.log("📦 Datos recibidos:", {
        totalRows: data.rows?.length || 0,
        total: data.total,
        validated: data.validated,
      });

      // Procesar usuarios - ya vienen filtrados como ACEPTADOS del backend
      let usuariosProcesados: Usuario[] = [];

      if (data.columns && data.rows && Array.isArray(data.rows)) {
        usuariosProcesados = data.rows.map((row: unknown) => {
          const usuario: Record<string, unknown> = {};

          (data.columns as string[]).forEach((col) => {
            if (typeof row === "object" && row !== null) {
              usuario[col] = (row as Record<string, unknown>)[col];
            }
          });

          // Extraer mes y año de fehcaCorte
          const fechaCorte =
            usuario.fehcaCorte || usuario.fecha_corte || usuario.fechaCorte;
          if (fechaCorte && typeof fechaCorte === "string") {
            const fecha = new Date(fechaCorte);
            if (!isNaN(fecha.getTime())) {
              usuario.mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
              usuario.ano = fecha.getFullYear();
            }
          }

          return usuario as unknown as Usuario;
        });

        console.log("✅ Usuarios procesados:", {
          total: usuariosProcesados.length,
        });
      }

      setUsuarios(usuariosProcesados);
      setDataLoaded(true); // Marcar que ya se cargaron datos

      console.log("💾 Estado actualizado:", {
        totalCargados: usuariosProcesados.length,
        totalDisponibles: data.validated || 0,
      });
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      toast.error("Error al cargar usuarios validados");
    } finally {
      setLoading(false);
    }
  }, []);

  // NO cargar automáticamente - solo cuando el usuario presione "Actualizar"
  // La carga será manual mediante el botón

  // Cargar filtros guardados al montar el componente
  useEffect(() => {
    const filtrosGuardados = localStorage.getItem("filtrosUsuariosNoValidados");
    if (filtrosGuardados) {
      try {
        const {
          searchRun: sr,
          searchNombre: sn,
          selectedMes: sm,
          selectedAno: sa,
          selectedCentro: sc,
        } = JSON.parse(filtrosGuardados);
        if (sr) setSearchRun(sr);
        if (sn) setSearchNombre(sn);
        if (sm) setSelectedMes(sm);
        if (sa) setSelectedAno(sa);
        if (sc) setSelectedCentro(sc);
      } catch (error) {
        console.error("Error al cargar filtros guardados:", error);
      }
    }
  }, []);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    const filtros = {
      searchRun,
      searchNombre,
      selectedMes,
      selectedAno,
      selectedCentro,
    };
    localStorage.setItem("filtrosUsuariosNoValidados", JSON.stringify(filtros));
  }, [searchRun, searchNombre, selectedMes, selectedAno, selectedCentro]);

  // useEffect para resetear paginación cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [
    searchRun,
    searchNombre,
    selectedMes,
    selectedAno,
    selectedCentro,
    usuariosPorPagina,
  ]);

  // Calcular estadísticas
  const obtenerMotivoPrincipal = (usuario: Usuario) =>
    usuario.motivo ||
    usuario.motivo_normalizado ||
    usuario.motivo_original ||
    "";

  const usuariosOrdenadosMemo = useMemo(
    () => ordenarUsuarios(usuarios),
    [usuarios]
  );

  // Usar deferred values para mejorar el rendimiento
  const deferredSearchRun = useDeferredValue(searchRun);
  const deferredSearchNombre = useDeferredValue(searchNombre);
  const deferredSelectedMes = useDeferredValue(selectedMes);
  const deferredSelectedAno = useDeferredValue(selectedAno);
  const deferredSelectedCentro = useDeferredValue(selectedCentro);

  // Detectar si está filtrando (valores diferidos !== valores actuales)
  const isFiltering =
    deferredSearchRun !== searchRun ||
    deferredSearchNombre !== searchNombre ||
    deferredSelectedMes !== selectedMes ||
    deferredSelectedAno !== selectedAno ||
    deferredSelectedCentro !== selectedCentro;

  // Función para filtrar usuarios - Optimizada con valores diferidos
  const filtrarUsuarios = useCallback(
    (listaUsuarios: Usuario[], filtroEstado: string) => {
      // Pre-calcular valores constantes fuera del loop - USANDO VALORES DIFERIDOS
      const searchRunLower = deferredSearchRun
        .toLowerCase()
        .replace(/[.\s-]/g, "");
      const searchNombreLower = deferredSearchNombre.toLowerCase();
      const hasSearchRun = deferredSearchRun.trim() !== "";
      const hasSearchNombre = deferredSearchNombre.trim() !== "";
      const hasSelectedMes = !!deferredSelectedMes;
      const hasSelectedAno = !!deferredSelectedAno;
      const hasSelectedCentro = !!deferredSelectedCentro;
      const isTodosFilter = filtroEstado === "todos";

      // Normalizar función fuera del loop
      const normalizarTexto = (texto: string) =>
        texto
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase();

      const filtroNormalizado = isTodosFilter
        ? ""
        : normalizarTexto(filtroEstado);

      return listaUsuarios.filter((usuario) => {
        // Early return si no pasa filtros básicos
        if (hasSearchRun) {
          const runMatch = usuario.run?.toLowerCase().includes(searchRunLower);
          if (!runMatch) return false;
        }

        if (hasSearchNombre) {
          const nombreCompleto = (
            usuario.nombreCompleto ||
            usuario.nombre ||
            `${usuario.nombres || ""} ${usuario.apPaterno || ""} ${
              usuario.apMaterno || ""
            }`.trim()
          )?.toLowerCase();
          if (!nombreCompleto?.includes(searchNombreLower)) return false;
        }

        if (hasSelectedMes && usuario.mes !== deferredSelectedMes) return false;
        if (hasSelectedAno && usuario.ano?.toString() !== deferredSelectedAno)
          return false;

        if (hasSelectedCentro) {
          const centroComparacion =
            usuario.centroActual ||
            usuario.nombreCentro ||
            usuario.centro_actual ||
            usuario.centro_salud;
          if (centroComparacion !== deferredSelectedCentro) return false;
        }

        if (!isTodosFilter) {
          const motivoPrincipal = (
            usuario.motivo || obtenerMotivoPrincipal(usuario)
          ).toUpperCase();
          const motivoNormalizado = normalizarTexto(motivoPrincipal);
          if (!motivoNormalizado.includes(filtroNormalizado)) return false;
        }

        return true;
      });
    },
    [
      deferredSearchRun,
      deferredSearchNombre,
      deferredSelectedMes,
      deferredSelectedAno,
      deferredSelectedCentro,
    ]
  );

  const filtrosAplicados = useMemo(() => {
    const resultado: Record<string, Usuario[]> = {
      todos: filtrarUsuarios(usuariosOrdenadosMemo, "todos"),
      "MANTIENE INSCRIPCION": filtrarUsuarios(
        usuariosOrdenadosMemo,
        "MANTIENE INSCRIPCION"
      ),
      "TRASLADO POSITIVO": filtrarUsuarios(
        usuariosOrdenadosMemo,
        "TRASLADO POSITIVO"
      ),
      "NUEVO INSCRITO": filtrarUsuarios(
        usuariosOrdenadosMemo,
        "NUEVO INSCRITO"
      ),
      "MIGRADOS A FONASA": filtrarUsuarios(
        usuariosOrdenadosMemo,
        "MIGRADOS A FONASA"
      ),
    };
    console.log("🔎 Filtros aplicados:", {
      total: resultado.todos.length,
      mantiene: resultado["MANTIENE INSCRIPCION"].length,
      traslado: resultado["TRASLADO POSITIVO"].length,
      nuevo: resultado["NUEVO INSCRITO"].length,
      migrados: resultado["MIGRADOS A FONASA"].length,
    });
    return resultado;
  }, [usuariosOrdenadosMemo, filtrarUsuarios]);

  const estadisticas = useMemo(() => {
    const stats: Record<string, number> = {
      total: filtrosAplicados.todos?.length || 0,
      "MANTIENE INSCRIPCION":
        filtrosAplicados["MANTIENE INSCRIPCION"]?.length || 0,
      "TRASLADO POSITIVO": filtrosAplicados["TRASLADO POSITIVO"]?.length || 0,
      "NUEVO INSCRITO": filtrosAplicados["NUEVO INSCRITO"]?.length || 0,
      "MIGRADOS A FONASA": filtrosAplicados["MIGRADOS A FONASA"]?.length || 0,
    };
    return stats;
  }, [filtrosAplicados]); // Calcular usuarios paginados del tab actual
  const usuariosPaginadosActuales = useMemo(() => {
    const usuariosFiltrados = filtrarUsuarios(usuariosOrdenadosMemo, tabActivo);
    const inicio = (paginaActual - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    return usuariosFiltrados.slice(inicio, fin);
  }, [
    tabActivo,
    paginaActual,
    usuariosPorPagina,
    usuariosOrdenadosMemo,
    filtrarUsuarios,
  ]);

  // Cargar observaciones de los usuarios paginados actuales
  useEffect(() => {
    if (!usuariosPaginadosActuales.length) return;

    const cargarObservaciones = async () => {
      await fetchObservacionesPaginadas(usuariosPaginadosActuales);
    };

    void cargarObservaciones();
  }, [usuariosPaginadosActuales, fetchObservacionesPaginadas]);

  const estadoRevisionOptions = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "CONTACTADO", label: "Contactado" },
    { value: "AGENDADO", label: "Agendado" },
    { value: "RESUELTO", label: "Resuelto" },
    { value: "NO_LOCALIZADO", label: "No localizado" },
  ];

  function ensureObservacionForm(run: string) {
    if (!run) {
      return;
    }
    setObservacionForm((prev) => {
      if (prev[run]) {
        return prev;
      }
      return {
        ...prev,
        [run]: {
          titulo: "",
          texto: "",
          estadoRevision: "PENDIENTE",
          file: null,
        },
      };
    });
  }

  async function fetchObservaciones(run: string) {
    if (!run) {
      return;
    }
    const clave = run;
    setObservacionesLoading((prev) => ({ ...prev, [clave]: true }));
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_URL}/api/usuarios-no-validados/${encodeURIComponent(
          clave
        )}/observaciones/`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("No fue posible cargar las observaciones");
      }

      const data: Observacion[] = await response.json();
      setObservacionesPorRun((prev) => ({ ...prev, [clave]: data }));
    } catch (error) {
      console.error("Error al cargar observaciones", error);
      toast.error("No se pudieron cargar las observaciones del RUN");
    } finally {
      setObservacionesLoading((prev) => ({ ...prev, [clave]: false }));
    }
  }

  function toggleExpand(usuario: Usuario) {
    const run = usuario.run;
    if (!run) {
      toast.error("El usuario no tiene RUN asociado");
      return;
    }
    const estabaExpandido = Boolean(expandedRuns[run]);
    const proximoValor = !estabaExpandido;
    setExpandedRuns((prev) => ({ ...prev, [run]: proximoValor }));

    if (proximoValor) {
      ensureObservacionForm(run);
      if (!observacionesPorRun[run]) {
        void fetchObservaciones(run);
      }
    }
  }

  function handleObservacionFieldChange(
    run: string,
    field: "titulo" | "texto" | "estadoRevision",
    value: string
  ) {
    if (!run) {
      return;
    }
    ensureObservacionForm(run);
    setObservacionForm((prev) => {
      const anterior =
        prev[run] ||
        ({
          titulo: "",
          texto: "",
          estadoRevision: "PENDIENTE",
          file: null,
        } as ObservacionForm);
      return {
        ...prev,
        [run]: {
          ...anterior,
          [field]: value,
        },
      };
    });
  }

  function handleObservacionFileChange(run: string, file: File | null) {
    if (!run) {
      return;
    }
    ensureObservacionForm(run);
    setObservacionForm((prev) => {
      const anterior =
        prev[run] ||
        ({
          titulo: "",
          texto: "",
          estadoRevision: "PENDIENTE",
          file: null,
        } as ObservacionForm);
      return {
        ...prev,
        [run]: {
          ...anterior,
          file,
        },
      };
    });
  }

  async function handleSubmitObservacion(event: FormEvent, run: string) {
    event.preventDefault();
    if (!run) {
      toast.error("No se puede registrar la observación sin RUN");
      return;
    }

    const formularioActual = observacionForm[run];
    if (
      !formularioActual ||
      (!formularioActual.titulo &&
        !formularioActual.texto &&
        !formularioActual.file)
    ) {
      toast.error("Agrega un comentario, título o adjunto antes de guardar");
      return;
    }

    setObservacionSaving((prev) => ({ ...prev, [run]: true }));

    try {
      const token = localStorage.getItem("authToken");
      const payload = new FormData();
      payload.append("estadoRevision", formularioActual.estadoRevision);
      if (formularioActual.titulo) {
        payload.append("titulo", formularioActual.titulo);
      }
      if (formularioActual.texto) {
        payload.append("texto", formularioActual.texto);
      }
      if (formularioActual.file) {
        payload.append("adjunto", formularioActual.file);
      }

      const response = await fetch(
        `${API_URL}/api/usuarios-no-validados/${encodeURIComponent(
          run
        )}/observaciones/`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: payload,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData && errorData.detail) || "No se pudo guardar la observación"
        );
      }

      toast.success("Observación registrada");
      await fetchObservaciones(run);
      setObservacionForm((prev) => ({
        ...prev,
        [run]: {
          titulo: "",
          texto: "",
          estadoRevision: formularioActual.estadoRevision,
          file: null,
        },
      }));
      if (fileInputsRef.current[run]) {
        fileInputsRef.current[run]!.value = "";
      }
    } catch (error) {
      console.error("Error al guardar observación", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la observación"
      );
    } finally {
      setObservacionSaving((prev) => ({ ...prev, [run]: false }));
    }
  }

  async function handleDeleteObservacion(run: string, observacionId: number) {
    if (!window.confirm("¿Estás seguro de eliminar esta observación?")) {
      return;
    }

    setObservacionDeleting((prev) => ({ ...prev, [observacionId]: true }));

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_URL}/api/usuarios-no-validados/${encodeURIComponent(
          run
        )}/observaciones/${observacionId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.detail || "No se pudo eliminar la observación"
        );
      }

      toast.success("Observación eliminada");
      await fetchObservaciones(run);
    } catch (error) {
      console.error("Error al eliminar observación", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la observación"
      );
    } finally {
      setObservacionDeleting((prev) => ({ ...prev, [observacionId]: false }));
    }
  }

  function formatFechaLarga(valor?: string | null) {
    if (!valor) {
      return "";
    }
    try {
      const fecha = new Date(valor);
      return fecha.toLocaleString("es-CL", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return valor;
    }
  }

  function formatFechaCorte(valor?: string | null) {
    if (!valor) {
      return "sin especificar";
    }
    try {
      const fecha = new Date(valor);
      return fecha.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
    } catch {
      return valor;
    }
  }

  const handleViewUsuario = (usuario: Usuario) => {
    if (!usuario.id) {
      toast.error("No se encontró el identificador del usuario");
      return;
    }
    router.push(
      `/dashboard/revision-de-usuarios/usuarios-no-validados/gestion/${usuario.id}`
    );
  };

  const handleCopiarRut = async (rut: string) => {
    try {
      await navigator.clipboard.writeText(rut);
      toast.success("RUN copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el RUN");
    }
  };

  // Obtener valores únicos para filtros
  const centrosUnicos = Array.from(
    new Set(
      usuarios
        .map((u) => u.nombreCentro || u.centroActual || u.nombre_centro)
        .filter((valor): valor is string => Boolean(valor))
    )
  ).sort();

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const mesesUnicos = Array.from(
    new Set(usuarios.map((u) => u.mes).filter(Boolean))
  ).sort() as string[];

  const anosUnicos = Array.from(
    new Set(usuarios.map((u) => u.ano).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number)) as number[];

  // Función para ordenar usuarios (más recientes primero)
  function ordenarUsuarios(listaUsuarios: Usuario[]) {
    return [...listaUsuarios].sort((a, b) => {
      const fechaA = new Date(a.creadoEl || 0).getTime();
      const fechaB = new Date(b.creadoEl || 0).getTime();
      return fechaB - fechaA;
    });
  }

  // Función para paginar usuarios
  function paginarUsuarios(
    listaUsuarios: Usuario[],
    pagina: number,
    porPagina: number
  ) {
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    return listaUsuarios.slice(inicio, fin);
  }

  // Función para renderizar la tabla de usuarios
  const renderTablaUsuarios = (filtroEstado: string) => {
    const usuariosFiltrados = filtrarUsuarios(
      usuariosOrdenadosMemo,
      filtroEstado
    );
    const hayFiltros =
      searchRun.trim() !== "" ||
      searchNombre.trim() !== "" ||
      selectedMes !== "" ||
      selectedAno !== "" ||
      selectedCentro !== "";
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
                onChange={(e) => setSearchRun(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900/50"
              />
              {searchRun && (
                <button
                  onClick={() => setSearchRun("")}
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
                onChange={(e) => setSearchNombre(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900/50"
              />
              {searchNombre && (
                <button
                  onClick={() => setSearchNombre("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Select
                value={selectedMes || "all"}
                onValueChange={(value: string) =>
                  setSelectedMes(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900/50">
                  <SelectValue placeholder="Filtrar por mes..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {mesesUnicos.map((mes) => (
                    <SelectItem key={mes} value={mes}>
                      {nombresMeses[parseInt(mes) - 1] || mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedAno || "all"}
                onValueChange={(value: string) =>
                  setSelectedAno(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900/50">
                  <SelectValue placeholder="Filtrar por año..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {anosUnicos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedCentro || "all"}
                onValueChange={(value: string) =>
                  setSelectedCentro(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900/50">
                  <SelectValue placeholder="Filtrar por centro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los centros</SelectItem>
                  {centrosUnicos.map((centro) => (
                    <SelectItem key={centro} value={centro}>
                      {centro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {hayFiltros && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchRun("");
                  setSearchNombre("");
                  setSelectedMes("");
                  setSelectedAno("");
                  setSelectedCentro("");
                }}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Indicador de filtrado en progreso */}
          {isFiltering && (
            <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg py-2 px-4">
              <div className="w-4 h-4 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Actualizando resultados...</span>
            </div>
          )}

          {/* Controles de paginación y resultados */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hayFiltros ? (
                <>
                  {usuariosFiltrados.length} resultado
                  {usuariosFiltrados.length !== 1 ? "s" : ""} encontrado
                  {usuariosFiltrados.length !== 1 ? "s" : ""}
                  {usuariosFiltrados.length < usuarios.length &&
                    ` de ${usuarios.length} total`}
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
                onValueChange={(value: string) =>
                  setUsuariosPorPagina(Number(value))
                }
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    RUT
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Centro Inscrito
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Centro de Procedencia
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Corte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-4 px-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : usuariosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {hayFiltros
                          ? "No se encontraron resultados"
                          : "No hay usuarios para mostrar"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {hayFiltros
                          ? "Intenta con otros términos de búsqueda"
                          : "No hay usuarios validados registrados"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuariosPaginados.map((usuario) => {
                    const runKey = usuario.run || `usuario-${usuario.id}`;
                    const expanded = Boolean(expandedRuns[runKey]);
                    const observaciones = observacionesPorRun[runKey] || [];
                    const observacionesCargando = Boolean(
                      observacionesLoading[runKey]
                    );
                    const estaGuardando = Boolean(observacionSaving[runKey]);
                    const formularioActual =
                      observacionForm[runKey] ||
                      ({
                        titulo: "",
                        texto: "",
                        estadoRevision: "PENDIENTE",
                        file: null,
                      } as ObservacionForm);

                    return (
                      <Fragment key={runKey}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                          {/* Acciones */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleExpand(usuario)}
                                className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                title={
                                  expanded
                                    ? "Ocultar comentarios"
                                    : "Ver comentarios"
                                }
                              >
                                {expanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleViewUsuario(usuario)}
                                className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="uppercase text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              >
                                {usuario.aceptadoRechazado ||
                                  usuario.aceptado_rechazado ||
                                  "ACEPTADO"}
                              </Badge>
                              {observaciones.length > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/40">
                                        <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-sm">
                                        {observaciones.length} observación
                                        {observaciones.length !== 1 ? "es" : ""}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>

                          {/* Motivo */}
                          <td className="py-3 px-4">
                            <div
                              className="max-w-[180px] truncate text-sm text-gray-600 dark:text-gray-400"
                              title={usuario.motivo || "Sin motivo informado"}
                            >
                              {usuario.motivo || "N/A"}
                            </div>
                          </td>

                          {/* RUT */}
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
                                onClick={() =>
                                  handleCopiarRut(usuario.run || "")
                                }
                                className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                title="Copiar RUT"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>

                          {/* Centro Inscrito (nombreCentro) */}
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {usuario.nombreCentro ||
                              usuario.nombre_centro ||
                              "-"}
                          </td>

                          {/* Centro de Procedencia (centroDeProcedencia) */}
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                            {usuario.centroDeProcedencia ||
                              usuario.centroActual ||
                              usuario.centro_actual ||
                              "-"}
                          </td>

                          {/* Nombre */}
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {usuario.nombreCompleto ||
                              usuario.nombre ||
                              `${usuario.nombres || ""} ${
                                usuario.apPaterno || ""
                              } ${usuario.apMaterno || ""}`.trim() ||
                              "-"}
                          </td>

                          {/* Fecha Corte */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {usuario.mes}/{usuario.ano || "N/A"}
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-gray-50/70 dark:bg-gray-900/30">
                            <td colSpan={8} className="px-6 py-6">
                              <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Historial de observaciones
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Seguimiento detallado del RUN{" "}
                                        {usuario.run}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => fetchObservaciones(runKey)}
                                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                      title="Actualizar historial"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {observacionesCargando ? (
                                    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 py-10">
                                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                        Cargando observaciones...
                                      </span>
                                    </div>
                                  ) : observaciones.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/40 py-10 text-center">
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Aún no hay comentarios registrados
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Usa el formulario para iniciar el
                                        seguimiento de este caso.
                                      </p>
                                    </div>
                                  ) : (
                                    <div
                                      className={`space-y-3 ${
                                        observaciones.length > 4
                                          ? "max-h-80 overflow-y-auto pr-2"
                                          : ""
                                      }`}
                                    >
                                      {observaciones.map((observacion) => {
                                        const estadoReadable =
                                          estadoRevisionOptions.find(
                                            (opt) =>
                                              opt.value ===
                                              observacion.estadoRevision
                                          )?.label ||
                                          observacion.estadoRevision;
                                        const autorDisplay =
                                          observacion.autorNombre ||
                                          "Registro automático";
                                        const estadoBadgeClasses =
                                          getEstadoBadgeClasses(
                                            observacion.estadoRevision
                                          );
                                        const centroDisplay =
                                          observacion.centroActual ||
                                          "Centro no especificado";
                                        const runDisplay =
                                          observacion.run ||
                                          usuario.run ||
                                          runKey;
                                        const isDeleting = Boolean(
                                          observacionDeleting[observacion.id]
                                        );
                                        return (
                                          <div
                                            key={observacion.id}
                                            className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-950/40"
                                          >
                                            <div className="flex flex-col gap-3 border-b border-gray-200/70 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800/60">
                                              <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {observacion.titulo ||
                                                      "Observación"}
                                                  </p>
                                                  <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                      handleDeleteObservacion(
                                                        runKey,
                                                        observacion.id
                                                      )
                                                    }
                                                    disabled={isDeleting}
                                                    className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                                                    title="Eliminar observación"
                                                  >
                                                    {isDeleting ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                      <Trash2 className="h-4 w-4" />
                                                    )}
                                                  </Button>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                  <span
                                                    className={
                                                      observacionMetaChipClasses
                                                    }
                                                  >
                                                    <UserCircle className="h-3.5 w-3.5" />
                                                    {runDisplay}
                                                  </span>
                                                  <span
                                                    className={
                                                      observacionMetaChipClasses
                                                    }
                                                  >
                                                    <CalendarClock className="h-3.5 w-3.5" />
                                                    {formatFechaLarga(
                                                      observacion.createdAt
                                                    )}
                                                  </span>
                                                  <span
                                                    className={
                                                      observacionMetaChipClasses
                                                    }
                                                  >
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {centroDisplay}
                                                  </span>
                                                  {observacion.fechaCorte && (
                                                    <span
                                                      className={
                                                        observacionMetaChipClasses
                                                      }
                                                    >
                                                      <Clock className="h-3.5 w-3.5" />
                                                      {`Corte ${formatFechaCorte(
                                                        observacion.fechaCorte
                                                      )}`}
                                                    </span>
                                                  )}
                                                  <span
                                                    className={
                                                      observacionMetaChipClasses
                                                    }
                                                  >
                                                    <Users className="h-3.5 w-3.5" />
                                                    {autorDisplay}
                                                  </span>
                                                </div>
                                              </div>
                                              <Badge
                                                variant="outline"
                                                className={`uppercase text-[10px] font-semibold tracking-wide ${estadoBadgeClasses}`}
                                              >
                                                {estadoReadable}
                                              </Badge>
                                            </div>
                                            {observacion.texto && (
                                              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/80 p-3 text-sm leading-relaxed text-gray-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-gray-100">
                                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                                                  <MessageSquare className="h-3.5 w-3.5" />
                                                  Comentario
                                                </div>
                                                {observacion.texto}
                                              </div>
                                            )}
                                            {observacion.adjuntoUrl && (
                                              <a
                                                href={observacion.adjuntoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-300"
                                              >
                                                <Paperclip className="h-4 w-4" />
                                                {observacion.adjuntoNombre ||
                                                  "Descargar adjunto"}
                                              </a>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      Registrar nueva observación
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Anexa comentarios o documentos relevantes
                                      para este usuario.
                                    </p>
                                  </div>
                                  <form
                                    onSubmit={(event) =>
                                      handleSubmitObservacion(event, runKey)
                                    }
                                    className="space-y-3"
                                  >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Estado de seguimiento
                                        </p>
                                        <Select
                                          value={
                                            formularioActual.estadoRevision
                                          }
                                          onValueChange={(value) =>
                                            handleObservacionFieldChange(
                                              runKey,
                                              "estadoRevision",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="bg-white dark:bg-gray-900/40">
                                            <SelectValue placeholder="Selecciona un estado" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {estadoRevisionOptions.map(
                                              (option) => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Título
                                        </p>
                                        <Input
                                          value={formularioActual.titulo}
                                          onChange={(event) =>
                                            handleObservacionFieldChange(
                                              runKey,
                                              "titulo",
                                              event.target.value
                                            )
                                          }
                                          placeholder="Ej: Intento de contacto"
                                          className="bg-white dark:bg-gray-900/40"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Comentario
                                      </p>
                                      <Textarea
                                        value={formularioActual.texto}
                                        onChange={(event) =>
                                          handleObservacionFieldChange(
                                            runKey,
                                            "texto",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Describe el contacto o hallazgos relevantes..."
                                        rows={4}
                                        className="bg-white dark:bg-gray-900/40"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Adjuntar respaldo
                                      </p>
                                      <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                        onChange={(event) =>
                                          handleObservacionFileChange(
                                            runKey,
                                            event.target.files?.[0] || null
                                          )
                                        }
                                        ref={(element) => {
                                          fileInputsRef.current[runKey] =
                                            element;
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                      />
                                      {formularioActual.file && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Archivo seleccionado:{" "}
                                          {formularioActual.file.name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        type="submit"
                                        disabled={estaGuardando}
                                        className="inline-flex items-center gap-2"
                                      >
                                        {estaGuardando ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}
                                        Guardar observación
                                      </Button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
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
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Header con título grande */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">
                Usuarios Inscritos Validados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Gestión de usuarios con estado aceptado en el corte FONASA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchUsuarios}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando todos los usuarios...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {dataLoaded ? "Actualizar" : "Cargar Datos"}
                  </>
                )}
              </Button>
              {!dataLoaded && !loading && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Presiona &quot;Cargar Datos&quot; para ver los usuarios
                  validados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas dinámicas simplificadas */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 mb-6">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-r from-green-400 to-green-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-green-200 dark:border-green-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Validados
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {estadisticas.total}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Mantiene Inscripción */}
          <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Mantiene
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {estadisticas["MANTIENE INSCRIPCION"] || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Traslado Positivo */}
          <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-cyan-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-cyan-200 dark:border-cyan-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Traslado +
                  </p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {estadisticas["TRASLADO POSITIVO"] || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Nuevo Inscrito */}
          <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-r from-violet-400 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-violet-200 dark:border-violet-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Nuevo
                  </p>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                    {estadisticas["NUEVO INSCRITO"] || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Migrados FONASA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-r from-amber-400 to-amber-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Migrados
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {estadisticas["MIGRADOS A FONASA"] || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje cuando no hay datos cargados */}
        {!dataLoaded && !loading && (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                No hay datos cargados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Presiona el botón &quot;Cargar Datos&quot; para cargar todos los
                usuarios validados del sistema.
              </p>
              <Button
                onClick={fetchUsuarios}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Cargar Datos
              </Button>
            </div>
          </div>
        )}

        {/* Tabs principales - Dinámicos por motivos */}
        {dataLoaded && (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <Tabs
              value={tabActivo}
              onValueChange={setTabActivo}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-t-2xl">
                {/* Tab Todos */}
                <TabsTrigger
                  value="todos"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  Todos ({estadisticas.total})
                </TabsTrigger>

                {/* Tab Mantiene Inscripción */}
                <TabsTrigger
                  value="MANTIENE INSCRIPCION"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <Clock className="w-4 h-4" />
                  Mantiene ({estadisticas["MANTIENE INSCRIPCION"] || 0})
                </TabsTrigger>

                {/* Tab Traslado Positivo */}
                <TabsTrigger
                  value="TRASLADO POSITIVO"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  Traslado ({estadisticas["TRASLADO POSITIVO"] || 0})
                </TabsTrigger>

                {/* Tab Nuevo Inscrito */}
                <TabsTrigger
                  value="NUEVO INSCRITO"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <UserX className="w-4 h-4" />
                  Nuevo ({estadisticas["NUEVO INSCRITO"] || 0})
                </TabsTrigger>

                {/* Tab Migrados FONASA */}
                <TabsTrigger
                  value="MIGRADOS A FONASA"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <Clock className="w-4 h-4" />
                  Migrados ({estadisticas["MIGRADOS A FONASA"] || 0})
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {/* Tab Todos */}
                <TabsContent value="todos" className="space-y-4 mt-0">
                  {renderTablaUsuarios("todos")}
                </TabsContent>

                {/* Tab Mantiene Inscripción */}
                <TabsContent
                  value="MANTIENE INSCRIPCION"
                  className="space-y-4 mt-0"
                >
                  {renderTablaUsuarios("MANTIENE INSCRIPCION")}
                </TabsContent>

                {/* Tab Traslado Positivo */}
                <TabsContent
                  value="TRASLADO POSITIVO"
                  className="space-y-4 mt-0"
                >
                  {renderTablaUsuarios("TRASLADO POSITIVO")}
                </TabsContent>

                {/* Tab Nuevo Inscrito */}
                <TabsContent value="NUEVO INSCRITO" className="space-y-4 mt-0">
                  {renderTablaUsuarios("NUEVO INSCRITO")}
                </TabsContent>

                {/* Tab Migrados FONASA */}
                <TabsContent
                  value="MIGRADOS A FONASA"
                  className="space-y-4 mt-0"
                >
                  {renderTablaUsuarios("MIGRADOS A FONASA")}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
