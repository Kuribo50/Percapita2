/**
 * Cliente HTTP centralizado para todas las llamadas a la API
 * Proporciona interceptores, manejo de errores y configuración unificada
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Genera headers incluyendo autenticación si está disponible
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = { ...this.defaultHeaders, ...customHeaders };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Maneja errores de la API de manera consistente
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || data.detail || 'Error en la solicitud',
            status: response.status,
            data,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          status: response.status,
        },
      };
    }
  }

  /**
   * Realiza una petición GET
   */
  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options?.headers),
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }

  /**
   * Realiza una petición POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(options?.headers),
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }

  /**
   * Sube un archivo usando FormData
   */
  async uploadFile<T = unknown>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de red',
          status: 0,
        },
      };
    }
  }
}

// Exportar instancia única del cliente
export const apiClient = new ApiClient();

// Exportar tipos
export type { ApiResponse, ApiError };
