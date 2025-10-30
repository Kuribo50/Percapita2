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
  nombreCompleto: string;
  fechaSolicitud: string;
  periodoMes: number;
  periodoAnio: number;
  periodoStr?: string;
  nacionalidad?: string;
  etnia?: string;
  sector?: string;
  subsector?: string;
  codigoPercapita?: string;
  establecimiento?: string;
  observaciones?: string;
  estado: 'PENDIENTE' | 'VALIDADO' | 'NO_VALIDADO';
  validacion?: number;
  creadoEl?: string;
  modificadoEl?: string;
  creadoPor?: string;
}

export interface EstadisticasNuevosUsuarios {
  total: number;
  pendientes: number;
  validados: number;
  noValidados: number;
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
  };
  historicoMeses: MesData[];
}

// Catálogos
export interface Catalogo {
  id?: number;
  tipo: 'ETNIA' | 'NACIONALIDAD' | 'SECTOR' | 'SUBSECTOR' | 'ESTABLECIMIENTO';
  nombre: string;
  codigo?: string | null;
  color?: string | null;
  activo: boolean;
  orden: number;
  creadoEl?: string;
  modificadoEl?: string;
}
