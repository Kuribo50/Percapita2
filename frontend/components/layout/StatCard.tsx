import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'green',
  description,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
      <div className={`h-1 bg-linear-to-r ${colorClasses[color]}`}></div>
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
