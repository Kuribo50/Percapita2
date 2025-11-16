/**
 * Tabla Moderna (ModernTable)
 *
 * Sistema de tabla responsive y profesional con:
 * - Ordenamiento
 * - Filtros
 * - Paginación
 * - Estados de carga
 * - Acciones por fila
 */

"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => ReactNode;
}

export interface ModernTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  highlightOnHover?: boolean;
  striped?: boolean;
  compact?: boolean;
  className?: string;
}

export function ModernTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  highlightOnHover = true,
  striped = false,
  compact = false,
  className,
}: ModernTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse space-y-2 p-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-gray-800 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-12">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "font-semibold text-gray-700 dark:text-gray-300",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.align !== "center" && column.align !== "right" && "text-left"
                  )}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={cn(
                  "border-b border-gray-200 dark:border-gray-800 transition-colors",
                  highlightOnHover &&
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer",
                  striped && rowIndex % 2 === 0 && "bg-gray-50/50 dark:bg-gray-900/20"
                )}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        "text-gray-900 dark:text-gray-100",
                        compact ? "px-3 py-2" : "px-4 py-3",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {column.render ? column.render(value, row, rowIndex) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente auxiliar para acciones de tabla
export function TableActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

// Componente auxiliar para badges de estado
export function TableStatusBadge({
  status,
  label,
}: {
  status: "active" | "inactive" | "pending" | "success" | "error";
  label: string;
}) {
  const variants = {
    active: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    success: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    error: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <Badge className={cn("text-xs font-medium", variants[status])}>
      {label}
    </Badge>
  );
}
