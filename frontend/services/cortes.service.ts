/**
 * Servicio para gestión de cortes FONASA
 *
 * Proporciona métodos para:
 * - Consultar cortes FONASA con paginación y filtros
 * - Obtener detalles de un corte específico
 * - Subir archivos de cortes
 * - Buscar cortes por RUN
 * - Obtener historial mensual de cortes
 */

import { apiClient } from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  CorteFonasa,
  FileUploadResponse,
  HistorialMensualCorte
} from '../types';

/**
 * Parámetros de consulta para listar cortes
 */
export interface CortesListParams {
  page?: number;
  page_size?: number;
  fecha_corte?: string;
  centro_salud?: number;
  motivo_normalizado?: string;
  run?: string;
  validado?: boolean;
}

class CortesService {
  /**
   * Obtiene lista de cortes FONASA con paginación y filtros
   */
  async getCortes(params?: CortesListParams): Promise<ApiResponse<PaginatedResponse<CorteFonasa>>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.fecha_corte) queryParams.append('fecha_corte', params.fecha_corte);
    if (params?.centro_salud) queryParams.append('centro_salud', params.centro_salud.toString());
    if (params?.motivo_normalizado) queryParams.append('motivo_normalizado', params.motivo_normalizado);
    if (params?.run) queryParams.append('run', params.run);
    if (params?.validado !== undefined) queryParams.append('validado', params.validado.toString());

    const endpoint = `/corte-fonasa/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<PaginatedResponse<CorteFonasa>>(endpoint);
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
  async uploadCorte(file: File): Promise<ApiResponse<FileUploadResponse>> {
    return apiClient.uploadFile<FileUploadResponse>('/corte-fonasa/', file);
  }

  /**
   * Busca cortes por RUN
   */
  async buscarPorRun(run: string): Promise<ApiResponse<CorteFonasa[]>> {
    return apiClient.get<CorteFonasa[]>(`/corte-fonasa/?run=${encodeURIComponent(run)}`);
  }

  /**
   * Obtiene el historial mensual de cortes FONASA
   */
  async getHistorialMensual(): Promise<ApiResponse<HistorialMensualCorte[]>> {
    return apiClient.get<HistorialMensualCorte[]>('/corte-fonasa/historial-mensual/');
  }

  /**
   * Elimina un corte específico por ID
   */
  async deleteCorte(id: number, adminPassword?: string): Promise<ApiResponse<void>> {
    const params = adminPassword ? { admin_password: adminPassword } : undefined;
    return apiClient.delete<void>(`/corte-fonasa/${id}/`, params);
  }
}

export const cortesService = new CortesService();
