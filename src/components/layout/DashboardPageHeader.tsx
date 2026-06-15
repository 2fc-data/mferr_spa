import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  actions,
  className
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
        {Icon && (
          <div className={cn("p-3 rounded-2xl shadow-sm border border-white/10 shrink-0", iconBg)}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground bg-clip-text">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground font-medium text-sm md:text-base max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center justify-center md:justify-end gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
