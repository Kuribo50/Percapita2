"use client";

import { useState } from "react";
import RutInput from "@/components/RutInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RenovacionNIPPage() {
  const [rut, setRut] = useState("");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Renovación de NIP
        </h1>
        <p className="text-gray-600">
          Gestión de renovaciones de Número de Identificación Personal
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RutInput
              value={rut}
              onChange={setRut}
              label="RUT Usuario"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIP Actual
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="NIP actual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo Renovación
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perdida">Pérdida</SelectItem>
                  <SelectItem value="robo">Robo</SelectItem>
                  <SelectItem value="deterioro">Deterioro</SelectItem>
                  <SelectItem value="vencimiento">Vencimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Solicitud
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese observaciones adicionales..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Procesar Renovación
          </button>
        </form>
      </div>
    </div>
  );
}
