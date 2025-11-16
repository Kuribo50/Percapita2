/**
 * Sistema de Tarjetas Modernas (ModernCard)
 *
 * Componentes de tarjetas visuales profesionales con variantes:
 * - default: Tarjeta estándar con borde sutil
 * - gradient: Tarjeta con gradiente de fondo
 * - glass: Efecto glassmorphism
 * - elevated: Tarjeta con sombra elevada
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "glass" | "elevated";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
  gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800",
  glass: "bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50",
  elevated: "bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50 border-0",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function ModernCard({
  children,
  className,
  variant = "default",
  hover = false,
  padding = "md",
}: ModernCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variantStyles[variant],
        paddingStyles[padding],
        hover && "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModernCardHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ModernCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function ModernCardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
