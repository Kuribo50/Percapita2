'use client';

import { useState } from 'react';
import RutInput from '@/components/RutInput';

export default function CertificadoResidenciaPage() {
  const [rut, setRut] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Certificado de Residencia</h1>
        <p className="text-gray-600">Generación de certificados de residencia</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comuna</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Comuna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Seleccione región</option>
                <option>Metropolitana</option>
                <option>Valparaíso</option>
                <option>Biobío</option>
                <option>Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo de Residencia</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 2 años"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Propósito del Certificado</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Seleccione propósito</option>
              <option>Trámites bancarios</option>
              <option>Matrícula escolar</option>
              <option>Trámites legales</option>
              <option>Otro</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Generar Certificado PDF
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Vista Previa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
