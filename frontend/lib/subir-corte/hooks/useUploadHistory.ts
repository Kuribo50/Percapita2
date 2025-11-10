import { useCallback, useEffect, useState } from "react";
import type { HistoryFilters, UploadHistoryItem } from "../types";
import { API_BASE_URL } from "../constants";

export function useUploadHistory() {
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    usuario: "",
    periodo: "",
    tipo: "all",
  });
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const cargarHistorial = useCallback(async (filters: HistoryFilters) => {
    try {
      setHistoryLoading(true);
      const url = new URL(`${API_BASE_URL}/api/historial-cargas/`);
      url.searchParams.set("limit", "50");

      if (filters.usuario.trim()) {
        url.searchParams.set("usuario", filters.usuario.trim());
      }

      if (filters.periodo) {
        url.searchParams.set("periodo", filters.periodo);
      }

      if (filters.tipo === "corte") {
        url.searchParams.set("tipo", "CORTE_FONASA");
      } else if (filters.tipo === "trakcare") {
        url.searchParams.set("tipo", "HP_TRAKCARE");
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setUploadHistory(data);
      } else {
        console.error("Error cargando historial:", response.statusText);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      void cargarHistorial(historyFilters);
    }, 350);

    return () => {
      window.clearTimeout(handler);
    };
  }, [cargarHistorial, historyFilters]);

  const handleHistoryFilterChange = (
    field: keyof HistoryFilters,
    value: string
  ) => {
    setHistoryFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetHistoryFilters = () => {
    setHistoryFilters({ usuario: "", periodo: "", tipo: "all" });
  };

  return {
    uploadHistory,
    historyFilters,
    historyLoading,
    handleHistoryFilterChange,
    resetHistoryFilters,
    cargarHistorial,
  };
}
