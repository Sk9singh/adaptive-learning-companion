import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error';
  showProgress?: boolean;
  description?: string;
}

const colorClasses = {
  default: 'text-foreground',
  success: 'text-performance-high',
  warning: 'text-performance-medium',
  error: 'text-performance-low',
};

const progressColors = {
  default: 'bg-accent',
  success: 'bg-performance-high',
  warning: 'bg-performance-medium',
  error: 'bg-performance-low',
};

export function MetricCard({ 
  title, 
  value, 
  suffix = '%', 
  icon, 
  color = 'default',
  showProgress = true,
  description,
}: MetricCardProps) {
  // Determine color based on value if not specified
  const autoColor = value >= 70 ? 'success' : value >= 40 ? 'warning' : 'error';
  const effectiveColor = color === 'default' ? autoColor : color;

  return (
    <div className="p-4 rounded-xl bg-card border shadow-card animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <span className={cn("p-1.5 rounded-lg bg-muted", colorClasses[effectiveColor])}>
            {icon}
          </span>
        )}
      </div>
      
      <div className={cn("text-3xl font-bold mb-2", colorClasses[effectiveColor])}>
        {value.toFixed(0)}
        <span className="text-lg font-medium ml-0.5">{suffix}</span>
      </div>
      
      {showProgress && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              progressColors[effectiveColor]
            )}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
