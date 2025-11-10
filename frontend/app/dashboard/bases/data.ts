export type DatasetKey = "corte" | "trakcare";
export type QueryValue = string | number | boolean | undefined;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const UPLOAD_ENDPOINTS: Record<DatasetKey, string> = {
  corte: "/api/corte-fonasa/",
  trakcare: "/api/hp-trakcare/",
};

export const DATASET_LABELS: Record<DatasetKey, string> = {
  corte: "Corte Fonasa",
  trakcare: "HP Trakcare",
};

export type SummaryEntry = {
  month: string;
  label: string;
  total: number;
  validated?: number;
  nonValidated?: number;
};

export type DatasetRecord = Record<string, unknown> & { id: number };

export interface DatasetState {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  total: number;
  validated: number;
  nonValidated: number;
  summary: SummaryEntry[];
}

export const createDatasetState = (): DatasetState => ({
  columns: [],
  rows: [],
  total: 0,
  validated: 0,
  nonValidated: 0,
  summary: [],
});

export const EDITABLE_FIELDS: Record<
  DatasetKey,
  Array<{ key: string; label: string }>
> = {
  corte: [
    { key: "run", label: "RUN" },
    { key: "nombres", label: "Nombres" },
    { key: "apPaterno", label: "Apellido paterno" },
    { key: "apMaterno", label: "Apellido materno" },
    { key: "fechaNacimiento", label: "Fecha de nacimiento" },
    { key: "genero", label: "Género" },
    { key: "tramo", label: "Tramo" },
    { key: "nombreCentro", label: "Centro" },
    { key: "aceptadoRechazado", label: "Aceptado/Rechazado" },
    { key: "motivo", label: "Motivo" },
  ],
  trakcare: [
    { key: "RUN", label: "RUN" },
    { key: "nombre", label: "Nombre" },
    { key: "apPaterno", label: "Apellido paterno" },
    { key: "apMaterno", label: "Apellido materno" },
    { key: "genero", label: "Género" },
    { key: "fechaNacimiento", label: "Fecha de nacimiento" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    { key: "telefonoCelular", label: "Teléfono celular" },
    { key: "telefonoRecado", label: "Teléfono recado" },
    { key: "centroInscripcion", label: "Centro de inscripción" },
    { key: "prevision", label: "Previsión" },
    { key: "planTrakcare", label: "Plan Trakcare" },
  ],
};

export const parseSummaryEntries = (
  dataset: DatasetKey,
  summary: unknown
): SummaryEntry[] => {
  if (!Array.isArray(summary)) {
    return [];
  }

  return summary.map((item) => ({
    month: String((item as Record<string, unknown>).month ?? ""),
    label: String((item as Record<string, unknown>).label ?? ""),
    total: Number((item as Record<string, unknown>).total ?? 0),
    validated:
      dataset === "corte"
        ? Number((item as Record<string, unknown>).validated ?? 0)
        : undefined,
    nonValidated:
      dataset === "corte"
        ? Number(
            (item as Record<string, unknown>).nonValidated ??
              (item as Record<string, unknown>).non_validated ??
              0
          )
        : undefined,
  }));
};

export const buildEndpointUrl = (
  dataset: DatasetKey,
  options: { month?: string | null; params?: Record<string, QueryValue> } = {}
) => {
  const url = new URL(UPLOAD_ENDPOINTS[dataset], API_BASE_URL);
  if (options.month) {
    url.searchParams.set("month", options.month);
  }
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      if (typeof value === "boolean") {
        url.searchParams.set(key, value ? "true" : "false");
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export const buildDetailUrl = (dataset: DatasetKey, id: number) => {
  return new URL(`${UPLOAD_ENDPOINTS[dataset]}${id}/`, API_BASE_URL).toString();
};
