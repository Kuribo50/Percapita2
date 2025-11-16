/**
 * Servicio para gestión del historial de cargas
 *
 * Maneja el historial de archivos subidos al sistema:
 * - Cortes FONASA
 * - HP Trakcare
 * - Nuevos Usuarios
 *
 * Incluye estadísticas de éxito/error por cada carga.
 */

import { apiClient } from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  HistorialCarga,
  HistorialCargaFilters
} from '../types';

class HistorialService {
  /**
   * Obtiene el historial de cargas con paginación y filtros
   */
  async getHistorial(params?: HistorialCargaFilters & {
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<HistorialCarga>>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.tipoArchivo) queryParams.append('tipo_archivo', params.tipoArchivo);
    if (params?.periodo) queryParams.append('periodo', params.periodo);
    if (params?.fechaDesde) queryParams.append('fecha_desde', params.fechaDesde);
    if (params?.fechaHasta) queryParams.append('fecha_hasta', params.fechaHasta);

    const endpoint = `/historial-cargas/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<PaginatedResponse<HistorialCarga>>(endpoint);
  }

  /**
   * Obtiene un registro específico del historial por ID
   */
  async getHistorialById(id: number): Promise<ApiResponse<HistorialCarga>> {
    return apiClient.get<HistorialCarga>(`/historial-cargas/${id}/`);
  }

  /**
   * Elimina un registro del historial
   */
  async deleteHistorial(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/historial-cargas/${id}/`);
  }
}

export const historialService = new HistorialService();
