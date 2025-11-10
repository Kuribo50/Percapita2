"use client";

import { StatCard } from "@/components/layout/StatCard";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface StatsData {
  total: number;
  validated: number;
  nonValidated: number;
  totalCortes: number;
  toReview: number;
  newThisMonth: number;
  validatedByCenter?: Record<string, number>;
}

interface ModernStatsSectionProps {
  stats: StatsData;
  loading?: boolean;
  formatNumber?: (num: number) => string;
}

export function ModernStatsSection({
  stats,
  loading = false,
  formatNumber = (num) => num.toLocaleString(),
}: ModernStatsSectionProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        variant="modern"
        title="Nuevos Este Mes"
        value={stats.newThisMonth}
        icon={UserPlus}
        description="Usuarios registrados este mes"
        formatNumber={formatNumber}
        colorScheme="blue"
        trend={{
          value: stats.newThisMonth,
          isPositive: true,
        }}
      />

      <StatCard
        variant="modern"
        title="Validados"
        value={stats.validated}
        icon={CheckCircle2}
        description="Usuarios validados"
        formatNumber={formatNumber}
        colorScheme="green"
      />

      <StatCard
        variant="modern"
        title="No Validados"
        value={stats.nonValidated}
        icon={XCircle}
        description="Usuarios no validados"
        formatNumber={formatNumber}
        colorScheme="red"
      />

      <StatCard
        variant="modern"
        title="Total de Cortes"
        value={stats.totalCortes}
        icon={Clock}
        description="Cortes mensuales procesados"
        formatNumber={formatNumber}
        colorScheme="amber"
      />

      <StatCard
        variant="modern"
        title="A Revisar"
        value={stats.toReview}
        icon={AlertCircle}
        description="Requieren atención"
        formatNumber={formatNumber}
        colorScheme="purple"
      />
    </div>
  );
}
