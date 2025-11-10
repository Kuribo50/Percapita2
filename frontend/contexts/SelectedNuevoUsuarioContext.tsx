"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { NuevoUsuario } from "@/types";

type SelectedNuevoUsuarioSummary = Pick<NuevoUsuario, "id" | "nombreCompleto" | "estado">;

interface SelectedNuevoUsuarioContextValue {
  selectedNuevoUsuario: SelectedNuevoUsuarioSummary | null;
  setSelectedNuevoUsuario: (usuario: SelectedNuevoUsuarioSummary | null) => void;
  clearSelectedNuevoUsuario: () => void;
}

const SelectedNuevoUsuarioContext = createContext<SelectedNuevoUsuarioContextValue | undefined>(
  undefined,
);

export function SelectedNuevoUsuarioProvider({ children }: { children: ReactNode }) {
  const [selectedNuevoUsuario, setSelectedNuevoUsuarioState] = useState<SelectedNuevoUsuarioSummary | null>(
    null,
  );

  const clearSelectedNuevoUsuario = useCallback(() => {
    setSelectedNuevoUsuarioState(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedNuevoUsuario,
      setSelectedNuevoUsuario: setSelectedNuevoUsuarioState,
      clearSelectedNuevoUsuario,
    }),
    [selectedNuevoUsuario, clearSelectedNuevoUsuario],
  );

  return (
    <SelectedNuevoUsuarioContext.Provider value={value}>
      {children}
    </SelectedNuevoUsuarioContext.Provider>
  );
}

export function useSelectedNuevoUsuario() {
  const context = useContext(SelectedNuevoUsuarioContext);
  if (context === undefined) {
    throw new Error("useSelectedNuevoUsuario debe utilizarse dentro de SelectedNuevoUsuarioProvider");
  }
  return context;
}
