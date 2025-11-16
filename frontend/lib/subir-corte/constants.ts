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

export const REQUIRED_COLUMNS: Record<DatasetKey, readonly string[]> = {
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
    "aceptadoRechazado",
    "motivo",
  ],
  trakcare: EXPECTED_COLUMNS.trakcare,
  nuevosUsuarios: EXPECTED_COLUMNS.nuevosUsuarios,
};

/**
 * Alias manuales para columnas por dataset. Las llaves se normalizan en tiempo de ejecución
 * mediante `normalizeColumnName`, por lo que aquí podemos usar el formato que resulte más legible.
 */
export const DATASET_COLUMN_ALIASES: Partial<
  Record<DatasetKey, Record<string, string>>
> = {
  corte: {
    rut: "run",
    run_beneficiario: "run",
    rut_beneficiario: "run",
    documento_identidad: "run",
    sexo: "genero",
    fecha_corte: "fehcaCorte",
    fecha_de_corte: "fehcaCorte",
    fecha_corte_periodo: "fehcaCorte",
    resultado: "aceptadoRechazado",
    estado: "aceptadoRechazado",
    motivo_rechazo: "motivo",
    observacion: "motivo",
    centro_inscripcion: "nombreCentro",
    establecimiento: "nombreCentro",
  },
  trakcare: {
    rut: "RUN",
    documento_identidad: "RUN",
    telefono_fijo: "telefono",
    telefono_principal: "telefono",
    telefono_alternativo: "TelefonoRecado",
    celular: "telefonoCelular",
  },
  nuevosUsuarios: {
    rut: "run",
    documento_identidad: "run",
    codigo_sector: "codigoSector",
    codigo_percapita: "codPercapita",
    centro_salud: "centro",
    estado_registro: "estado",
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
