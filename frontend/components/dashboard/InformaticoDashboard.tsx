"use client";

import { useEffect, useState } from "react";
import { ModernStatsSection } from "./ModernStatsSection";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { PendingTasksWidget, type PendingTask } from "./widgets/PendingTasksWidget";
import { ModernCard } from "@/components/ui/modern-card";
import {
  Upload,
  UserPlus,
  Database,
  FileText,
  Search,
  Calendar,
} from "lucide-react";

export function InformaticoDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    validated: 0,
    nonValidated: 0,
    toReview: 0,
  });
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInformaticoData();
  }, []);

  const loadInformaticoData = async () => {
    try {
      // Cargar datos específicos de los centros asignados
      setStats({
        total: 4532,
        newThisMonth: 89,
        validated: 4223,
        nonValidated: 189,
        toReview: 34,
      });

      setTasks([
        {
          title: "Validar nuevos usuarios",
          description: "Usuarios pendientes de validación en tus centros",
          count: 34,
          priority: "high",
          href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
        },
        {
          title: "Procesar corte mensual",
          description: "Subir corte FONASA del mes actual",
          count: 1,
          priority: "high",
          href: "/dashboard/subir-corte",
        },
        {
          title: "Revisar HP Trakcare",
          description: "Cruces pendientes con Trakcare",
          count: 12,
          priority: "medium",
          href: "/dashboard/bases/trakcare",
        },
      ]);
    } catch (error) {
      console.error("Error cargando datos informático:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Subir Corte",
      description: "Importar corte FONASA mensual",
      icon: Upload,
      href: "/dashboard/subir-corte",
      variant: "primary" as const,
    },
    {
      title: "Gestión de Cargas",
      description: "Ver historial de archivos cargados",
      icon: Calendar,
      href: "/dashboard/subir-corte/gestion",
      variant: "default" as const,
    },
    {
      title: "Validar Usuarios",
      description: "Revisar nuevos usuarios",
      icon: UserPlus,
      href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
      variant: "success" as const,
    },
    {
      title: "HP Trakcare",
      description: "Consultar base de datos Trakcare",
      icon: Database,
      href: "/dashboard/bases/trakcare",
      variant: "default" as const,
    },
    {
      title: "Buscar Usuario",
      description: "Búsqueda por RUN con historial",
      icon: Search,
      href: "/dashboard/buscar-usuario",
      variant: "default" as const,
    },
    {
      title: "Generar Reportes",
      description: "Estadísticas de tus centros",
      icon: FileText,
      href: "/dashboard/revision-usuarios",
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Panel Informático
        </h1>
        <p className="text-muted-foreground">
          Gestión de cortes y validaciones de tus centros asignados
        </p>
      </div>

      {/* Estadísticas */}
      <ModernStatsSection stats={stats} loading={loading} />

      {/* Grid de widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Acciones rápidas */}
        <QuickActionsWidget actions={quickActions} />

        {/* Tareas pendientes */}
        <PendingTasksWidget tasks={tasks} loading={loading} />
      </div>

      {/* Métricas adicionales */}
      <div className="grid gap-6 md:grid-cols-3">
        <ModernCard variant="gradient" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mis Centros</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Alberto Reyes
              </span>
              <span className="text-sm font-medium">2,341</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Bellavista
              </span>
              <span className="text-sm font-medium">1,876</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Ramón Corbalán
              </span>
              <span className="text-sm font-medium">315</span>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="gradient" className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Validaciones Este Mes
          </h3>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Gráfico de progreso
          </div>
        </ModernCard>

        <ModernCard variant="gradient" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Últimas Cargas</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium">Corte FONASA</p>
              <p className="text-xs text-muted-foreground">Hace 2 días</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Nuevos Usuarios</p>
              <p className="text-xs text-muted-foreground">Hace 5 días</p>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
