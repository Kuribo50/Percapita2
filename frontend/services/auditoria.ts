/**
 * Servicio de Auditoría y Logs del Sistema
 *
 * Proporciona funciones para interactuar con el sistema de logs y auditoría,
 * permitiendo a los administradores revisar todas las acciones realizadas.
 */

import { api } from "./api";
import type {
  LogActividad,
  LogFiltros,
  LogsResponse,
  AccionDisponible,
  ModuloDisponible,
} from "../types";

/**
 * Obtener lista de logs con filtros opcionales
 */
export async function getLogs(filtros?: LogFiltros): Promise<LogsResponse> {
  const params = new URLSearchParams();

  if (filtros?.usuario_id) {
    params.append("usuario_id", filtros.usuario_id.toString());
  }
  if (filtros?.accion) {
    params.append("accion", filtros.accion);
  }
  if (filtros?.modulo) {
    params.append("modulo", filtros.modulo);
  }
  if (filtros?.fecha_desde) {
    params.append("fecha_desde", filtros.fecha_desde);
  }
  if (filtros?.fecha_hasta) {
    params.append("fecha_hasta", filtros.fecha_hasta);
  }
  if (filtros?.search) {
    params.append("search", filtros.search);
  }
  if (filtros?.limit) {
    params.append("limit", filtros.limit.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/logs/?${queryString}` : "/logs/";

  const response = await api.get<LogsResponse>(url);
  return response.data;
}

/**
 * Obtener detalle de un log específico
 */
export async function getLogDetail(id: number): Promise<LogActividad> {
  const response = await api.get<LogActividad>(`/logs/${id}/`);
  return response.data;
}

/**
 * Obtener lista de acciones disponibles para filtros
 */
export async function getAccionesDisponibles(): Promise<AccionDisponible[]> {
  const response = await api.get<AccionDisponible[]>("/logs/acciones/");
  return response.data;
}

/**
 * Obtener lista de módulos disponibles para filtros
 */
export async function getModulosDisponibles(): Promise<ModuloDisponible[]> {
  const response = await api.get<ModuloDisponible[]>("/logs/modulos/");
  return response.data;
}
