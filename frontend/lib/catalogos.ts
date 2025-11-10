// Utilidad para gestionar los catálogos de configuración

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== INTERFACES ====================

export interface Etnia {
  id: number;
  nombre: string;
  codigo?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Nacionalidad {
  id: number;
  nombre: string;
  codigo?: string;
  codigoPais?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Sector {
  id: number;
  nombre: string;
  codigo?: string;
  color?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  subsectores?: Subsector[];
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Subsector {
  id: number;
  nombre: string;
  codigo?: string;
  sector?: number;
  sectorId?: number;
  sectorNombre?: string;
  color?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface Establecimiento {
  id: number;
  nombre: string;
  codigo?: string;
  tipo?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  centros?: CentroSalud[];
  creadoEl?: string;
  modificadoEl?: string;
}

export interface CentroSalud {
  id: number;
  nombre: string;
  codigo?: string;
  establecimiento?: number;
  establecimientoId?: number;
  establecimientoNombre?: string;
  tipo?: string;
  activo: boolean;
  orden: number;
  descripcion?: string;
  creadoEl?: string;
  modificadoEl?: string;
}

export interface AllCatalogos {
  etnias: Etnia[];
  nacionalidades: Nacionalidad[];
  sectores: Sector[];
  subsectores: Subsector[];
  establecimientos: Establecimiento[];
  centros_salud: CentroSalud[];
}

// ==================== API FUNCTIONS ====================

/**
 * Obtiene todos los catálogos en una sola llamada
 */
export async function getAllCatalogos(): Promise<AllCatalogos> {
  try {
    console.log('Fetching catalogos from:', `${API_URL}/api/catalogos/all/`);
    const response = await fetch(`${API_URL}/api/catalogos/all/`, {
      headers: {
        Accept: 'application/json',
      },
    });
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al obtener catálogos: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const preview = (await response.text()).slice(0, 200);
      throw new Error(
        `Respuesta inesperada del servidor (${response.status} ${response.statusText}). Primeros bytes: ${preview}`,
      );
    }

    let data: AllCatalogos;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(
        parseError instanceof Error
          ? `No se pudo procesar la respuesta de catálogos: ${parseError.message}`
          : 'No se pudo procesar la respuesta de catálogos.',
      );
    }
    console.log('Catalogos loaded:', data);
    return data;
  } catch (error) {
    console.error('Error en getAllCatalogos:', error);
    throw error;
  }
}

/**
 * Obtiene todas las etnias
 */
export async function getEtnias(): Promise<Etnia[]> {
  const response = await fetch(`${API_URL}/api/catalogos/etnias/`);
  if (!response.ok) {
    throw new Error('Error al obtener etnias');
  }
  return response.json();
}

/**
 * Crea una nueva etnia
 */
export async function createEtnia(data: Partial<Etnia>): Promise<Etnia> {
  const response = await fetch(`${API_URL}/api/catalogos/etnias/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear etnia');
  }
  return response.json();
}

/**
 * Actualiza una etnia
 */
export async function updateEtnia(id: number, data: Partial<Etnia>): Promise<Etnia> {
  const response = await fetch(`${API_URL}/api/catalogos/etnias/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar etnia');
  }
  return response.json();
}

/**
 * Desactiva una etnia
 */
export async function deleteEtnia(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/etnias/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar etnia');
  }
}

/**
 * Obtiene todas las nacionalidades
 */
export async function getNacionalidades(): Promise<Nacionalidad[]> {
  const response = await fetch(`${API_URL}/api/catalogos/nacionalidades/`);
  if (!response.ok) {
    throw new Error('Error al obtener nacionalidades');
  }
  return response.json();
}

/**
 * Crea una nueva nacionalidad
 */
export async function createNacionalidad(data: Partial<Nacionalidad>): Promise<Nacionalidad> {
  const response = await fetch(`${API_URL}/api/catalogos/nacionalidades/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear nacionalidad');
  }
  return response.json();
}

/**
 * Actualiza una nacionalidad
 */
export async function updateNacionalidad(id: number, data: Partial<Nacionalidad>): Promise<Nacionalidad> {
  const response = await fetch(`${API_URL}/api/catalogos/nacionalidades/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar nacionalidad');
  }
  return response.json();
}

/**
 * Desactiva una nacionalidad
 */
export async function deleteNacionalidad(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/nacionalidades/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar nacionalidad');
  }
}

/**
 * Obtiene todos los sectores (incluye subsectores anidados)
 */
export async function getSectores(): Promise<Sector[]> {
  const response = await fetch(`${API_URL}/api/catalogos/sectores/`);
  if (!response.ok) {
    throw new Error('Error al obtener sectores');
  }
  return response.json();
}

/**
 * Crea un nuevo sector
 */
export async function createSector(data: Partial<Sector>): Promise<Sector> {
  const response = await fetch(`${API_URL}/api/catalogos/sectores/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear sector');
  }
  return response.json();
}

/**
 * Actualiza un sector
 */
export async function updateSector(id: number, data: Partial<Sector>): Promise<Sector> {
  const response = await fetch(`${API_URL}/api/catalogos/sectores/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar sector');
  }
  return response.json();
}

/**
 * Desactiva un sector
 */
export async function deleteSector(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/sectores/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar sector');
  }
}

/**
 * Obtiene todos los subsectores
 */
export async function getSubsectores(): Promise<Subsector[]> {
  const response = await fetch(`${API_URL}/api/catalogos/subsectores/`);
  if (!response.ok) {
    throw new Error('Error al obtener subsectores');
  }
  return response.json();
}

/**
 * Crea un nuevo subsector
 */
export async function createSubsector(data: Partial<Subsector>): Promise<Subsector> {
  const response = await fetch(`${API_URL}/api/catalogos/subsectores/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear subsector');
  }
  return response.json();
}

/**
 * Actualiza un subsector
 */
export async function updateSubsector(id: number, data: Partial<Subsector>): Promise<Subsector> {
  const response = await fetch(`${API_URL}/api/catalogos/subsectores/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar subsector');
  }
  return response.json();
}

/**
 * Desactiva un subsector
 */
export async function deleteSubsector(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/subsectores/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar subsector');
  }
}

/**
 * Obtiene todos los establecimientos (incluye centros anidados)
 */
export async function getEstablecimientos(): Promise<Establecimiento[]> {
  const response = await fetch(`${API_URL}/api/catalogos/establecimientos/`);
  if (!response.ok) {
    throw new Error('Error al obtener establecimientos');
  }
  return response.json();
}

/**
 * Crea un nuevo establecimiento
 */
export async function createEstablecimiento(data: Partial<Establecimiento>): Promise<Establecimiento> {
  const response = await fetch(`${API_URL}/api/catalogos/establecimientos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear establecimiento');
  }
  return response.json();
}

/**
 * Actualiza un establecimiento
 */
export async function updateEstablecimiento(id: number, data: Partial<Establecimiento>): Promise<Establecimiento> {
  const response = await fetch(`${API_URL}/api/catalogos/establecimientos/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar establecimiento');
  }
  return response.json();
}

/**
 * Desactiva un establecimiento
 */
export async function deleteEstablecimiento(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/establecimientos/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar establecimiento');
  }
}

/**
 * Obtiene todos los centros de salud
 */
export async function getCentrosSalud(): Promise<CentroSalud[]> {
  const response = await fetch(`${API_URL}/api/catalogos/centros-salud/`);
  if (!response.ok) {
    throw new Error('Error al obtener centros de salud');
  }
  return response.json();
}

/**
 * Crea un nuevo centro de salud
 */
export async function createCentroSalud(data: Partial<CentroSalud>): Promise<CentroSalud> {
  const response = await fetch(`${API_URL}/api/catalogos/centros-salud/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear centro de salud');
  }
  return response.json();
}

/**
 * Actualiza un centro de salud
 */
export async function updateCentroSalud(id: number, data: Partial<CentroSalud>): Promise<CentroSalud> {
  const response = await fetch(`${API_URL}/api/catalogos/centros-salud/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar centro de salud');
  }
  return response.json();
}

/**
 * Desactiva un centro de salud
 */
export async function deleteCentroSalud(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/catalogos/centros-salud/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar centro de salud');
  }
}
