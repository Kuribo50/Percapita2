"use client";

import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PendingTask {
  title: string;
  description: string;
  count: number;
  priority: "high" | "medium" | "low";
  href: string;
}

interface PendingTasksWidgetProps {
  tasks: PendingTask[];
  loading?: boolean;
}

const priorityConfig = {
  high: {
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: AlertCircle,
  },
  medium: {
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
  },
  low: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: CheckCircle2,
  },
};

export function PendingTasksWidget({
  tasks,
  loading = false,
}: PendingTasksWidgetProps) {
  const router = useRouter();

  return (
    <ModernCard variant="gradient" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tareas Pendientes</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
          <p className="text-sm font-medium">¡Todo al día!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No hay tareas pendientes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const Icon = priorityConfig[task.priority].icon;

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => router.push(task.href)}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${priorityConfig[task.priority].color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {task.count}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </ModernCard>
  );
}
