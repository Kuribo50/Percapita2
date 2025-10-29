// Utilidad para gestionar los catálogos de configuración

export interface CatalogoItem {
  id: number;
  nombre: string;
  codigo?: string;
  color?: string;
}

const DEFAULT_CATALOGOS = {
  etnias: [
    { id: 1, nombre: 'Mapuche' },
    { id: 2, nombre: 'Aymara' },
    { id: 3, nombre: 'Rapa Nui' },
    { id: 4, nombre: 'Ninguna' },
    { id: 5, nombre: 'Otra' },
  ],
  nacionalidades: [
    { id: 1, nombre: 'Chilena' },
    { id: 2, nombre: 'Venezolana' },
    { id: 3, nombre: 'Haitiana' },
    { id: 4, nombre: 'Colombiana' },
    { id: 5, nombre: 'Peruana' },
    { id: 6, nombre: 'Otra' },
  ],
  sectores: [
    { id: 1, nombre: 'Sector 1', codigo: 'S1', color: '#3B82F6' },
    { id: 2, nombre: 'Sector 2', codigo: 'S2', color: '#10B981' },
    { id: 3, nombre: 'Sector 3', codigo: 'S3', color: '#F59E0B' },
  ],
  subsectores: [
    { id: 1, nombre: 'Subsector A', codigo: 'A' },
    { id: 2, nombre: 'Subsector B', codigo: 'B' },
    { id: 3, nombre: 'Subsector C', codigo: 'C' },
  ],
  establecimientos: [
    { id: 1, nombre: 'CESFAM Principal', codigo: 'CARR' },
    { id: 2, nombre: 'CESFAM Norte', codigo: 'NORT' },
    { id: 3, nombre: 'CESFAM Sur', codigo: 'SUR' },
  ],
};

export type CatalogoTipo = keyof typeof DEFAULT_CATALOGOS;

export const getCatalogo = (tipo: CatalogoTipo): CatalogoItem[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_CATALOGOS[tipo];
  }

  const stored = localStorage.getItem(`catalogo_${tipo}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_CATALOGOS[tipo];
    }
  }
  return DEFAULT_CATALOGOS[tipo];
};

export const saveCatalogo = (tipo: CatalogoTipo, items: CatalogoItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`catalogo_${tipo}`, JSON.stringify(items));
};

export const resetCatalogo = (tipo: CatalogoTipo): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`catalogo_${tipo}`);
};

export const getAllCatalogos = () => {
  return {
    etnias: getCatalogo('etnias'),
    nacionalidades: getCatalogo('nacionalidades'),
    sectores: getCatalogo('sectores'),
    subsectores: getCatalogo('subsectores'),
    establecimientos: getCatalogo('establecimientos'),
  };
};
