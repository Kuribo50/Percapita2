/**
 * Barrel export para servicios
 *
 * Exporta todos los servicios desde un punto central.
 * Los tipos se importan desde types/index.ts para evitar duplicación.
 */

// ==================== API CLIENT ====================
export { apiClient } from './api';

// ==================== AUTENTICACIÓN ====================
export { authService } from './auth.service';
export type { RegisterData, AuthTokens } from './auth.service';

// ==================== CORTES FONASA ====================
export { cortesService } from './cortes.service';
export type { CortesListParams } from './cortes.service';

// ==================== NUEVOS USUARIOS ====================
export { usuariosService } from './usuarios.service';
export type { NuevosUsuariosListParams } from './usuarios.service';

// ==================== CATÁLOGOS ====================
export { catalogosService } from './catalogos.service';
export type { CentroSalud } from './catalogos.service';

// ==================== HISTORIAL DE CARGAS ====================
export { historialService } from './historial.service';
