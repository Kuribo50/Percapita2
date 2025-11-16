"use client";

import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: "default" | "primary" | "success" | "warning";
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

const variantColors = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  primary: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

export function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
  const router = useRouter();

  return (
    <ModernCard variant="gradient" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const variant = action.variant || "default";

          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => router.push(action.href)}
            >
              <div className="flex items-center gap-3 w-full mb-2">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${variantColors[variant]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                {action.description}
              </p>
            </Button>
          );
        })}
      </div>
    </ModernCard>
  );
}
