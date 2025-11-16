"use client";

import { useEffect, useState } from "react";
import { ModernStatsSection } from "./ModernStatsSection";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { RecentActivityWidget } from "./widgets/RecentActivityWidget";
import { PendingTasksWidget, type PendingTask } from "./widgets/PendingTasksWidget";
import { ModernCard } from "@/components/ui/modern-card";
import {
  UserCog,
  Upload,
  Activity,
  Database,
  Settings,
  FileText,
} from "lucide-react";

export function AdminDashboard() {
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
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Aquí cargarías datos reales desde tus APIs
      // Por ahora usamos datos de ejemplo
      setStats({
        total: 15234,
        newThisMonth: 342,
        validated: 14123,
        nonValidated: 789,
        toReview: 122,
      });

      setTasks([
        {
          title: "Usuarios sin validar",
          description: "Revisar y validar nuevos usuarios",
          count: 122,
          priority: "high",
          href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
        },
        {
          title: "Cortes pendientes",
          description: "Procesar cortes FONASA del mes",
          count: 3,
          priority: "medium",
          href: "/dashboard/subir-corte",
        },
        {
          title: "Logs sin revisar",
          description: "Actividades del sistema",
          count: 45,
          priority: "low",
          href: "/dashboard/admin/logs",
        },
      ]);
    } catch (error) {
      console.error("Error cargando datos admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Gestionar Usuarios",
      description: "Crear y administrar usuarios del sistema",
      icon: UserCog,
      href: "/dashboard/admin/usuarios",
      variant: "primary" as const,
    },
    {
      title: "Subir Corte",
      description: "Importar nuevo corte FONASA",
      icon: Upload,
      href: "/dashboard/subir-corte",
      variant: "success" as const,
    },
    {
      title: "Ver Logs",
      description: "Auditoría y actividad del sistema",
      icon: Activity,
      href: "/dashboard/admin/logs",
      variant: "default" as const,
    },
    {
      title: "Bases de Datos",
      description: "Consultar HP Trakcare y FONASA",
      icon: Database,
      href: "/dashboard/bases",
      variant: "default" as const,
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema y catálogos",
      icon: Settings,
      href: "/dashboard/configuracion",
      variant: "default" as const,
    },
    {
      title: "Reportes",
      description: "Generar reportes y estadísticas",
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
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Vista completa del sistema y métricas generales
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

      {/* Actividad reciente */}
      <RecentActivityWidget />

      {/* Gráficos y métricas adicionales */}
      <div className="grid gap-6 md:grid-cols-2">
        <ModernCard variant="gradient" className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Usuarios por Centro
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Gráfico de distribución por centro
          </div>
        </ModernCard>

        <ModernCard variant="gradient" className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Tendencia de Validaciones
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Gráfico de línea temporal
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
