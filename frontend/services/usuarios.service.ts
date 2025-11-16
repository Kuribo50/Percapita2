/**
 * Servicio para gestión de nuevos usuarios
 */

import { apiClient, ApiResponse } from "./api";

export interface NuevoUsuario {
  id: number;
  run: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  centro_inscripcion: number;
  etnia?: number;
  nacionalidad?: number;
  sector?: number;
  revisado: boolean;
  observaciones?: string;
  creado_el: string;
  actualizado_el: string;
}

export interface NuevosUsuariosListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NuevoUsuario[];
}

export interface UploadUsuariosResponse {
  message: string;
  count: number;
  errors?: string[];
}

export interface EstadisticasResponse {
  total: number;
  validated: number;
  nonValidated: number;
  totalCortes: number;
  toReview: number;
  newThisMonth: number;
  validatedByCenter?: Record<string, number>;
}

class UsuariosService {
  /**
   * Obtiene lista de nuevos usuarios con paginación y filtros
   */
  async getNuevosUsuarios(params?: {
    page?: number;
    page_size?: number;
    revisado?: boolean;
    centro_inscripcion?: number;
    search?: string;
  }): Promise<ApiResponse<NuevosUsuariosListResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.revisado !== undefined)
      queryParams.append("revisado", params.revisado.toString());
    if (params?.centro_inscripcion)
      queryParams.append(
        "centro_inscripcion",
        params.centro_inscripcion.toString()
      );
    if (params?.search) queryParams.append("search", params.search);

    const endpoint = `/nuevos-usuarios/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return apiClient.get<NuevosUsuariosListResponse>(endpoint);
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
  ): Promise<ApiResponse<UploadUsuariosResponse>> {
    return apiClient.uploadFile<UploadUsuariosResponse>(
      "/nuevos-usuarios/upload/",
      file
    );
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getEstadisticas(): Promise<ApiResponse<EstadisticasResponse>> {
    return apiClient.get<EstadisticasResponse>(
      "/nuevos-usuarios/estadisticas/"
    );
  }

  /**
   * Exporta usuarios a Excel
   */
  async exportarUsuarios(params?: {
    revisado?: boolean;
    centro_inscripcion?: number;
  }): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams();

    if (params?.revisado !== undefined)
      queryParams.append("revisado", params.revisado.toString());
    if (params?.centro_inscripcion)
      queryParams.append(
        "centro_inscripcion",
        params.centro_inscripcion.toString()
      );

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
    ids: number[]
  ): Promise<ApiResponse<{ validated: number }>> {
    return apiClient.post<{ validated: number }>(
      "/nuevos-usuarios/validar-lote/",
      { ids }
    );
  }

  /**
   * Busca un usuario por RUT con toda su información
   */
  async buscarUsuario(
    run: string
  ): Promise<ApiResponse<BuscarUsuarioResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("run", run);
    return apiClient.get<BuscarUsuarioResponse>(
      `/buscar-usuario/?${queryParams}`
    );
  }

  /**
   * Busca la familia de un usuario por RUT
   */
  async buscarFamilia(
    run: string
  ): Promise<ApiResponse<BuscarFamiliaResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("run", run);
    return apiClient.get<BuscarFamiliaResponse>(
      `/buscar-familia/?${queryParams}`
    );
  }
}

export interface BuscarUsuarioResponse {
  run: string;
  encontrado: boolean;
  cortes_por_mes: CortesPorMes[];
  hp_trakcare: HpTrakcareData | null;
  nuevos_usuarios: NuevoUsuarioData[];
  total_meses: number;
  total_nuevos_usuarios: number;
}

export interface CortesPorMes {
  mes_key: string;
  mes: string;
  fecha_corte: string;
  registros: CorteRegistro[];
  validado: boolean | null;
  observaciones: ObservacionData[];
}

export interface CorteRegistro {
  id: number;
  run: string;
  nombres: string;
  ap_paterno: string;
  ap_materno: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string;
  tramo: string;
  centro_salud: string;
  nombre_centro: string | null;
  centro_procedencia: string;
  comuna_procedencia: string;
  centro_actual: string;
  comuna_actual: string;
  aceptado_rechazado: string;
  motivo: string;
  validado: boolean;
}

export interface ObservacionData {
  id: number;
  corte_id: number;
  titulo: string;
  texto: string;
  estado_revision: string;
  tipo: string;
  autor_nombre: string;
  created_at: string;
  adjunto: string | null;
}

export interface HpTrakcareData {
  id: number;
  cod_familia: string;
  relacion_parentezco: string;
  id_trakcare: string;
  cod_registro: string;
  run: string;
  ap_paterno: string;
  ap_materno: string;
  nombre: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string;
  edad: number | null;
  direccion: string;
  telefono: string;
  telefono_celular: string;
  telefono_recado: string;
  servicio_salud: string;
  etnia: string | null;
  nacionalidad: string | null;
  centro_inscripcion: string | null;
  sector: string | null;
  prevision: string;
  plan_trakcare: string;
  prais_trakcare: string;
  fecha_incorporacion: string | null;
  fecha_ultima_modif: string | null;
  fecha_defuncion: string | null;
  esta_vivo: boolean;
}

export interface NuevoUsuarioData {
  id: number;
  run: string;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_inscripcion: string | null;
  periodo: string;
  periodo_mes: number;
  periodo_anio: number;
  nacionalidad: string | null;
  etnia: string | null;
  sector: string | null;
  subsector: string | null;
  centro: string;
  establecimiento: string | null;
  codigo_percapita: string;
  estado: string;
  estado_display: string;
  revisado: boolean;
  revisado_manualmente: boolean;
  revisado_por: string;
  revisado_el: string | null;
  observaciones: string;
  observaciones_trakcare: string;
  creado_el: string | null;
  creado_por: string;
}

export interface BuscarFamiliaResponse {
  run: string;
  encontrado: boolean;
  mensaje?: string;
  cod_familia: string | null;
  total_miembros: number;
  miembros: MiembroFamilia[];
}

export interface MiembroFamilia {
  id: number;
  cod_familia: string;
  relacion_parentezco: string;
  run: string;
  nombre_completo: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  fecha_nacimiento: string | null;
  genero: string;
  edad: number | null;
  direccion: string;
  telefono: string;
  telefono_celular: string;
  centro_inscripcion: string | null;
  sector: string | null;
  esta_vivo: boolean;
  es_principal: boolean;
  total_cortes: number;
  ultimo_corte: string | null;
  tiene_validados: boolean;
}

export const usuariosService = new UsuariosService();
