"use client";

import { useCallback, useEffect, useState } from 'react';
import {
	getAllCatalogos,
	type CentroSalud,
	type Establecimiento,
	type Etnia,
	type Nacionalidad,
	type Sector,
	type Subsector,
} from '@/lib/catalogos';

interface UseCatalogosState {
	etnias: Etnia[];
	nacionalidades: Nacionalidad[];
	sectores: Sector[];
	subsectores: Subsector[];
	establecimientos: Establecimiento[];
	centrosSalud: CentroSalud[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useCatalogos(): UseCatalogosState {
	const [etnias, setEtnias] = useState<Etnia[]>([]);
	const [nacionalidades, setNacionalidades] = useState<Nacionalidad[]>([]);
	const [sectores, setSectores] = useState<Sector[]>([]);
	const [subsectores, setSubsectores] = useState<Subsector[]>([]);
	const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
	const [centrosSalud, setCentrosSalud] = useState<CentroSalud[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadCatalogos = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await getAllCatalogos();

			setEtnias(data.etnias ?? []);
			setNacionalidades(data.nacionalidades ?? []);
			setSectores(data.sectores ?? []);
			setSubsectores(data.subsectores ?? []);
			setEstablecimientos(data.establecimientos ?? []);
			setCentrosSalud(data.centros_salud ?? []);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Error al cargar catálogos';
			setError(message);
			console.error('Error loading catalogos:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCatalogos();
	}, [loadCatalogos]);

	return {
		etnias,
		nacionalidades,
		sectores,
		subsectores,
		establecimientos,
		centrosSalud,
		loading,
		error,
		refetch: loadCatalogos,
	};
}
