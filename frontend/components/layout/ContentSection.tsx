import { LucideIcon } from 'lucide-react';

interface ContentSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';
  className?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'text-green-600 dark:text-green-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },
};

export function ContentSection({
  title,
  description,
  icon: Icon,
  children,
  color = 'green',
  className = '',
}: ContentSectionProps) {
  const colors = colorClasses[color];

  return (
    <div className={className}>
      <div className={`${colors.bg} rounded-xl p-6 mb-6`}>
        <div className="flex items-center gap-3 mb-3">
          {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
