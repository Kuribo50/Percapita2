/**
 * Definiciones de Tipos TypeScript para el Sistema Per Cápita FONASA
 *
 * Este archivo contiene todas las definiciones de tipos e interfaces utilizadas
 * en el frontend de la aplicación. Está organizado por dominios funcionales.
 */

// =============================================================================
// TIPOS BASE DE API
// =============================================================================

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
  data?: T;
  detail?: string;
  message?: string;
  error?: string;
}

/**
 * Error de la API
 */
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  ordering?: string;
}

// =============================================================================
// AUTENTICACIÓN Y USUARIOS DEL SISTEMA
// =============================================================================

/**
 * Usuario del sistema (staff/administradores)
 */
export interface User {
  id?: number;
  rut: string;
  nombre: string;
  apellido?: string;
  email: string;
  establecimiento: string;
  rol?: string;
  esAdmin?: boolean;
  centros?: string[];
  activo?: boolean;
  creadoEl?: string;
  modificadoEl?: string;
}

/**
 * Credenciales de inicio de sesión
 */
export interface LoginRequest {
  rut: string;
  password: string;
}

/**
 * Respuesta de inicio de sesión
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Solicitud de cambio de contraseña
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// CORTES FONASA
// =============================================================================

/**
 * Registro individual de un Corte FONASA
 */
export interface CorteFonasa {
  id?: number;
  run: string;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  nombreCompleto?: string;
  fechaNacimiento?: string;
  genero?: string;
  tramo?: string;
  fechaCorte: string;
  nombreCentro?: string;
  centroSalud?: number;
  centroDeProcedencia?: string;
  comunaDeProcedencia?: string;
  nombreCentroActual?: string;
  centroActual?: string;
  comunaActual?: string;
  aceptadoRechazado?: string;
  motivo?: string;
  motivoNormalizado?: string;
  validado?: boolean;
  // Relaciones
  observaciones?: CorteFonasaObservacion[];
  creadoEl?: string;
  modificadoEl?: string;
}

/**
 * Observación asociada a un registro de Corte FONASA
 */
export interface CorteFonasaObservacion {
  id?: number;
  corte?: number;
  run?: string;
  titulo: string;
  texto: string;
  estadoRevision: "PENDIENTE" | "EN_REVISION" | "RESUELTO";
  tipo: "GENERAL" | "DATOS_PERSONALES" | "INSCRIPCION" | "RECHAZO" | "OTRO";
  autorNombre?: string;
  adjunto?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos agrupados por mes de Corte FONASA
 */
export interface CortesPorMes {
  mesKey: string;
  mes: string;
  fechaCorte: string;
  registros: CorteFonasa[];
  validado: boolean | null;
  observaciones: CorteFonasaObservacion[];
}

/**
 * Historial mensual de Cortes FONASA
 */
export interface HistorialMensualCorte {
  mes: string;
  anio: number;
  mesNumero: number;
  totalRegistros: number;
  totalValidados: number;
  totalNoValidados: number;
  tasaValidacion: number;
  fechaCarga?: string;
}

/**
 * Opciones de filtrado para Cortes FONASA
 */
export interface CorteFonasaFilters {
  mes?: string;
  anio?: number;
  centro?: string;
  validado?: boolean;
  run?: string;
}

// =============================================================================
// HP TRAKCARE
// =============================================================================

/**
 * Registro de HP Trakcare (base de datos de pacientes)
 */
export interface HpTrakcare {
  id?: number;
  codFamilia?: string;
  relacionParentezco?: string;
  idTrakcare?: string;
  codRegistro?: string;
  run: string;
  apPaterno?: string;
  apMaterno?: string;
  nombre?: string;
  nombreCompleto?: string;
  genero?: string;
  fechaNacimiento?: string;
  edad?: number;
  direccion?: string;
  telefono?: string;
  telefonoCelular?: string;
  telefonoRecado?: string;
  servicioSalud?: string;
  etnia?: string | number;
  nacionalidad?: string | number;
  centroInscripcion?: string | number;
  sector?: string | number;
  prevision?: string;
  planTrakcare?: string;
  praisTrakcare?: string;
  fechaIncorporacion?: string;
  fechaUltimaModif?: string;
  fechaDefuncion?: string;
  estaVivo?: boolean;
  creadoEl?: string;
  modificadoEl?: string;
}

/**
 * Miembro de familia en búsqueda familiar
 */
export interface FamiliaMember extends HpTrakcare {
  esPrincipal?: boolean;
  totalCortes?: number;
  ultimoCorte?: string;
  tieneValidados?: boolean;
}

/**
 * Respuesta de búsqueda de familia
 */
export interface BusquedaFamiliaResponse {
  run: string;
  encontrado: boolean;
  codFamilia: string | null;
  totalMiembros: number;
  miembros: FamiliaMember[];
  mensaje?: string;
}

// =============================================================================
// NUEVOS USUARIOS
// =============================================================================

/**
 * Nuevo usuario pre-corte (inscripciones nuevas)
 */
export interface NuevoUsuario {
  id?: number;
  run: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  fechaSolicitud?: string;
  fechaInscripcion?: string;
  periodoMes: number;
  periodoAnio: number;
  periodoStr?: string;
  periodo?: string;
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
  estadoDisplay?: string;
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
  checklistTrakcare?: ChecklistTrakcare;
  // Información de validación desde el corte FONASA
  infoValidacion?: InfoValidacionCorte;
}

/**
 * Checklist de revisión en HP Trakcare
 */
export interface ChecklistTrakcare {
  datosBasicosVerificados?: boolean;
  documentacionCompleta?: boolean;
  direccionActualizada?: boolean;
  telefonoActualizado?: boolean;
  previsionActualizada?: boolean;
  datosFamiliaresVerificados?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Información de validación desde corte FONASA
 */
export interface InfoValidacionCorte {
  aceptadoRechazado?: string;
  motivo?: string;
  motivoNormalizado?: string;
}

/**
 * Estadísticas de nuevos usuarios
 */
export interface EstadisticasNuevosUsuarios {
  total: number;
  pendientes: number;
  validados: number;
  noValidados: number;
  fallecidos: number;
  tasaValidacion?: number;
}

/**
 * Respuesta de lista de nuevos usuarios
 */
export interface NuevosUsuariosResponse {
  usuarios: NuevoUsuario[];
  estadisticas: EstadisticasNuevosUsuarios;
  totalUsuarios?: number;
}

/**
 * Datos de un mes específico
 */
export interface MesData {
  mes: number;
  anio: number;
  periodo: string;
  total: number;
}

/**
 * Estadísticas generales del sistema
 */
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

/**
 * Solicitud de validación en lote
 */
export interface ValidarLoteRequest {
  usuariosIds: number[];
  estado: "VALIDADO" | "NO_VALIDADO";
  observaciones?: string;
}

/**
 * Solicitud de exportación
 */
export interface ExportarRequest {
  periodo?: string;
  estado?: string;
  formato?: "xlsx" | "csv";
}

// =============================================================================
// CATÁLOGOS
// =============================================================================

/**
 * Catálogo genérico (base para todos los catálogos)
 */
export interface Catalogo {
  id?: number;
  nombre: string;
  codigo?: string | null;
  color?: string | null;
  activo: boolean;
  orden?: number;
  creadoEl?: string;
  modificadoEl?: string;
}

/**
 * Etnia o pueblo originario
 */
export interface Etnia extends Catalogo {
  tipo?: "ETNIA";
}

/**
 * Nacionalidad
 */
export interface Nacionalidad extends Catalogo {
  tipo?: "NACIONALIDAD";
}

/**
 * Sector territorial
 */
export interface Sector extends Catalogo {
  tipo?: "SECTOR";
}

/**
 * Subsector territorial
 */
export interface Subsector extends Catalogo {
  tipo?: "SUBSECTOR";
  sector?: number | string;
  sectorNombre?: string;
}

/**
 * Establecimiento o centro de salud
 */
export interface Establecimiento extends Catalogo {
  tipo?: "ESTABLECIMIENTO";
  direccion?: string;
  telefono?: string;
  email?: string;
}

/**
 * Respuesta de todos los catálogos
 */
export interface CatalogosResponse {
  etnias: Etnia[];
  nacionalidades: Nacionalidad[];
  sectores: Sector[];
  subsectores: Subsector[];
  establecimientos: Establecimiento[];
}

// =============================================================================
// VALIDACIONES
// =============================================================================

/**
 * Registro de validación de un corte
 */
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
  tasaValidacion?: number;
  observaciones?: string;
  procesadoEl?: string;
  procesadoPor?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

/**
 * Solicitud de validación contra corte
 */
export interface ValidarContraCorteRequest {
  periodoMes: number;
  periodoAnio: number;
  runUsuarios?: string[];
}

// =============================================================================
// HISTORIAL DE CARGAS
// =============================================================================

/**
 * Registro de historial de carga
 */
export interface HistorialCarga {
  id?: number;
  tipoArchivo: "CORTE_FONASA" | "HP_TRAKCARE" | "NUEVOS_USUARIOS";
  tipoArchivoDisplay?: string;
  nombreArchivo: string;
  periodoMes?: number;
  periodoAnio?: number;
  periodoStr?: string;
  totalRegistros: number;
  registrosExitosos: number;
  registrosFallidos: number;
  tasaExito?: number;
  errores?: string;
  cargadoPor?: string;
  cargadoEl?: string;
  observaciones?: string;
}

/**
 * Filtros para historial de cargas
 */
export interface HistorialCargaFilters {
  tipoArchivo?: string;
  periodo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// =============================================================================
// BÚSQUEDA DE USUARIOS
// =============================================================================

/**
 * Respuesta de búsqueda de usuario
 */
export interface BusquedaUsuarioResponse {
  run: string;
  encontrado: boolean;
  cortesPorMes: CortesPorMes[];
  hpTrakcare: HpTrakcare | null;
  nuevosUsuarios: NuevoUsuario[];
  totalMeses: number;
  totalNuevosUsuarios: number;
}

// =============================================================================
// UI / COMPONENTES
// =============================================================================

/**
 * Item del menú de navegación
 */
export interface MenuItem {
  title: string;
  href?: string;
  icon?: string;
  submenu?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

/**
 * Columna de tabla genérica
 */
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Opción de filtro
 */
export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
}

/**
 * Configuración de filtros
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "text" | "number";
  options?: FilterOption[];
  defaultValue?: any;
}

/**
 * Estado de breadcrumbs
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

/**
 * Notificación del sistema
 */
export interface Notification {
  id?: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Modal de confirmación
 */
export interface ConfirmationModal {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Estado de carga
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Dirección de ordenamiento
 */
export type SortDirection = "asc" | "desc";

/**
 * Configuración de ordenamiento
 */
export interface SortConfig {
  key: string;
  direction: SortDirection;
}

/**
 * Rango de fechas
 */
export interface DateRange {
  startDate: string | Date | null;
  endDate: string | Date | null;
}

/**
 * Opciones de archivo para subida
 */
export interface FileUploadOptions {
  maxSize?: number;
  acceptedFormats?: string[];
  multiple?: boolean;
}

/**
 * Respuesta de subida de archivo
 */
export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    totalRegistros: number;
    registrosExitosos: number;
    registrosFallidos: number;
    errores?: string[];
  };
}

/**
 * Configuración de gráfico
 */
export interface ChartConfig {
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

/**
 * Datos de serie para gráficos
 */
export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

/**
 * Estado del contexto de autenticación
 */
export interface AuthContextState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Estado del contexto de notificaciones
 */
export interface NotificationContextState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// =============================================================================
// EXPORTACIONES DE TIPOS DE ESTADO
// =============================================================================

/**
 * Estados de usuario
 */
export type EstadoUsuario = "PENDIENTE" | "VALIDADO" | "NO_VALIDADO" | "FALLECIDO";

/**
 * Estados de revisión
 */
export type EstadoRevision = "PENDIENTE" | "EN_REVISION" | "RESUELTO";

/**
 * Tipos de observación
 */
export type TipoObservacion = "GENERAL" | "DATOS_PERSONALES" | "INSCRIPCION" | "RECHAZO" | "OTRO";

/**
 * Tipos de archivo
 */
export type TipoArchivo = "CORTE_FONASA" | "HP_TRAKCARE" | "NUEVOS_USUARIOS";

/**
 * Roles de usuario
 */
export type RolUsuario = "ADMIN" | "OPERADOR" | "CONSULTA";

// =============================================================================
// AUDITORÍA Y LOGS
// =============================================================================

/**
 * Tipos de acciones del sistema
 */
export type TipoAccion =
  | "LOGIN"
  | "LOGOUT"
  | "CREAR"
  | "EDITAR"
  | "ELIMINAR"
  | "VER"
  | "EXPORTAR"
  | "IMPORTAR"
  | "VALIDAR"
  | "RESTABLECER_PASSWORD"
  | "ASIGNAR_CENTROS";

/**
 * Módulos del sistema
 */
export type ModuloSistema =
  | "USUARIOS"
  | "CORTES"
  | "NUEVOS_USUARIOS"
  | "HP_TRAKCARE"
  | "VALIDACIONES"
  | "CATALOGOS"
  | "SISTEMA";

/**
 * Log de actividad del sistema
 */
export interface LogActividad {
  id: number;
  usuario: {
    id?: number;
    username: string;
    nombre_completo: string;
  };
  accion: TipoAccion;
  accion_display: string;
  modulo: ModuloSistema;
  modulo_display: string;
  descripcion: string;
  objeto_tipo?: string;
  objeto_id?: number;
  objeto_str?: string;
  cambios?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

/**
 * Filtros para logs
 */
export interface LogFiltros {
  usuario_id?: number;
  accion?: TipoAccion;
  modulo?: ModuloSistema;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  limit?: number;
}

/**
 * Respuesta de lista de logs
 */
export interface LogsResponse {
  count: number;
  results: LogActividad[];
}

/**
 * Opción de acción disponible
 */
export interface AccionDisponible {
  value: TipoAccion;
  label: string;
}

/**
 * Opción de módulo disponible
 */
export interface ModuloDisponible {
  value: ModuloSistema;
  label: string;
}

// =============================================================================
// NOTIFICACIONES DEL SISTEMA
// =============================================================================

/**
 * Tipos de notificación
 */
export type TipoNotificacion = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

/**
 * Notificación del sistema
 */
export interface NotificacionSistema {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  url?: string;
  datos?: Record<string, any>;
  timestamp: string;
}

/**
 * Respuesta de notificaciones
 */
export interface NotificacionesResponse {
  count: number;
  results: NotificacionSistema[];
}

/**
 * Contador de notificaciones no leídas
 */
export interface NotificacionesCount {
  count: number;
}
