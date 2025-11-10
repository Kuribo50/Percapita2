/**
 * Servicio para gestión de catálogos (etnias, nacionalidades, sectores, etc.)
 * Incluye operaciones CRUD completas para todos los catálogos
 */

import { apiClient, ApiResponse } from './api';

export interface Etnia {
  id: number;
  nombre: string;
  codigo?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Nacionalidad {
  id: number;
  nombre: string;
  codigo?: string;
  codigoPais?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Sector {
  id: number;
  nombre: string;
  codigo?: string;
  color?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  subsectores?: Subsector[];
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Subsector {
  id: number;
  nombre: string;
  codigo?: string;
  sector?: number;
  sectorId?: number;
  sectorNombre?: string;
  color?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Establecimiento {
  id: number;
  nombre: string;
  codigo?: string;
  tipo?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  centros?: CentroSalud[];
  creadoEl?: string;
  modificadoEl?: string;
}

export interface CentroSalud {
  id: number;
  nombre: string;
  codigo?: string;
  establecimiento?: number;
  establecimientoId?: number;
  establecimientoNombre?: string;
  tipo?: string;
  activo: boolean;
  orden?: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface AllCatalogosResponse {
  etnias: Etnia[];
  nacionalidades: Nacionalidad[];
  sectores: Sector[];
  subsectores: Subsector[];
  establecimientos: Establecimiento[];
  centros_salud: CentroSalud[];
}

class CatalogosService {
  // ==================== CATÁLOGOS COMPLETOS ====================

  /**
   * Obtiene todos los catálogos en una sola petición
   */
  async getAllCatalogos(): Promise<ApiResponse<AllCatalogosResponse>> {
    return apiClient.get<AllCatalogosResponse>('/catalogos/all/');
  }

  // ==================== ETNIAS ====================

  /**
   * Obtiene lista de etnias
   */
  async getEtnias(): Promise<ApiResponse<Etnia[]>> {
    return apiClient.get<Etnia[]>('/catalogos/etnias/');
  }

  /**
   * Obtiene una etnia específica por ID
   */
  async getEtniaById(id: number): Promise<ApiResponse<Etnia>> {
    return apiClient.get<Etnia>(`/catalogos/etnias/${id}/`);
  }

  /**
   * Crea una nueva etnia
   */
  async createEtnia(data: Partial<Etnia>): Promise<ApiResponse<Etnia>> {
    return apiClient.post<Etnia>('/catalogos/etnias/', data);
  }

  /**
   * Actualiza una etnia existente
   */
  async updateEtnia(id: number, data: Partial<Etnia>): Promise<ApiResponse<Etnia>> {
    return apiClient.patch<Etnia>(`/catalogos/etnias/${id}/`, data);
  }

  /**
   * Elimina una etnia
   */
  async deleteEtnia(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/etnias/${id}/`);
  }

  // ==================== NACIONALIDADES ====================

  /**
   * Obtiene lista de nacionalidades
   */
  async getNacionalidades(): Promise<ApiResponse<Nacionalidad[]>> {
    return apiClient.get<Nacionalidad[]>('/catalogos/nacionalidades/');
  }

  /**
   * Obtiene una nacionalidad específica por ID
   */
  async getNacionalidadById(id: number): Promise<ApiResponse<Nacionalidad>> {
    return apiClient.get<Nacionalidad>(`/catalogos/nacionalidades/${id}/`);
  }

  /**
   * Crea una nueva nacionalidad
   */
  async createNacionalidad(data: Partial<Nacionalidad>): Promise<ApiResponse<Nacionalidad>> {
    return apiClient.post<Nacionalidad>('/catalogos/nacionalidades/', data);
  }

  /**
   * Actualiza una nacionalidad existente
   */
  async updateNacionalidad(id: number, data: Partial<Nacionalidad>): Promise<ApiResponse<Nacionalidad>> {
    return apiClient.patch<Nacionalidad>(`/catalogos/nacionalidades/${id}/`, data);
  }

  /**
   * Elimina una nacionalidad
   */
  async deleteNacionalidad(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/nacionalidades/${id}/`);
  }

  // ==================== SECTORES ====================

  /**
   * Obtiene lista de sectores
   */
  async getSectores(): Promise<ApiResponse<Sector[]>> {
    return apiClient.get<Sector[]>('/catalogos/sectores/');
  }

  /**
   * Obtiene un sector específico por ID
   */
  async getSectorById(id: number): Promise<ApiResponse<Sector>> {
    return apiClient.get<Sector>(`/catalogos/sectores/${id}/`);
  }

  /**
   * Crea un nuevo sector
   */
  async createSector(data: Partial<Sector>): Promise<ApiResponse<Sector>> {
    return apiClient.post<Sector>('/catalogos/sectores/', data);
  }

  /**
   * Actualiza un sector existente
   */
  async updateSector(id: number, data: Partial<Sector>): Promise<ApiResponse<Sector>> {
    return apiClient.patch<Sector>(`/catalogos/sectores/${id}/`, data);
  }

  /**
   * Elimina un sector
   */
  async deleteSector(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/sectores/${id}/`);
  }

  // ==================== SUBSECTORES ====================

  /**
   * Obtiene lista de subsectores
   */
  async getSubsectores(): Promise<ApiResponse<Subsector[]>> {
    return apiClient.get<Subsector[]>('/catalogos/subsectores/');
  }

  /**
   * Obtiene un subsector específico por ID
   */
  async getSubsectorById(id: number): Promise<ApiResponse<Subsector>> {
    return apiClient.get<Subsector>(`/catalogos/subsectores/${id}/`);
  }

  /**
   * Crea un nuevo subsector
   */
  async createSubsector(data: Partial<Subsector>): Promise<ApiResponse<Subsector>> {
    return apiClient.post<Subsector>('/catalogos/subsectores/', data);
  }

  /**
   * Actualiza un subsector existente
   */
  async updateSubsector(id: number, data: Partial<Subsector>): Promise<ApiResponse<Subsector>> {
    return apiClient.patch<Subsector>(`/catalogos/subsectores/${id}/`, data);
  }

  /**
   * Elimina un subsector
   */
  async deleteSubsector(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/subsectores/${id}/`);
  }

  // ==================== ESTABLECIMIENTOS ====================

  /**
   * Obtiene lista de establecimientos
   */
  async getEstablecimientos(): Promise<ApiResponse<Establecimiento[]>> {
    return apiClient.get<Establecimiento[]>('/catalogos/establecimientos/');
  }

  /**
   * Obtiene un establecimiento específico por ID
   */
  async getEstablecimientoById(id: number): Promise<ApiResponse<Establecimiento>> {
    return apiClient.get<Establecimiento>(`/catalogos/establecimientos/${id}/`);
  }

  /**
   * Crea un nuevo establecimiento
   */
  async createEstablecimiento(data: Partial<Establecimiento>): Promise<ApiResponse<Establecimiento>> {
    return apiClient.post<Establecimiento>('/catalogos/establecimientos/', data);
  }

  /**
   * Actualiza un establecimiento existente
   */
  async updateEstablecimiento(id: number, data: Partial<Establecimiento>): Promise<ApiResponse<Establecimiento>> {
    return apiClient.patch<Establecimiento>(`/catalogos/establecimientos/${id}/`, data);
  }

  /**
   * Elimina un establecimiento
   */
  async deleteEstablecimiento(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/establecimientos/${id}/`);
  }

  // ==================== CENTROS DE SALUD ====================

  /**
   * Obtiene lista de centros de salud
   */
  async getCentrosSalud(): Promise<ApiResponse<CentroSalud[]>> {
    return apiClient.get<CentroSalud[]>('/catalogos/centros-salud/');
  }

  /**
   * Obtiene un centro de salud específico por ID
   */
  async getCentroSaludById(id: number): Promise<ApiResponse<CentroSalud>> {
    return apiClient.get<CentroSalud>(`/catalogos/centros-salud/${id}/`);
  }

  /**
   * Crea un nuevo centro de salud
   */
  async createCentroSalud(data: Partial<CentroSalud>): Promise<ApiResponse<CentroSalud>> {
    return apiClient.post<CentroSalud>('/catalogos/centros-salud/', data);
  }

  /**
   * Actualiza un centro de salud existente
   */
  async updateCentroSalud(id: number, data: Partial<CentroSalud>): Promise<ApiResponse<CentroSalud>> {
    return apiClient.patch<CentroSalud>(`/catalogos/centros-salud/${id}/`, data);
  }

  /**
   * Elimina un centro de salud
   */
  async deleteCentroSalud(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/catalogos/centros-salud/${id}/`);
  }

  /**
   * Obtiene centros disponibles (simplificado)
   */
  async getCentrosDisponibles(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/centros-disponibles/');
  }
}

export const catalogosService = new CatalogosService();
