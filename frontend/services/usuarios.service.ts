/**
 * Servicio para gestión de nuevos usuarios
 *
 * Proporciona métodos para:
 * - Gestionar nuevos usuarios pre-corte (inscripciones nuevas)
 * - Validar usuarios en lote
 * - Buscar usuarios y familias completas
 * - Obtener estadísticas y exportar datos
 * - Marcar usuarios como revisados
 */

import { apiClient } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  NuevoUsuario,
  EstadisticasNuevosUsuarios,
  FileUploadResponse,
  BusquedaUsuarioResponse,
  BusquedaFamiliaResponse,
  ValidarLoteRequest,
  ExportarRequest,
} from "../types";

/**
 * Parámetros de consulta para listar nuevos usuarios
 */
export interface NuevosUsuariosListParams {
  page?: number;
  page_size?: number;
  periodo?: string;
  estado?: string;
  revisado?: boolean;
  centro?: string;
  search?: string;
  ordering?: string;
}

class UsuariosService {
  /**
   * Obtiene lista de nuevos usuarios con paginación y filtros
   */
  async getNuevosUsuarios(
    params?: NuevosUsuariosListParams
  ): Promise<ApiResponse<PaginatedResponse<NuevoUsuario>>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.periodo) queryParams.append("periodo", params.periodo);
    if (params?.estado) queryParams.append("estado", params.estado);
    if (params?.revisado !== undefined)
      queryParams.append("revisado", params.revisado.toString());
    if (params?.centro) queryParams.append("centro", params.centro);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const endpoint = `/nuevos-usuarios/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return apiClient.get<PaginatedResponse<NuevoUsuario>>(endpoint);
  }

  /**
   * Obtiene un usuario específico por ID
   */
  async getUsuarioById(id: number): Promise<ApiResponse<NuevoUsuario>> {
    return apiClient.get<NuevoUsuario>(`/nuevos-usuarios/${id}/`);
  }

  /**
   * Crea un nuevo usuario
   */
  async createUsuario(
    usuario: Partial<NuevoUsuario>
  ): Promise<ApiResponse<NuevoUsuario>> {
    return apiClient.post<NuevoUsuario>("/nuevos-usuarios/", usuario);
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(
    id: number,
    usuario: Partial<NuevoUsuario>
  ): Promise<ApiResponse<NuevoUsuario>> {
    return apiClient.put<NuevoUsuario>(`/nuevos-usuarios/${id}/`, usuario);
  }

  /**
   * Elimina un usuario
   */
  async deleteUsuario(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/nuevos-usuarios/${id}/`);
  }

  /**
   * Marca un usuario como revisado
   */
  async marcarRevisado(id: number): Promise<ApiResponse<NuevoUsuario>> {
    return apiClient.post<NuevoUsuario>(
      `/nuevos-usuarios/${id}/marcar-revisado/`
    );
  }

  /**
   * Sube un archivo con nuevos usuarios
   */
  async uploadUsuarios(
    file: File
  ): Promise<ApiResponse<FileUploadResponse>> {
    return apiClient.uploadFile<FileUploadResponse>(
      "/nuevos-usuarios/upload/",
      file
    );
  }

  /**
   * Obtiene estadísticas de nuevos usuarios
   */
  async getEstadisticas(): Promise<ApiResponse<EstadisticasNuevosUsuarios>> {
    return apiClient.get<EstadisticasNuevosUsuarios>(
      "/nuevos-usuarios/estadisticas/"
    );
  }

  /**
   * Obtiene historial de nuevos usuarios por período
   */
  async getHistorial(params?: {
    anio?: number;
    mes?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params?.anio) queryParams.append("anio", params.anio.toString());
    if (params?.mes) queryParams.append("mes", params.mes.toString());

    const endpoint = `/nuevos-usuarios/historial/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return apiClient.get<any>(endpoint);
  }

  /**
   * Exporta usuarios a Excel
   */
  async exportarUsuarios(params?: ExportarRequest): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams();

    if (params?.periodo) queryParams.append("periodo", params.periodo);
    if (params?.estado) queryParams.append("estado", params.estado);
    if (params?.formato) queryParams.append("formato", params.formato);

    const endpoint = `/nuevos-usuarios/exportar/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    // Para descargas de archivos, necesitamos manejar el blob directamente
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: "Error al exportar usuarios",
            status: response.status,
          },
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Error desconocido",
          status: 0,
        },
      };
    }
  }

  /**
   * Valida usuarios en lote
   */
  async validarLote(
    request: ValidarLoteRequest
  ): Promise<ApiResponse<{ validados: number }>> {
    return apiClient.post<{ validados: number }>(
      "/nuevos-usuarios/validar-lote/",
      request
    );
  }

  /**
   * Busca un usuario por RUT con toda su información
   */
  async buscarUsuario(
    run: string
  ): Promise<ApiResponse<BusquedaUsuarioResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("run", run);
    return apiClient.get<BusquedaUsuarioResponse>(
      `/buscar-usuario/?${queryParams}`
    );
  }

  /**
   * Busca la familia de un usuario por RUT
   */
  async buscarFamilia(
    run: string
  ): Promise<ApiResponse<BusquedaFamiliaResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("run", run);
    return apiClient.get<BusquedaFamiliaResponse>(
      `/buscar-familia/?${queryParams}`
    );
  }
}

export const usuariosService = new UsuariosService();
