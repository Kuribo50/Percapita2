/**
 * Tarjeta de Estadísticas Moderna (StatsCard)
 *
 * Tarjeta visual profesional para mostrar métricas y estadísticas
 * con animaciones, iconos y tendencias.
 */

"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import NumberTicker from "@/components/magicui/number-ticker";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  animate?: boolean;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

const variantStyles = {
  default: {
    bg: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950",
    border: "border-gray-200 dark:border-gray-800",
    icon: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    text: "text-gray-900 dark:text-gray-100",
  },
  primary: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30",
    border: "border-blue-200 dark:border-blue-800/50",
    icon: "bg-blue-500 text-white",
    text: "text-blue-900 dark:text-blue-100",
  },
  success: {
    bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30",
    border: "border-green-200 dark:border-green-800/50",
    icon: "bg-green-500 text-white",
    text: "text-green-900 dark:text-green-100",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30",
    border: "border-amber-200 dark:border-amber-800/50",
    icon: "bg-amber-500 text-white",
    text: "text-amber-900 dark:text-amber-100",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30",
    border: "border-red-200 dark:border-red-800/50",
    icon: "bg-red-500 text-white",
    text: "text-red-900 dark:text-red-100",
  },
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  neutral: "text-gray-600 dark:text-gray-400",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = "default",
  animate = true,
  loading = false,
  prefix = "",
  suffix = "",
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const TrendIcon = trend ? trendIcons[trend.direction] : null;

  if (loading) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        styles.bg,
        styles.border
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded"/>
          <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded"/>
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"/>
        </div>
      </div>
    );
  }

  const isNumberValue = typeof value === "number";

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        styles.bg,
        styles.border
      )}
    >
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className={cn("text-3xl font-bold tabular-nums", styles.text)}>
              {isNumberValue && animate ? (
                <>
                  {prefix}
                  <NumberTicker value={value} />
                  {suffix}
                </>
              ) : (
                `${prefix}${value}${suffix}`
              )}
            </div>
          </div>
          <div className={cn("p-3 rounded-xl", styles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Trend & Description */}
        <div className="flex items-center justify-between">
          {trend && TrendIcon && (
            <div className="flex items-center gap-1.5">
              <TrendIcon className={cn("w-4 h-4", trendColors[trend.direction])} />
              <span className={cn("text-sm font-medium", trendColors[trend.direction])}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {description && !trend && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
