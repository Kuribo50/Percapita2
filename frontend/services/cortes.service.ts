/**
 * Servicio para gestión de cortes FONASA
 */

import { apiClient, ApiResponse } from './api';

export interface CorteFonasa {
  id: number;
  run: string;
  nombres: string;
  ap_paterno: string;
  ap_materno: string;
  fecha_nacimiento: string;
  genero: string;
  tramo: string;
  fecha_corte: string;
  centro_salud?: number;
  nombre_centro: string;
  centro_de_procedencia: string;
  comuna_de_procedencia: string;
  centro_actual: string;
  comuna_actual: string;
  aceptado_rechazado: string;
  motivo: string;
  motivo_normalizado: string;
  creado_el: string;
}

export interface CorteFonasaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CorteFonasa[];
}

export interface UploadCorteResponse {
  message: string;
  count: number;
  errors?: string[];
}

class CortesService {
  /**
   * Obtiene lista de cortes FONASA con paginación
   */
  async getCortes(params?: {
    page?: number;
    page_size?: number;
    fecha_corte?: string;
    centro_salud?: number;
    motivo_normalizado?: string;
  }): Promise<ApiResponse<CorteFonasaListResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.fecha_corte) queryParams.append('fecha_corte', params.fecha_corte);
    if (params?.centro_salud) queryParams.append('centro_salud', params.centro_salud.toString());
    if (params?.motivo_normalizado) queryParams.append('motivo_normalizado', params.motivo_normalizado);

    const endpoint = `/corte-fonasa/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<CorteFonasaListResponse>(endpoint);
  }

  /**
   * Obtiene un corte específico por ID
   */
  async getCorteById(id: number): Promise<ApiResponse<CorteFonasa>> {
    return apiClient.get<CorteFonasa>(`/corte-fonasa/${id}/`);
  }

  /**
   * Sube un archivo de cortes FONASA
   */
  async uploadCorte(file: File): Promise<ApiResponse<UploadCorteResponse>> {
    return apiClient.uploadFile<UploadCorteResponse>('/corte-fonasa/', file);
  }

  /**
   * Busca cortes por RUN
   */
  async buscarPorRun(run: string): Promise<ApiResponse<CorteFonasa[]>> {
    return apiClient.get<CorteFonasa[]>(`/corte-fonasa/?run=${run}`);
  }
}

export const cortesService = new CortesService();
