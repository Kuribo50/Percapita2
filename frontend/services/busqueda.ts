/**
 * Servicio de Búsqueda Global
 *
 * Proporciona funciones para realizar búsquedas unificadas en todo el sistema,
 * buscando en usuarios, cortes, HP Trakcare, establecimientos y logs.
 */

import { api } from "./api";
import type { BusquedaGlobalResponse } from "../types";

/**
 * Realiza una búsqueda global en todo el sistema
 *
 * @param query - Término de búsqueda (mínimo 2 caracteres)
 * @param limit - Límite de resultados por categoría (default 5, max 20)
 */
export async function busquedaGlobal(
  query: string,
  limit?: number
): Promise<BusquedaGlobalResponse> {
  const params = new URLSearchParams();
  params.append("q", query);

  if (limit) {
    params.append("limit", limit.toString());
  }

  const response = await api.get<BusquedaGlobalResponse>(
    `/busqueda-global/?${params.toString()}`
  );
  return response.data;
}
