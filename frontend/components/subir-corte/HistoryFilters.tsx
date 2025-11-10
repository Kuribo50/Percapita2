"use client";

import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { HistoryFilters } from "@/lib/subir-corte/types";

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFilterChange: (field: keyof HistoryFilters, value: string) => void;
  onReset: () => void;
}

export default function HistoryFiltersComponent({
  filters,
  onFilterChange,
  onReset,
}: HistoryFiltersProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <Search className="h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar por usuario..."
        value={filters.usuario}
        onChange={(e) => onFilterChange("usuario", e.target.value)}
        className="flex-1 border-none bg-transparent"
      />
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
        <RefreshCw className="h-3 w-3 mr-1" />
        Limpiar
      </Button>
    </div>
  );
}
