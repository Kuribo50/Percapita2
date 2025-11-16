"use client";

import { useCallback, useEffect, useState } from "react";
import type { NuevoUsuario, NuevosUsuariosResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Estadisticas = NuevosUsuariosResponse["estadisticas"] & {
  hoy: number;
  mes: number;
};

interface UseNuevosUsuariosState {
  usuarios: NuevoUsuario[];
  estadisticas: Estadisticas;
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
}

const INITIAL_STATS: Estadisticas = {
  total: 0,
  hoy: 0,
  mes: 0,
  validados: 0,
  noValidados: 0,
  pendientes: 0,
  fallecidos: 0,
};

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
};

export function useNuevosUsuarios(): UseNuevosUsuariosState {
  const [usuarios, setUsuarios] = useState<NuevoUsuario[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>(INITIAL_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      const token = getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/nuevos-usuarios/`, {
        headers,
      });

      if (!response.ok) {
        let responseBody: string | undefined;
        try {
          responseBody = (await response.text()).slice(0, 200);
        } catch (readErr) {
          console.error("No fue posible leer la respuesta de error:", readErr);
        }
        throw new Error(
          `Error al cargar usuarios (${response.status} ${
            response.statusText
          })${responseBody ? ` - ${responseBody}` : ""}`
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const preview = (await response.text()).slice(0, 200);
        throw new Error(
          `Respuesta inesperada del servidor (${response.status} ${response.statusText}). Primeros bytes: ${preview}`
        );
      }

      let data: NuevosUsuariosResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(
          parseError instanceof Error
            ? `No se pudo procesar la respuesta del servidor: ${parseError.message}`
            : "No se pudo procesar la respuesta del servidor."
        );
      }
      const usuariosData = Array.isArray(data.usuarios) ? data.usuarios : [];

      setUsuarios(usuariosData);

      const hoy = new Date().toISOString().split("T")[0];
      const mesActual = new Date().getMonth() + 1;
      const anioActual = new Date().getFullYear();

      const usuariosHoy = usuariosData.filter((usuario) =>
        usuario.creadoEl?.startsWith(hoy)
      ).length;
      const usuariosMes = usuariosData.filter((usuario) => {
        if (!usuario.creadoEl) return false;
        const fecha = new Date(usuario.creadoEl);
        return (
          fecha.getMonth() + 1 === mesActual &&
          fecha.getFullYear() === anioActual
        );
      }).length;

      setEstadisticas({
        total: data.estadisticas?.total ?? usuariosData.length,
        hoy: usuariosHoy,
        mes: usuariosMes,
        validados: data.estadisticas?.validados ?? 0,
        noValidados: data.estadisticas?.noValidados ?? 0,
        pendientes: data.estadisticas?.pendientes ?? 0,
        fallecidos: data.estadisticas?.fallecidos ?? 0,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar datos";
      setError(message);
      console.error("Error fetching usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUsuario = useCallback(
    async (id: number) => {
      try {
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        const token = getAccessToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/nuevos-usuarios/${id}/`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          let responseBody: string | undefined;
          try {
            responseBody = (await response.text()).slice(0, 200);
          } catch (readErr) {
            console.error(
              "No fue posible leer la respuesta de error:",
              readErr
            );
          }
          throw new Error(
            `Error al eliminar usuario (${response.status} ${
              response.statusText
            })${responseBody ? ` - ${responseBody}` : ""}`
          );
        }

        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
        await fetchUsuarios();
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al eliminar usuario";
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      }
    },
    [fetchUsuarios]
  );

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return {
    usuarios,
    estadisticas,
    loading,
    error,
    fetchUsuarios,
    deleteUsuario,
  };
}
