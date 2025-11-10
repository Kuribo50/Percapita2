import type { DatasetKey } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const UPLOAD_ENDPOINTS: Record<DatasetKey, string> = {
  corte: "/api/corte-fonasa/",
  trakcare: "/api/hp-trakcare/",
  nuevosUsuarios: "/api/nuevos-usuarios/upload/",
};

export const EXPECTED_COLUMNS = {
  corte: [
    "run",
    "nombres",
    "apPaterno",
    "apMaterno",
    "fechaNacimiento",
    "genero",
    "tramo",
    "fehcaCorte",
    "nombreCentro",
    "centroDeProcedencia",
    "comunaDeProcedencia",
    "centroActual",
    "comunaActual",
    "aceptadoRechazado",
    "motivo",
  ],
  trakcare: [
    "codFamilia",
    "relacionParentezco",
    "idTrakcare",
    "etnia",
    "codRegistro",
    "nacionalidad",
    "RUN",
    "apPaterno",
    "apMaterno",
    "nombre",
    "genero",
    "fechaNacimiento",
    "edad",
    "direccion",
    "telefono",
    "telefonoCelular",
    "TelefonoRecado",
    "servicioSalud",
    "centroInscripcion",
    "sector",
    "prevision",
    "planTrakcare",
    "praisTrakcare",
    "fechaIncorporacion",
    "fechaUltimaModif",
    "fechaDefuncion",
  ],
  nuevosUsuarios: [
    "fecha",
    "run",
    "nombres",
    "apellidoPaterno",
    "apellidoMaterno",
    "nacionalidad",
    "etnia",
    "sector",
    "codigoSector",
    "subsector",
    "codPercapita",
    "centro",
    "observaciones",
    "estado",
  ],
} as const;

export const DATASET_COLUMN_ALIASES: Partial<
  Record<DatasetKey, Record<string, string>>
> = {
  corte: {
    fechaCorte: "fehcaCorte",
    fecha_corte: "fehcaCorte",
    nombre_centro: "nombreCentro",
    centro_de_procedencia: "centroDeProcedencia",
    comuna_de_procedencia: "comunaDeProcedencia",
    centro_actual: "centroActual",
    comuna_actual: "comunaActual",
    aceptado_rechazado: "aceptadoRechazado",
  },
};

export const DATASET_LABELS: Record<DatasetKey, string> = {
  corte: "Corte FONASA",
  trakcare: "HP Trakcare",
  nuevosUsuarios: "Nuevos Usuarios",
};

export const DATASET_DESCRIPTIONS: Record<DatasetKey, string> = {
  corte: "Carga mensual de usuarios del sistema FONASA",
  trakcare: "Datos históricos del sistema HP Trakcare",
  nuevosUsuarios: "Registro de nuevos usuarios inscritos",
};

export const MONTHS = [
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
