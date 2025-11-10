"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Calendar, Building2, RefreshCw, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Centro {
  nombre: string;
  visible: boolean;
}

interface AdvancedChartFiltersProps {
  centrosDisponibles: Centro[];
  onApplyFilters: (centros: string[], monthsRange: string) => void;
  initialMonthsRange?: string;
  initialCentros?: string[];
}

export function AdvancedChartFilters({
  centrosDisponibles,
  onApplyFilters,
  initialMonthsRange = "3",
  initialCentros = [],
}: AdvancedChartFiltersProps) {
  const [tempMonthsRange, setTempMonthsRange] = useState(initialMonthsRange);
  const [tempCentros, setTempCentros] = useState<string[]>(initialCentros);
  const [open, setOpen] = useState(false);

  const handleToggleCentro = (centroNombre: string) => {
    if (tempCentros.includes(centroNombre)) {
      setTempCentros(tempCentros.filter((c) => c !== centroNombre));
    } else {
      setTempCentros([...tempCentros, centroNombre]);
    }
    // No cerrar el popover automáticamente para permitir múltiples selecciones
  };

  const handleRemoveCentro = (centroNombre: string) => {
    const newCentros = tempCentros.filter((c) => c !== centroNombre);
    setTempCentros(newCentros);
  };

  const handleApply = () => {
    onApplyFilters(tempCentros, tempMonthsRange);
    setOpen(false);
  };

  const handleReset = () => {
    setTempMonthsRange("3");
    setTempCentros([]);
    onApplyFilters([], "3");
  };

  const handlePeriodChange = (value: string) => {
    setTempMonthsRange(value);
    onApplyFilters(tempCentros, value);
  };

  const activeFiltersCount =
    tempCentros.length + (tempMonthsRange !== "3" ? 1 : 0);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropdown de Periodo de Tiempo */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="w-4 h-4 text-primary" />
            Periodo de Tiempo
          </Label>
          <Select value={tempMonthsRange} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ULTIMO">Último Corte</SelectItem>
              <SelectItem value="3">Últimos 3 Meses</SelectItem>
              <SelectItem value="6">Últimos 6 Meses</SelectItem>
              <SelectItem value="12">Últimos 12 Meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown de Centro de Salud */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="w-4 h-4 text-primary" />
            Centro de Salud
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {tempCentros.length === 0
                  ? "Todos los centros"
                  : `${tempCentros.length} centro${
                      tempCentros.length > 1 ? "s" : ""
                    } seleccionado${tempCentros.length > 1 ? "s" : ""}`}
                <Building2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar centro..." />
                <CommandEmpty>No se encontró el centro.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  <CommandItem
                    onSelect={() => {
                      setTempCentros([]);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        tempCentros.length === 0 ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    Todos los centros
                  </CommandItem>
                  {centrosDisponibles
                    .filter((centro) => centro.visible)
                    .map((centro) => (
                      <CommandItem
                        key={centro.nombre}
                        onSelect={() => {
                          handleToggleCentro(centro.nombre);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            tempCentros.includes(centro.nombre)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {centro.nombre}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tags de Centros Seleccionados */}
        {tempCentros.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Centros seleccionados:
            </Label>
            <div className="flex flex-wrap gap-2">
              {tempCentros.map((centro) => (
                <Badge
                  key={centro}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1 py-1"
                >
                  <span className="text-xs">{centro}</span>
                  <button
                    onClick={() => handleRemoveCentro(centro)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                    title="Quitar filtro"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleReset}
            size="sm"
            className="flex-1 flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Restablecer
          </Button>
          <Button
            onClick={handleApply}
            size="sm"
            className="flex-1 flex items-center gap-2"
          >
            <Filter className="w-3 h-3" />
            Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
