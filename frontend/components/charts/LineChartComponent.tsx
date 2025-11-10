"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

interface LineChartProps {
  data: Array<Record<string, string | number>>;
  centros: Array<{ nombre: string; color: string }>;
  description: string;
  loading?: boolean;
  formatNumber: (value: number | string) => string;
}

const ChartSkeleton = ({ height = 250 }: { height?: number }) => (
  <div className="animate-pulse" style={{ height }}>
    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

type DataType = "total" | "validated" | "nonValidated";

export function LineChartComponent({
  data,
  centros,
  description,
  loading = false,
  formatNumber,
}: LineChartProps) {
  const [selectedDataType, setSelectedDataType] = useState<DataType>("total");
  const isEmpty = data.length === 0;

  // Determinar el sufijo de los campos según el tipo de dato seleccionado
  const getDataKey = (centroNombre: string) => {
    if (centros.length === 0) {
      // Sin centros filtrados, usar claves simples
      return selectedDataType;
    }
    // Con centros filtrados, usar nombre_campo
    return `${centroNombre}_${selectedDataType}`;
  };

  const getLabel = () => {
    switch (selectedDataType) {
      case "validated":
        return "Validados";
      case "nonValidated":
        return "No Validados";
      default:
        return "Total";
    }
  };

  const getColor = () => {
    switch (selectedDataType) {
      case "validated":
        return "#10b981"; // verde
      case "nonValidated":
        return "#ef4444"; // rojo
      default:
        return "#3b82f6"; // azul
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Totales de Cortes Mensuales
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDataType === "total" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDataType("total")}
            >
              Total
            </Button>
            <Button
              variant={selectedDataType === "validated" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDataType("validated")}
              className={
                selectedDataType === "validated"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
            >
              Validados
            </Button>
            <Button
              variant={
                selectedDataType === "nonValidated" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedDataType("nonValidated")}
              className={
                selectedDataType === "nonValidated"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              No Validados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={300} />
        ) : isEmpty ? (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No hay datos disponibles
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Los datos de cortes aparecerán aquí
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <XAxis
                dataKey="periodo"
                className="text-xs"
                tick={{ fill: "currentColor", fontSize: 11 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "currentColor" }}
                domain={["dataMin - 100", "dataMax + 100"]}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number | string) => [
                  formatNumber(value),
                  getLabel(),
                ]}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                  fontSize: "12px",
                }}
                iconType="line"
                iconSize={16}
              />

              {/* Si hay datos por centro, renderizar una línea por cada centro */}
              {centros.length > 0 ? (
                centros.map((centro) => (
                  <Line
                    key={centro.nombre}
                    type="monotone"
                    dataKey={getDataKey(centro.nombre)}
                    stroke={centro.color}
                    strokeWidth={2.5}
                    name={centro.nombre}
                    dot={{ fill: centro.color, r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))
              ) : (
                /* Si no hay datos por centro, mostrar una sola línea con el color según el tipo */
                <Line
                  type="monotone"
                  dataKey={selectedDataType}
                  stroke={getColor()}
                  strokeWidth={2.5}
                  name={getLabel()}
                  dot={{ fill: getColor(), r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
