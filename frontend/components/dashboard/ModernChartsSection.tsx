"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChart3 } from 'lucide-react';

interface CentroParaGrafico {
  nombre: string;
  color: string;
}

interface ModernChartsSectionProps {
  lineChartData: Array<Record<string, string | number>>;
  centrosParaGrafico: CentroParaGrafico[];
  graphDescription: string;
  loading?: boolean;
  formatNumber?: (value: number | string) => string;
}

export function ModernChartsSection({
  lineChartData,
  centrosParaGrafico,
  graphDescription,
  loading = false,
  formatNumber = (value) => typeof value === 'number' ? value.toLocaleString() : value,
}: ModernChartsSectionProps) {
  if (loading) {
    return (
      <div className="h-96 rounded-lg bg-muted animate-pulse" />
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Evolución de Cortes</CardTitle>
            <CardDescription>{graphDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LineChartComponent
          data={lineChartData}
          centros={centrosParaGrafico}
          description={graphDescription}
          formatNumber={formatNumber}
        />
      </CardContent>
    </Card>
  );
}
