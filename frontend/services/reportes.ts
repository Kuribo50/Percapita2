/**
 * Servicio de Reportes PDF
 *
 * Proporciona funciones para descargar reportes en formato PDF
 * desde el backend.
 */

import { api } from "./api";

/**
 * Descarga un archivo desde una URL blob
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Descarga reporte de estadísticas en PDF
 *
 * @param centroId - ID del centro (opcional, para filtrar)
 */
export async function descargarReporteEstadisticas(
  centroId?: number
): Promise<void> {
  const params = new URLSearchParams();
  if (centroId) {
    params.append("centro_id", centroId.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `/reportes/estadisticas/?${queryString}`
    : "/reportes/estadisticas/";

  const response = await api.get(url, {
    responseType: "blob",
  });

  const filename = `estadisticas_${new Date().toISOString().split("T")[0]}.pdf`;
  downloadBlob(response.data, filename);
}

/**
 * Descarga reporte de usuarios en PDF
 *
 * @param filtros - Filtros opcionales (centro_id, estado, fecha_desde, fecha_hasta)
 */
export async function descargarReporteUsuarios(filtros?: {
  centro_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<void> {
  const params = new URLSearchParams();

  if (filtros?.centro_id) {
    params.append("centro_id", filtros.centro_id.toString());
  }
  if (filtros?.estado) {
    params.append("estado", filtros.estado);
  }
  if (filtros?.fecha_desde) {
    params.append("fecha_desde", filtros.fecha_desde);
  }
  if (filtros?.fecha_hasta) {
    params.append("fecha_hasta", filtros.fecha_hasta);
  }

  const queryString = params.toString();
  const url = queryString
    ? `/reportes/usuarios/?${queryString}`
    : "/reportes/usuarios/";

  const response = await api.get(url, {
    responseType: "blob",
  });

  const filename = `usuarios_${new Date().toISOString().split("T")[0]}.pdf`;
  downloadBlob(response.data, filename);
}

/**
 * Descarga reporte de logs en PDF (solo ADMIN)
 *
 * @param filtros - Filtros opcionales (fecha_desde, fecha_hasta, accion)
 */
export async function descargarReporteLogs(filtros?: {
  fecha_desde?: string;
  fecha_hasta?: string;
  accion?: string;
}): Promise<void> {
  const params = new URLSearchParams();

  if (filtros?.fecha_desde) {
    params.append("fecha_desde", filtros.fecha_desde);
  }
  if (filtros?.fecha_hasta) {
    params.append("fecha_hasta", filtros.fecha_hasta);
  }
  if (filtros?.accion) {
    params.append("accion", filtros.accion);
  }

  const queryString = params.toString();
  const url = queryString ? `/reportes/logs/?${queryString}` : "/reportes/logs/";

  const response = await api.get(url, {
    responseType: "blob",
  });

  const filename = `logs_${new Date().toISOString().split("T")[0]}.pdf`;
  downloadBlob(response.data, filename);
}
