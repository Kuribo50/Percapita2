"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import type { NuevoUsuario } from "@/types";

interface RevisionPanelProps {
  usuario: NuevoUsuario;
  onMarcarRevisado: (
    revisadoManualmente: boolean,
    observaciones?: string,
    checklist?: Record<string, boolean>
  ) => Promise<void>;
}

export default function RevisionPanel({
  usuario,
  onMarcarRevisado,
}: RevisionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [observaciones, setObservaciones] = useState(
    usuario.observacionesTrakcare || ""
  );
  const [checklist, setChecklist] = useState({
    datosBasicosVerificados:
      usuario.checklistTrakcare?.datosBasicosVerificados || false,
    documentacionCompleta:
      usuario.checklistTrakcare?.documentacionCompleta || false,
    direccionActualizada:
      usuario.checklistTrakcare?.direccionActualizada || false,
    telefonoActualizado:
      usuario.checklistTrakcare?.telefonoActualizado || false,
    previsionActualizada:
      usuario.checklistTrakcare?.previsionActualizada || false,
    datosFamiliaresVerificados:
      usuario.checklistTrakcare?.datosFamiliaresVerificados || false,
  });

  const handleChecklistChange = (key: string, value: boolean) => {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  };

  const handleMarcarRevisado = async (manualmente: boolean) => {
    setLoading(true);
    try {
      await onMarcarRevisado(manualmente, observaciones, checklist);
    } finally {
      setLoading(false);
    }
  };

  const estadoRevisado = usuario.revisado;
  const revisadoManualmente = usuario.revisadoManualmente;

  return (
    <div className="space-y-6">
      {/* Estado actual de revisión */}
      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Estado de Revisión
          </h3>
          {estadoRevisado ? (
            <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Revisado
            </Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300">
              <Clock className="w-3 h-3 mr-1" />
              Sin Revisar
            </Badge>
          )}
        </div>

        {estadoRevisado && (
          <div className="space-y-2 text-sm">
            {revisadoManualmente && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Revisión Manual</span>
              </div>
            )}
            {usuario.revisadoPor && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Revisado por: {usuario.revisadoPor}</span>
              </div>
            )}
            {usuario.revisadoEl && (
              <div className="text-gray-600 dark:text-gray-400">
                <span>
                  Fecha: {new Date(usuario.revisadoEl).toLocaleString("es-CL")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checklist HP Trakcare */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Checklist de Verificación HP Trakcare
        </h3>
        <div className="space-y-2">
          {[
            {
              key: "datosBasicosVerificados",
              label: "Datos básicos verificados (Nombre, RUN, Fecha Nac.)",
            },
            {
              key: "documentacionCompleta",
              label: "Documentación completa y correcta",
            },
            {
              key: "direccionActualizada",
              label: "Dirección actualizada",
            },
            {
              key: "telefonoActualizado",
              label: "Teléfono actualizado",
            },
            {
              key: "previsionActualizada",
              label: "Previsión actualizada",
            },
            {
              key: "datosFamiliaresVerificados",
              label: "Datos familiares verificados",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checklist[item.key as keyof typeof checklist]}
                onChange={(e) =>
                  handleChecklistChange(item.key, e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={estadoRevisado}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {item.label}
              </span>
              {checklist[item.key as keyof typeof checklist] && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Observaciones sobre HP Trakcare */}
      <div className="space-y-2">
        <Label htmlFor="observaciones-trakcare">
          Observaciones sobre HP Trakcare
        </Label>
        <Textarea
          id="observaciones-trakcare"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ingrese observaciones sobre la información de HP Trakcare..."
          rows={4}
          disabled={estadoRevisado}
          className="resize-none"
        />
      </div>

      {/* Botones de acción */}
      {!estadoRevisado && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => handleMarcarRevisado(false)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Revisado
          </Button>
          <Button
            onClick={() => handleMarcarRevisado(true)}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Revisión Manual
          </Button>
        </div>
      )}
    </div>
  );
}
