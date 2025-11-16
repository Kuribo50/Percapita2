/**
 * Servicio de Notificaciones del Sistema
 *
 * Proporciona funciones para gestionar notificaciones de usuario,
 * permitiendo marcar como leídas y obtener contadores.
 */

import { api } from "./api";
import type {
  NotificacionSistema,
  NotificacionesResponse,
  NotificacionesCount,
} from "../types";

/**
 * Obtener lista de notificaciones del usuario actual
 *
 * @param leidas - Filtrar por notificaciones leídas (true) o no leídas (false)
 * @param limit - Número máximo de notificaciones a retornar
 */
export async function getNotificaciones(
  leidas?: boolean,
  limit?: number
): Promise<NotificacionesResponse> {
  const params = new URLSearchParams();

  if (leidas !== undefined) {
    params.append("leidas", leidas.toString());
  }
  if (limit) {
    params.append("limit", limit.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/notificaciones/?${queryString}` : "/notificaciones/";

  const response = await api.get<NotificacionesResponse>(url);
  return response.data;
}

/**
 * Marcar una notificación como leída
 */
export async function marcarNotificacionLeida(
  id: number
): Promise<{ mensaje: string; id: number }> {
  const response = await api.post<{ mensaje: string; id: number }>(
    `/notificaciones/${id}/marcar-leida/`
  );
  return response.data;
}

/**
 * Marcar todas las notificaciones del usuario como leídas
 */
export async function marcarTodasLeidas(): Promise<{ mensaje: string; count: number }> {
  const response = await api.post<{ mensaje: string; count: number }>(
    "/notificaciones/marcar-todas-leidas/"
  );
  return response.data;
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getNotificacionesNoLeidasCount(): Promise<number> {
  const response = await api.get<NotificacionesCount>("/notificaciones/count/");
  return response.data.count;
}
