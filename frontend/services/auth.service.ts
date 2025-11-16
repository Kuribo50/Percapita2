/**
 * Servicio de autenticación
 *
 * Maneja:
 * - Inicio de sesión y registro de usuarios
 * - Gestión de tokens JWT (access y refresh)
 * - Cierre de sesión
 * - Almacenamiento de credenciales en localStorage
 * - Verificación de estado de autenticación
 */

import { apiClient } from './api';
import type {
  ApiResponse,
  User,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest
} from '../types';

/**
 * Datos para registro de nuevo usuario del sistema
 */
export interface RegisterData {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  establecimiento: string;
  password: string;
}

/**
 * Tokens de autenticación JWT
 */
export interface AuthTokens {
  access: string;
  refresh: string;
}

class AuthService {
  /**
   * Inicia sesión y obtiene tokens JWT
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);

    if (response.success && response.data) {
      // Guardar token y usuario en localStorage
      if ('token' in response.data) {
        this.setAccessToken(response.data.token);
      }
      this.setUser(response.data.user);
    }

    return response;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/register/', userData);

    if (response.success && response.data) {
      if ('token' in response.data) {
        this.setAccessToken(response.data.token);
      }
      this.setUser(response.data.user);
    }

    return response;
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return {
        success: false,
        error: {
          message: 'No hay token de refresco disponible',
          status: 401,
        },
      };
    }

    const response = await apiClient.post<AuthTokens>('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    if (response.success && response.data) {
      this.setTokens(response.data);
    }

    return response;
  }

  /**
   * Obtiene el usuario actual desde el servidor
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me/');
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password/', request);
  }

  /**
   * Guarda los tokens en localStorage
   */
  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('authToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  }

  /**
   * Guarda solo el token de acceso
   */
  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  /**
   * Guarda los datos del usuario en localStorage
   */
  private setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Obtiene el refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Obtiene el usuario guardado en localStorage
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
