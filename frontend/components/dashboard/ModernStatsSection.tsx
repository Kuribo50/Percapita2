"use client";

import { StatsCard } from "@/components/ui/stats-card";
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
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
  // Calcular tendencia del mes (simulado - puedes conectarlo con datos reales)
  const calculateTrend = (current: number) => {
    // Simulación: 5-15% de cambio
    return Math.floor(Math.random() * 10) + 5;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="Total Usuarios"
        value={stats.total}
        icon={Users}
        variant="primary"
        loading={loading}
        animate
        description="Usuarios en el sistema"
      />

      <StatsCard
        title="Nuevos Este Mes"
        value={stats.newThisMonth}
        icon={UserPlus}
        variant="default"
        loading={loading}
        animate
        trend={{
          value: calculateTrend(stats.newThisMonth),
          direction: "up",
          label: "vs mes anterior",
        }}
      />

      <StatsCard
        title="Validados"
        value={stats.validated}
        icon={CheckCircle}
        variant="success"
        loading={loading}
        animate
        description={`${((stats.validated / stats.total) * 100).toFixed(1)}% del total`}
      />

      <StatsCard
        title="No Validados"
        value={stats.nonValidated}
        icon={XCircle}
        variant="danger"
        loading={loading}
        animate
        description={`${((stats.nonValidated / stats.total) * 100).toFixed(1)}% del total`}
      />

      <StatsCard
        title="A Revisar"
        value={stats.toReview}
        icon={AlertCircle}
        variant="warning"
        loading={loading}
        animate
        description="Requieren atención"
      />
    </div>
  );
}
