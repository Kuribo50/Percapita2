/**
 * Estado Vacío Moderno (ModernEmptyState)
 *
 * Componente visual para mostrar estados vacíos de forma atractiva
 * con ilustraciones, mensajes y acciones.
 */

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export interface ModernEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  variant?: "default" | "search" | "error";
  className?: string;
  children?: ReactNode;
}

const variantStyles = {
  default: {
    icon: "text-gray-400 dark:text-gray-600",
    bg: "bg-gray-100 dark:bg-gray-800",
    title: "text-gray-900 dark:text-gray-100",
    description: "text-gray-600 dark:text-gray-400",
  },
  search: {
    icon: "text-blue-400 dark:text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-950",
    title: "text-gray-900 dark:text-gray-100",
    description: "text-gray-600 dark:text-gray-400",
  },
  error: {
    icon: "text-red-400 dark:text-red-600",
    bg: "bg-red-100 dark:bg-red-950",
    title: "text-gray-900 dark:text-gray-100",
    description: "text-gray-600 dark:text-gray-400",
  },
};

export function ModernEmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
  children,
}: ModernEmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-6 rounded-full p-6",
          styles.bg
        )}
      >
        <Icon className={cn("w-16 h-16", styles.icon)} />
      </div>

      <h3 className={cn("mb-2 text-xl font-bold", styles.title)}>
        {title}
      </h3>

      <p className={cn("mb-6 max-w-md text-sm", styles.description)}>
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </Button>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
