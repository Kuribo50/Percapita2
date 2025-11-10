'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface Centro {
  nombre: string;
  visible: boolean;
}

interface DashboardFiltersProps {
  centrosDisponibles: Centro[];
  onApplyFilters: (centros: string[], monthsRange: string) => void;
  initialMonthsRange?: string;
  initialCentros?: string[];
}

export function DashboardFilters({
  centrosDisponibles,
  onApplyFilters,
  initialMonthsRange = 'ULTIMO',
  initialCentros = []
}: DashboardFiltersProps) {
  const [tempMonthsRange, setTempMonthsRange] = useState(initialMonthsRange);
  const [tempCentros, setTempCentros] = useState<string[]>(initialCentros);
  const [showCentrosDropdown, setShowCentrosDropdown] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.centros-dropdown-container')) {
        setShowCentrosDropdown(false);
      }
    };

    if (showCentrosDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCentrosDropdown]);

  const handleApply = () => {
    onApplyFilters(tempCentros, tempMonthsRange);
    setShowCentrosDropdown(false);
  };

  const handleToggleCentro = (centroNombre: string) => {
    if (tempCentros.includes(centroNombre)) {
      setTempCentros(tempCentros.filter(c => c !== centroNombre));
    } else {
      setTempCentros([...tempCentros, centroNombre]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Filtros de Centro (con checkboxes) */}
      <div className="flex-1 centros-dropdown-container">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
          Centros
        </label>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between bg-white dark:bg-gray-900"
            onClick={() => setShowCentrosDropdown(!showCentrosDropdown)}
          >
            <span className="text-sm">
              {tempCentros.length === 0 
                ? 'Todos los centros' 
                : `${tempCentros.length} seleccionado${tempCentros.length > 1 ? 's' : ''}`}
            </span>
            {showCentrosDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showCentrosDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-2">
                <label className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCentros.length === 0}
                    onChange={() => setTempCentros([])}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Todos los centros</span>
                </label>
                {centrosDisponibles
                  .filter(centro => centro.visible)
                  .map((centro) => (
                    <label 
                      key={centro.nombre} 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={tempCentros.includes(centro.nombre)}
                        onChange={() => handleToggleCentro(centro.nombre)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{centro.nombre}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rango de Meses */}
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
          Rango de Meses
        </label>
        <Select
          value={tempMonthsRange}
          onValueChange={(value) => setTempMonthsRange(value)}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-900">
            <SelectValue placeholder="Seleccionar rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ULTIMO">Último corte</SelectItem>
            <SelectItem value="3">3 meses</SelectItem>
            <SelectItem value="6">6 meses</SelectItem>
            <SelectItem value="12">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botón Aplicar */}
      <div className="flex items-end">
        <Button 
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
