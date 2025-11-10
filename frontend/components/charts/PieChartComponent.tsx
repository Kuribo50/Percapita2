'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  description: string;
  loading?: boolean;
}

const ChartSkeleton = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse" style={{ height }}>
    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

type ValidationFilter = 'all' | 'validated' | 'nonValidated' | 'pending';

export function PieChartComponent({ data, description, loading = false }: PieChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<ValidationFilter>('all');

  // Filtrar datos según el filtro seleccionado
  const filteredData = data.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'validated') return item.name === 'Validados';
    if (selectedFilter === 'nonValidated') return item.name === 'No Validados';
    if (selectedFilter === 'pending') return item.name === 'Por Revisar';
    return true;
  });

  const isEmpty = filteredData.length === 0;

  // Calcular total para mostrar
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estado de Validación
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'validated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('validated')}
              className={selectedFilter === 'validated' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
            >
              Validados
            </Button>
            <Button
              variant={selectedFilter === 'nonValidated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('nonValidated')}
              className={selectedFilter === 'nonValidated' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              No Validados
            </Button>
            <Button
              variant={selectedFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('pending')}
              className={selectedFilter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
            >
              Por Revisar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={250} />
        ) : isEmpty ? (
          <div className="h-[250px] flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Activity className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No hay datos de validación disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mostrar total cuando se filtra */}
            {selectedFilter !== 'all' && (
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {total.toLocaleString('es-CL')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredData[0]?.name || 'Registros'}
                </p>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={selectedFilter === 'all' ? 250 : 200}>
              <PieChart>
                <Pie
                  data={filteredData as any[]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => selectedFilter === 'all' ? `${entry.name}: ${(entry.percent * 100).toFixed(0)}%` : `${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={selectedFilter === 'all' ? 80 : 70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString('es-CL')}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                {selectedFilter === 'all' && (
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
