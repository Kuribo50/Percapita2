import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20">
              <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
