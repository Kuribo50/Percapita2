"use client";

import { useEffect, useState } from "react";
import { ModernStatsSection } from "./ModernStatsSection";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { PendingTasksWidget, type PendingTask } from "./widgets/PendingTasksWidget";
import { ModernCard } from "@/components/ui/modern-card";
import {
  UserPlus,
  XCircle,
  CheckCircle,
  FileText,
  Search,
  Users,
} from "lucide-react";

export function AdministrativoDashboard() {
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
    loadAdministrativoData();
  }, []);

  const loadAdministrativoData = async () => {
    try {
      // Cargar datos específicos para administrativo
      setStats({
        total: 2834,
        newThisMonth: 45,
        validated: 2645,
        nonValidated: 134,
        toReview: 55,
      });

      setTasks([
        {
          title: "Usuarios nuevos por revisar",
          description: "Nuevas inscripciones pendientes de revisión",
          count: 55,
          priority: "high",
          href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
        },
        {
          title: "Usuarios no validados",
          description: "Revisar motivos de rechazo y observaciones",
          count: 23,
          priority: "medium",
          href: "/dashboard/revision-de-usuarios/usuarios-no-validados/gestion",
        },
        {
          title: "Actualizar información",
          description: "Usuarios con datos incompletos",
          count: 12,
          priority: "low",
          href: "/dashboard/revision-usuarios",
        },
      ]);
    } catch (error) {
      console.error("Error cargando datos administrativo:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Nuevos Usuarios",
      description: "Revisar solicitudes de inscripción",
      icon: UserPlus,
      href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
      variant: "primary" as const,
    },
    {
      title: "No Validados",
      description: "Usuarios rechazados o fallecidos",
      icon: XCircle,
      href: "/dashboard/revision-de-usuarios/usuarios-no-validados/gestion",
      variant: "warning" as const,
    },
    {
      title: "Validados",
      description: "Usuarios inscritos activos",
      icon: CheckCircle,
      href: "/dashboard/revision-de-usuarios/usuarios-inscritos-validados/gestion",
      variant: "success" as const,
    },
    {
      title: "Buscar Usuario",
      description: "Búsqueda por RUN",
      icon: Search,
      href: "/dashboard/buscar-usuario",
      variant: "default" as const,
    },
    {
      title: "Usuarios Inscritos",
      description: "Revisar usuarios ya inscritos",
      icon: Users,
      href: "/dashboard/revision-usuarios",
      variant: "default" as const,
    },
    {
      title: "Certificados",
      description: "Generar certificados",
      icon: FileText,
      href: "/dashboard/certificado-inscripcion",
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Panel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Gestión de inscripciones y revisión de usuarios
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

      {/* Resumen por centro */}
      <ModernCard variant="gradient" className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Resumen por Centro
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Alberto Reyes</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nuevos:</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Por revisar:</span>
                <span className="font-medium text-yellow-600">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validados:</span>
                <span className="font-medium text-green-600">15</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Bellavista</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nuevos:</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Por revisar:</span>
                <span className="font-medium text-yellow-600">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validados:</span>
                <span className="font-medium text-green-600">10</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Ramón Corbalán</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nuevos:</span>
                <span className="font-medium">7</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Por revisar:</span>
                <span className="font-medium text-yellow-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validados:</span>
                <span className="font-medium text-green-600">4</span>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}
