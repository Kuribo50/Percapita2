export interface User {
  rut: string;
  nombre: string;
  apellido?: string;
  email: string;
  establecimiento: string;
  rol?: string;
}

export interface MenuItem {
  title: string;
  href?: string;
  icon?: string;
  submenu?: MenuItem[];
}

// Nuevos Usuarios
export interface NuevoUsuario {
  id?: number;
  run: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  fechaSolicitud: string;
  fechaInscripcion?: string;
  periodoMes: number;
  periodoAnio: number;
  periodoStr?: string;
  nacionalidad?: number | string;
  etnia?: number | string;
  sector?: number | string;
  subsector?: number | string;
  codigoSector?: string;
  codigoPercapita?: string;
  centro?: string;
  establecimiento?: number | string;
  observaciones?: string;
  estado: "PENDIENTE" | "VALIDADO" | "NO_VALIDADO" | "FALLECIDO";
  validacion?: number;
  creadoEl?: string;
  modificadoEl?: string;
  creadoPor?: string;
  modificadoPor?: string;
  // Campos de revisión
  revisado?: boolean;
  revisadoManualmente?: boolean;
  revisadoPor?: string;
  revisadoEl?: string;
  // Observaciones HP Trakcare
  observacionesTrakcare?: string;
  checklistTrakcare?: {
    datosBasicosVerificados?: boolean;
    documentacionCompleta?: boolean;
    direccionActualizada?: boolean;
    telefonoActualizado?: boolean;
    previsionActualizada?: boolean;
    datosFamiliaresVerificados?: boolean;
    [key: string]: boolean | undefined;
  };
  // Información de validación desde el corte FONASA
  infoValidacion?: {
    aceptadoRechazado?: string;
    motivo?: string;
    motivoNormalizado?: string;
  };
}

export interface EstadisticasNuevosUsuarios {
  total: number;
  pendientes: number;
  validados: number;
  noValidados: number;
  fallecidos: number;
}

export interface NuevosUsuariosResponse {
  usuarios: NuevoUsuario[];
  estadisticas: EstadisticasNuevosUsuarios;
}

export interface ValidacionCorte {
  id?: number;
  periodoMes: number;
  periodoAnio: number;
  periodoStr?: string;
  fechaCorte: string;
  totalUsuarios: number;
  usuariosValidados: number;
  usuariosNoValidados: number;
  usuariosPendientes: number;
  observaciones?: string;
  procesadoEl?: string;
  procesadoPor?: string;
}

export interface MesData {
  mes: number;
  anio: number;
  periodo: string;
  total: number;
}

export interface EstadisticasGenerales {
  mesActual: {
    mes: number;
    anio: number;
    periodo: string;
    total: number;
  };
  totales: {
    total: number;
    pendientes: number;
    validados: number;
    noValidados: number;
    fallecidos: number;
  };
  historicoMeses: MesData[];
}

// Catálogos
export interface Catalogo {
  id?: number;
  tipo: "ETNIA" | "NACIONALIDAD" | "SECTOR" | "SUBSECTOR" | "ESTABLECIMIENTO";
  nombre: string;
  codigo?: string | null;
  color?: string | null;
  activo: boolean;
  orden: number;
  creadoEl?: string;
  modificadoEl?: string;
}
