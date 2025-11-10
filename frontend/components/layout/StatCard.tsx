"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  formatNumber?: (num: number) => string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'simple' | 'modern';
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
}

// Estilos para variante simple (gradiente)
const simpleColorClasses = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
};

// Estilos para variante moderna (color scheme completo)
const modernColorSchemes = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  formatNumber = (num) => num.toLocaleString(),
  trend,
  variant = 'simple',
  colorScheme = 'blue',
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const numericValue = typeof value === 'number' ? value : 0;
  const shouldAnimate = variant === 'modern' && typeof value === 'number';

  // Animación de contador solo para variante moderna
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(numericValue);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const stepValue = numericValue / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayValue(Math.floor(stepValue * currentStep));
      } else {
        setDisplayValue(numericValue);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [numericValue, shouldAnimate]);

  // Renderizar variante simple
  if (variant === 'simple') {
    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
        <div className={`h-1 bg-gradient-to-r ${simpleColorClasses[colorScheme]}`}></div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
              {trend && (
                <div className="mt-2">
                  <span
                    className={`text-xs font-medium ${
                      trend.isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar variante moderna
  const colors = modernColorSchemes[colorScheme];
  const formattedValue = typeof value === 'number'
    ? formatNumber(displayValue)
    : value;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      colors.border
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            colors.bg
          )}>
            <Icon className={cn("w-6 h-6", colors.icon)} />
          </div>
          {trend && (
            <Badge variant="outline" className={colors.badge}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">
            {formattedValue}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
