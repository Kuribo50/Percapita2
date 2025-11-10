/**
 * Servicio para gestión del historial de cargas
 * Maneja el historial de archivos subidos al sistema
 */

import { apiClient, ApiResponse } from './api';

export interface HistorialCarga {
  id: number;
  tipo: 'usuarios' | 'cortes';
  nombreArchivo: string;
  registrosProcesados: number;
  registrosExitosos: number;
  registrosError: number;
  estado: 'completado' | 'procesando' | 'error';
  usuarioId: number;
  usuarioNombre: string;
  creadoEl: string;
  detalleErrores?: string[];
}

export interface HistorialCargaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HistorialCarga[];
}

class HistorialService {
  /**
   * Obtiene el historial de cargas con paginación
   */
  async getHistorial(params?: {
    page?: number;
    page_size?: number;
    tipo?: 'usuarios' | 'cortes';
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ApiResponse<HistorialCargaListResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
    if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);

    const endpoint = `/historial-cargas/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<HistorialCargaListResponse>(endpoint);
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
