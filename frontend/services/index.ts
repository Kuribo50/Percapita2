/**
 * Barrel export para servicios
 * Exporta todos los servicios desde un punto central
 */

// ==================== API CLIENT ====================
export { apiClient } from './api';
export type { ApiResponse, ApiError } from './api';

// ==================== AUTENTICACIÓN ====================
export { authService } from './auth.service';
export type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  User,
  LoginResponse
} from './auth.service';

// ==================== CORTES FONASA ====================
export { cortesService } from './cortes.service';
export type {
  CorteFonasa,
  CorteFonasaListResponse,
  UploadCorteResponse
} from './cortes.service';

// ==================== NUEVOS USUARIOS ====================
export { usuariosService } from './usuarios.service';
export type {
  NuevoUsuario,
  NuevosUsuariosListResponse,
  UploadUsuariosResponse,
  EstadisticasResponse,
} from './usuarios.service';

// ==================== CATÁLOGOS ====================
export { catalogosService } from './catalogos.service';
export type {
  Etnia,
  Nacionalidad,
  Sector,
  Subsector,
  Establecimiento,
  CentroSalud,
  AllCatalogosResponse,
} from './catalogos.service';

// ==================== HISTORIAL DE CARGAS ====================
export { historialService } from './historial.service';
export type {
  HistorialCarga,
  HistorialCargaListResponse,
} from './historial.service';
