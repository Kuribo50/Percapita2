"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import Papa from "papaparse";
import { read, utils, write } from "xlsx";
import {
  CheckCircle2,
  FileText,
  Calendar,
  Sparkles,
  Trash2,
  RotateCw,
  FileUp,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  UploadCard,
  UploadProgressModal,
  ExpandedPreviewModal,
  DownloadTemplateModal,
  HistoryFilters,
  HistoryTable,
  NotificationList,
} from "@/components/subir-corte";
import {
  type DatasetKey,
  type UploadState,
  type UploadOverlayState,
  API_BASE_URL,
  UPLOAD_ENDPOINTS,
  EXPECTED_COLUMNS,
  DATASET_COLUMN_ALIASES,
  DATASET_LABELS,
  DATASET_DESCRIPTIONS,
  MONTHS,
  createUploadState,
  wait,
  formatRunChilean,
  useUploadHistory,
  useNotifications,
} from "@/lib/subir-corte";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const getEstadoCargaBadge = (estadoCarga: string) => {
  switch (estadoCarga) {
    case "NUEVO":
      return (
        <Badge className="bg-green-100 hover:bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          <Sparkles className="h-3 w-3 mr-1" />
          Nuevo
        </Badge>
      );
    case "ACTIVO":
      return (
        <Badge className="bg-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      );
    case "SOBRESCRITO":
      return (
        <Badge className="bg-amber-100 hover:bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          <RotateCw className="h-3 w-3 mr-1" />
          Sobrescrito
        </Badge>
      );
    case "ELIMINADO":
      return (
        <Badge variant="destructive">
          <Trash2 className="h-3 w-3 mr-1" />
          Eliminado
        </Badge>
      );
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const formatFechaCorte = (
  fechaCorte: string | undefined,
  periodoStr: string,
  tipoCarga: string
) => {
  if (tipoCarga === "HP_TRAKCARE") {
    return "Histórico";
  }

  if (fechaCorte) {
    const date = new Date(fechaCorte);
    return date.toLocaleDateString("es-CL", {
      month: "long",
      year: "numeric",
    });
  }

  if (periodoStr && periodoStr !== "N/A") {
    return periodoStr;
  }

  return "-";
};

const extractDateFromRows = (
  rows: Array<Record<string, unknown>>
): { month?: string; date?: string } => {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const possibleDateFields = [
    "fehcaCorte",
    "fechaCorte",
    "fecha_corte",
    "fecha",
  ];
  let fechaCorteValue: unknown = null;

  for (const field of possibleDateFields) {
    if (firstRow?.[field]) {
      fechaCorteValue = firstRow[field];
      break;
    }
  }

  if (!fechaCorteValue) {
    const dateValue = Object.entries(firstRow).find(([key, value]) => {
      const keyLower = key.toLowerCase();
      return (keyLower.includes("fecha") || keyLower.includes("date")) && value;
    })?.[1];

    if (dateValue) {
      fechaCorteValue = dateValue;
    } else {
      return {};
    }
  }

  const dateStr = String(fechaCorteValue).trim();

  try {
    let date: Date | null = null;

    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dateStr.split("T")[0]);
    } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      const [day, month, year] = dateStr.split("/");
      date = new Date(Number(year), Number(month) - 1, Number(day));
    } else if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}/)) {
      const [year, month, day] = dateStr.split("/");
      date = new Date(Number(year), Number(month) - 1, Number(day));
    } else if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) {
      const [day, month, year] = dateStr.split("-");
      date = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      date = new Date(dateStr);
    }

    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const day = date.getDate();

      const formattedDate = `${String(day).padStart(2, "0")}/${String(
        monthIndex + 1
      ).padStart(2, "0")}/${year}`;

      return {
        month: `${MONTHS[monthIndex]} ${year}`,
        date: formattedDate,
      };
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return {};
  }

  return {};
};

const excelSerialToDate = (serial: number): string => {
  const excelEpoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const sanitizeDatasetRows = (
  rows: Array<Record<string, unknown>>,
  dataset: DatasetKey
) => {
  return rows
    .map((row) => {
      const nextRow = { ...row } as Record<string, unknown>;

      Object.keys(nextRow).forEach((key) => {
        if (key.startsWith("__EMPTY")) {
          delete nextRow[key];
        }
      });

      if (Object.prototype.hasOwnProperty.call(nextRow, "run")) {
        const runValue = String(nextRow.run ?? "").trim();
        nextRow.run = runValue ? formatRunChilean(runValue) : "";
      }
      if (Object.prototype.hasOwnProperty.call(nextRow, "RUN")) {
        const runValue = String(nextRow.RUN ?? "").trim();
        nextRow.RUN = runValue ? formatRunChilean(runValue) : "";
      }

      if (dataset === "nuevosUsuarios" && nextRow.fecha) {
        const fechaValue = nextRow.fecha;
        if (typeof fechaValue === "number" && fechaValue > 1000) {
          nextRow.fecha = excelSerialToDate(fechaValue);
        } else if (typeof fechaValue === "string") {
          nextRow.fecha = fechaValue.trim();
        }
      }

      if (dataset === "corte" && nextRow.fehcaCorte) {
        const fechaValue = nextRow.fehcaCorte;
        if (typeof fechaValue === "number" && fechaValue > 1000) {
          nextRow.fehcaCorte = excelSerialToDate(fechaValue);
        }
      }

      return nextRow;
    })
    .filter((row) => {
      const runValue = String(row.run || row.RUN || "").trim();
      return runValue.length > 0;
    });
};

export default function SubirCortePage() {
  const { user } = useAuth();

  // Use custom hooks
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  const {
    uploadHistory,
    historyFilters,
    historyLoading,
    handleHistoryFilterChange,
    resetHistoryFilters,
    cargarHistorial,
  } = useUploadHistory();

  // Upload states
  const [corteState, setCorteState] = useState<UploadState>(createUploadState);
  const [trakcareState, setTrakcareState] =
    useState<UploadState>(createUploadState);
  const [nuevosUsuariosState, setNuevosUsuariosState] =
    useState<UploadState>(createUploadState);
  const [uploadProgress, setUploadProgress] =
    useState<UploadOverlayState | null>(null);
  const [replaceCorte, setReplaceCorte] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DatasetKey>("corte");
  const [expandedPreview, setExpandedPreview] = useState<DatasetKey | null>(
    null
  );
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const downloadTemplateExcel = (dataset: DatasetKey) => {
    const columns = [...EXPECTED_COLUMNS[dataset]];

    // Crear hoja de cálculo con encabezados
    const worksheet = utils.aoa_to_sheet([columns]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Plantilla");

    // Generar archivo Excel
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Descargar archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Plantilla_${DATASET_LABELS[dataset].replace(
      / /g,
      "_"
    )}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification(
      "success",
      `Plantilla de ${DATASET_LABELS[dataset]} descargada`
    );
  };

  const guardarHistorial = async (
    tipoCarga: "CORTE_FONASA" | "HP_TRAKCARE" | "NUEVOS_USUARIOS",
    nombreArchivo: string,
    periodoMes: number | null,
    periodoAnio: number | null,
    fechaCorte: string | null,
    totalRegistros: number,
    registrosCreados: number,
    registrosActualizados: number,
    registrosInvalidos: number,
    reemplazo: boolean,
    tiempoProcesamiento: number
  ) => {
    try {
      const estado = registrosInvalidos > 0 ? "PARCIAL" : "EXITOSO";

      const response = await fetch(`${API_BASE_URL}/api/historial-cargas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_carga: tipoCarga,
          nombre_archivo: nombreArchivo,
          usuario: user ? `${user.nombre} ${user.apellido}` : "Anónimo",
          periodo_mes: periodoMes,
          periodo_anio: periodoAnio,
          fecha_corte: fechaCorte,
          total_registros: totalRegistros,
          registros_creados: registrosCreados,
          registros_actualizados: registrosActualizados,
          registros_invalidos: registrosInvalidos,
          estado,
          reemplazo,
          tiempo_procesamiento: tiempoProcesamiento,
        }),
      });

      if (response.ok) {
        await cargarHistorial(historyFilters);
      } else {
        const errorData = await response.text();
        console.error(
          "Error guardando historial:",
          response.statusText,
          errorData
        );
        addNotification("error", "No se pudo guardar el historial de carga");
      }
    } catch (error) {
      console.error("Error guardando historial:", error);
      addNotification("error", "Error al guardar el historial de carga");
    }
  };

  const buildEndpointUrl = useCallback(
    (dataset: DatasetKey, params?: Record<string, unknown>) => {
      const url = new URL(UPLOAD_ENDPOINTS[dataset], API_BASE_URL);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined) return;
          if (typeof value === "boolean") {
            url.searchParams.set(key, value ? "true" : "false");
            return;
          }
          url.searchParams.set(key, String(value));
        });
      }
      return url.toString();
    },
    []
  );

  const parseCsv = (text: string) => {
    const parsed: Papa.ParseResult<Record<string, unknown>> = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    const columns = (parsed.meta.fields ?? []).map((field: string) =>
      field.trim()
    );
    const rows = parsed.data.filter((row: Record<string, unknown>) =>
      Object.values(row).some((value) => `${value ?? ""}`.trim() !== "")
    );

    return { columns, rows };
  };

  const parseExcel = (buffer: ArrayBuffer) => {
    const workbook = read(new Uint8Array(buffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const headerMatrix = utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      blankrows: false,
    });
    const headerRow = (headerMatrix[0] ?? []).map((header) =>
      String(header ?? "").trim()
    );

    const rows = utils
      .sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
        blankrows: false,
      })
      .filter((row) =>
        Object.values(row).some((value) => `${value ?? ""}`.trim() !== "")
      );

    return { columns: headerRow, rows };
  };

  const normalizeDatasetColumns = (
    dataset: DatasetKey,
    columns: string[],
    rows: Array<Record<string, unknown>>
  ) => {
    const aliasMap = DATASET_COLUMN_ALIASES[dataset];
    if (!aliasMap) {
      return { columns, rows };
    }

    const normalizedRows = rows.map((row) => {
      const nextRow = { ...row } as Record<string, unknown>;
      Object.entries(aliasMap).forEach(([alias, canonical]) => {
        if (Object.prototype.hasOwnProperty.call(nextRow, alias)) {
          if (
            canonical !== alias &&
            !Object.prototype.hasOwnProperty.call(nextRow, canonical)
          ) {
            nextRow[canonical] = nextRow[alias];
          }
          if (canonical !== alias) {
            delete nextRow[alias];
          }
        }
      });
      return nextRow;
    });

    const normalizedColumns = columns
      .map((column) => aliasMap[column] ?? column)
      .reduce<string[]>((acc, column) => {
        if (!acc.includes(column)) {
          acc.push(column);
        }
        return acc;
      }, []);

    return { columns: normalizedColumns, rows: normalizedRows };
  };

  const validateColumns = (dataset: DatasetKey, columns: string[]) => {
    const required = [...EXPECTED_COLUMNS[dataset]];
    const missing = required.filter((col) => !columns.includes(col));
    return missing.length === 0
      ? { isValid: true, message: "" }
      : { isValid: false, message: `Faltan columnas: ${missing.join(", ")}` };
  };

  const getUploadState = (dataset: DatasetKey) => {
    switch (dataset) {
      case "corte":
        return corteState;
      case "trakcare":
        return trakcareState;
      case "nuevosUsuarios":
        return nuevosUsuariosState;
    }
  };

  const setUploadState = (dataset: DatasetKey, state: UploadState) => {
    switch (dataset) {
      case "corte":
        setCorteState(state);
        break;
      case "trakcare":
        setTrakcareState(state);
        break;
      case "nuevosUsuarios":
        setNuevosUsuariosState(state);
        break;
    }
  };

  const handleFileChange =
    (dataset: DatasetKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      addNotification("info", `Procesando ${DATASET_LABELS[dataset]}…`);
      setUploadState(dataset, { ...createUploadState(), file, progress: 5 });

      const reader = new FileReader();

      reader.onprogress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadState(dataset, {
            ...getUploadState(dataset),
            progress: Math.min(percent, 99),
          });
        }
      };

      reader.onerror = () => {
        addNotification("error", "No se pudo leer el archivo.");
        const state = getUploadState(dataset);
        setUploadState(dataset, {
          ...state,
          error: "Error al leer el archivo",
          progress: 0,
        });
      };

      reader.onload = () => {
        try {
          let columns: string[] = [];
          let rows: Array<Record<string, unknown>> = [];
          const isCsv =
            file.type === "text/csv" ||
            file.name.toLowerCase().endsWith(".csv");
          const isExcel =
            file.name.toLowerCase().endsWith(".xlsx") ||
            file.name.toLowerCase().endsWith(".xls");

          if (isCsv) {
            const text = String(reader.result ?? "");
            ({ columns, rows } = parseCsv(text));
          } else if (isExcel) {
            const buffer = reader.result as ArrayBuffer;
            ({ columns, rows } = parseExcel(buffer));
          } else {
            throw new Error("Formato no soportado.");
          }

          ({ columns, rows } = normalizeDatasetColumns(dataset, columns, rows));

          const sanitizedRows = sanitizeDatasetRows(rows, dataset);
          const originalCount = rows.length;
          const filteredCount = sanitizedRows.length;
          const validation = validateColumns(dataset, columns);

          if (!validation.isValid) {
            addNotification("error", validation.message);
            setUploadState(dataset, {
              ...createUploadState(),
              file,
              columns,
              rows: sanitizedRows,
              progress: 100,
              error: validation.message,
              total: sanitizedRows.length,
            });
            return;
          }

          const { month, date } = extractDateFromRows(sanitizedRows);

          setUploadState(dataset, {
            ...createUploadState(),
            file,
            columns,
            rows: sanitizedRows,
            progress: 100,
            total: sanitizedRows.length,
            monthDetected: month,
            dateDetected: date,
          });

          const rowsFiltered = originalCount - filteredCount;
          if (rowsFiltered > 0) {
            addNotification(
              "warning",
              `Se filtraron ${rowsFiltered} registro(s) sin RUN válido`
            );
          }

          addNotification(
            "success",
            month
              ? `✓ ${sanitizedRows.length.toLocaleString(
                  "es-CL"
                )} registros • ${month}`
              : `✓ ${sanitizedRows.length.toLocaleString("es-CL")} registros`
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Error procesando archivo.";
          addNotification("error", message);
          const state = getUploadState(dataset);
          setUploadState(dataset, { ...state, error: message, progress: 0 });
        }
      };

      if (file.name.toLowerCase().endsWith(".csv")) {
        reader.readAsText(file, "utf-8");
      } else {
        reader.readAsArrayBuffer(file);
      }
    };

  const sendDatasetToApi = async (
    dataset: DatasetKey,
    onProgress?: (
      progress: number,
      processedRows: number,
      totalRows: number
    ) => void
  ): Promise<{
    created: number;
    updated: number;
    invalid: number;
    total: number;
  }> => {
    const state = getUploadState(dataset);
    const params: Record<string, unknown> = {};
    if (dataset === "corte" && replaceCorte) params.replace = true;

    const totalRows = state.rows.length;
    const CHUNK_SIZE = totalRows > 10000 ? 2000 : totalRows > 5000 ? 1000 : 500;

    if (totalRows <= CHUNK_SIZE) {
      const response = await fetch(buildEndpointUrl(dataset, params), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: state.rows }),
      });

      let payload: Record<string, unknown> = {};
      try {
        payload = await response.json();
      } catch {}

      if (!response.ok) {
        console.error("Error en upload:", {
          status: response.status,
          statusText: response.statusText,
          payload,
          dataset,
          totalRows: state.rows.length,
          firstRow: state.rows[0],
        });

        let errorMsg = "Error cargando datos";
        if (payload?.detail) {
          errorMsg =
            typeof payload.detail === "string"
              ? payload.detail
              : JSON.stringify(payload.detail);
        } else if (payload) {
          const errors = Object.entries(payload)
            .filter(([key]) => key !== "detail")
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(", ");
          if (errors) errorMsg = `Errores de validación: ${errors}`;
        }

        throw new Error(errorMsg);
      }

      if (onProgress) onProgress(100, totalRows, totalRows);

      return {
        created: Number(payload?.created ?? 0),
        updated: Number(payload?.updated ?? 0),
        invalid: Number(payload?.invalid ?? 0),
        total: Number(payload?.total ?? state.rows.length),
      };
    }

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalInvalid = 0;
    let processedRows = 0;

    const chunks: Array<Array<Record<string, unknown>>> = [];
    for (let i = 0; i < state.rows.length; i += CHUNK_SIZE) {
      chunks.push(state.rows.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkParams = { ...params };

      if (i > 0 && chunkParams.replace) {
        delete chunkParams.replace;
      }

      const response = await fetch(buildEndpointUrl(dataset, chunkParams), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: chunk }),
      });

      let payload: Record<string, unknown> = {};
      try {
        payload = await response.json();
      } catch {}

      if (!response.ok) {
        console.error("Error en chunk upload:", {
          status: response.status,
          statusText: response.statusText,
          payload,
          dataset,
          chunkIndex: i,
          chunkSize: chunk.length,
          firstRowOfChunk: chunk[0],
        });

        let errorMsg = `Error en chunk ${i + 1}/${chunks.length}`;
        if (payload?.detail) {
          errorMsg += `: ${
            typeof payload.detail === "string"
              ? payload.detail
              : JSON.stringify(payload.detail)
          }`;
        } else if (payload) {
          const errors = Object.entries(payload)
            .filter(([key]) => key !== "detail")
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(", ");
          if (errors) errorMsg += `: ${errors}`;
        }

        throw new Error(errorMsg);
      }

      totalCreated += Number(payload?.created ?? 0);
      totalUpdated += Number(payload?.updated ?? 0);
      totalInvalid += Number(payload?.invalid ?? 0);
      processedRows += chunk.length;

      const progress = Math.round((processedRows / totalRows) * 100);
      if (onProgress) {
        onProgress(progress, processedRows, totalRows);
      }

      if (i < chunks.length - 1) {
        await wait(100);
      }
    }

    return {
      created: totalCreated,
      updated: totalUpdated,
      invalid: totalInvalid,
      total: totalRows,
    };
  };

  const uploadDataset = async (dataset: DatasetKey) => {
    const state = getUploadState(dataset);
    const startedAt = Date.now();
    const totalRows = state.rows.length;

    const estimatedMs = Math.max(3000, Math.min(30000, totalRows * 15));

    setUploadProgress({
      dataset,
      progress: 0,
      etaSeconds: Math.ceil(estimatedMs / 1000),
      totalRows,
      startedAt,
      estimatedMs,
      currentPhase: "uploading",
    });

    try {
      const payload = await sendDatasetToApi(
        dataset,
        (progress, processedRows, totalRows) => {
          const elapsed = Date.now() - startedAt;
          const rowsRemaining = totalRows - processedRows;
          const avgTimePerRow =
            processedRows > 0 ? elapsed / processedRows : 15;
          const etaMs = rowsRemaining * avgTimePerRow;
          const etaSeconds = Math.max(Math.ceil(etaMs / 1000), 0);

          let currentPhase: UploadOverlayState["currentPhase"] = "uploading";
          if (progress > 30 && progress < 80) {
            currentPhase = "processing";
          } else if (progress >= 80) {
            currentPhase = "finalizing";
          }

          setUploadProgress((prev) =>
            prev && prev.dataset === dataset
              ? {
                  ...prev,
                  progress,
                  etaSeconds,
                  currentPhase,
                }
              : prev
          );
        }
      );

      setUploadProgress((prev) =>
        prev && prev.dataset === dataset
          ? {
              ...prev,
              progress: 100,
              etaSeconds: 0,
              currentPhase: "finalizing",
            }
          : prev
      );

      const currentState = getUploadState(dataset);
      const tiempoProcesamiento = (Date.now() - startedAt) / 1000;

      let periodoMes: number | null = null;
      let periodoAnio: number | null = null;
      let fechaCorteStr: string | null = null;

      if (currentState.monthDetected && dataset === "corte") {
        const partes = currentState.monthDetected.split(" ");
        if (partes.length === 2) {
          const mes = MONTHS.indexOf(partes[0]);
          periodoMes = mes >= 0 ? mes + 1 : null;
          const anio = parseInt(partes[1], 10);
          periodoAnio = !isNaN(anio) ? anio : null;
        }
        if (currentState.dateDetected) {
          const [dia, mes, anio] = currentState.dateDetected.split("/");
          fechaCorteStr = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(
            2,
            "0"
          )}`;
        } else {
          fechaCorteStr = new Date().toISOString().split("T")[0];
        }
      }

      const tipoCargaMap: Record<
        DatasetKey,
        "CORTE_FONASA" | "HP_TRAKCARE" | "NUEVOS_USUARIOS"
      > = {
        corte: "CORTE_FONASA",
        trakcare: "HP_TRAKCARE",
        nuevosUsuarios: "NUEVOS_USUARIOS",
      };

      await guardarHistorial(
        tipoCargaMap[dataset],
        currentState.file?.name || "archivo.xlsx",
        periodoMes,
        periodoAnio,
        fechaCorteStr,
        payload.total,
        payload.created,
        payload.updated,
        payload.invalid,
        replaceCorte,
        tiempoProcesamiento
      );

      setUploadState(dataset, createUploadState());

      await wait(800);
      setUploadProgress(null);

      addNotification(
        payload.invalid > 0 ? "warning" : "success",
        payload.invalid > 0
          ? `✓ ${payload.created} nuevos, ${payload.updated} actualizados • ⚠️ ${payload.invalid} errores`
          : `✓ ${payload.created} nuevos, ${payload.updated} actualizados`
      );
    } catch (error) {
      setUploadProgress(null);
      addNotification(
        "error",
        error instanceof Error ? error.message : "Error subiendo datos."
      );
      throw error;
    }
  };

  const handleUpload = async () => {
    if (uploadProgress && uploadProgress.progress < 100) {
      addNotification("info", "Espera a que finalice la carga en curso.");
      return;
    }

    const state = getUploadState(activeTab);

    if (state.total === 0) {
      addNotification("error", "Selecciona un archivo.");
      return;
    }

    if (state.error) {
      addNotification("error", "Corrige las columnas.");
      return;
    }

    try {
      await uploadDataset(activeTab);
    } catch {
      // Error ya notificado
    }
  };

  const isUploading = uploadProgress !== null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Upload Progress Modal */}
      <UploadProgressModal
        uploadProgress={uploadProgress}
        onClose={() => setUploadProgress(null)}
      />

      {/* Modal Vista Expandida */}
      <ExpandedPreviewModal
        isOpen={expandedPreview !== null}
        onClose={() => setExpandedPreview(null)}
        datasetLabel={expandedPreview ? DATASET_LABELS[expandedPreview] : ""}
        columns={expandedPreview ? getUploadState(expandedPreview).columns : []}
        rows={expandedPreview ? getUploadState(expandedPreview).rows : []}
        total={expandedPreview ? getUploadState(expandedPreview).total : 0}
      />

      <DownloadTemplateModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={downloadTemplateExcel}
        datasets={[
          {
            key: "corte" as DatasetKey,
            label: DATASET_LABELS.corte,
            description: DATASET_DESCRIPTIONS.corte,
            columns: EXPECTED_COLUMNS.corte.length,
          },
          {
            key: "trakcare" as DatasetKey,
            label: DATASET_LABELS.trakcare,
            description: DATASET_DESCRIPTIONS.trakcare,
            columns: EXPECTED_COLUMNS.trakcare.length,
          },
          {
            key: "nuevosUsuarios" as DatasetKey,
            label: DATASET_LABELS.nuevosUsuarios,
            description: DATASET_DESCRIPTIONS.nuevosUsuarios,
            columns: EXPECTED_COLUMNS.nuevosUsuarios.length,
          },
        ]}
      />

      {/* Notifications */}
      <NotificationList
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header Mejorado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Gestión de Cargas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Importación y gestión de archivos del sistema de salud
            </p>
          </div>
          <Card className="border-none shadow-lg bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Hoy
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Mejoradas con Cards */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DatasetKey)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border">
            {(["corte", "trakcare", "nuevosUsuarios"] as DatasetKey[]).map(
              (dataset) => (
                <TabsTrigger
                  key={dataset}
                  value={dataset}
                  disabled={isUploading}
                  className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3 px-4 transition-all"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold text-sm">
                      {DATASET_LABELS[dataset]}
                    </span>
                    <span className="text-xs opacity-70">
                      {DATASET_DESCRIPTIONS[dataset]}
                    </span>
                  </div>
                </TabsTrigger>
              )
            )}
          </TabsList>

          {(["corte", "trakcare", "nuevosUsuarios"] as DatasetKey[]).map(
            (dataset) => (
              <TabsContent key={dataset} value={dataset} className="space-y-6">
                <UploadCard
                  dataset={dataset}
                  uploadState={getUploadState(dataset)}
                  isUploading={isUploading}
                  replaceCorte={dataset === "corte" ? replaceCorte : undefined}
                  onFileChange={handleFileChange(dataset)}
                  onUpload={handleUpload}
                  onCancel={() => {
                    setUploadState(dataset, createUploadState());
                    setReplaceCorte(false);
                  }}
                  onDownloadTemplate={() => setShowDownloadModal(true)}
                  onExpandPreview={() => setExpandedPreview(dataset)}
                  onReplaceCorteChange={
                    dataset === "corte"
                      ? (checked) => setReplaceCorte(checked)
                      : undefined
                  }
                  initialPreviewRows={7}
                  maxPreviewColumns={6}
                />
              </TabsContent>
            )
          )}
        </Tabs>

        {/* Historial Mejorado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 shadow-lg">
                  <FileUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Historial de Cargas</CardTitle>
                  <CardDescription>
                    Registro completo de archivos procesados
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                <BarChart3 className="h-3 w-3 mr-1" />
                {uploadHistory.length} cargas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros Mejorados */}
            <HistoryFilters
              filters={historyFilters}
              onFilterChange={handleHistoryFilterChange}
              onReset={resetHistoryFilters}
            />

            <Separator />

            {/* Lista de Cargas Mejorada */}
            <HistoryTable
              history={uploadHistory}
              isLoading={historyLoading}
              formatFechaCorte={formatFechaCorte}
              getEstadoCargaBadge={getEstadoCargaBadge}
            />
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
