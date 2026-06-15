import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "bg-card shadow-sm border-border",
  danger: "bg-gradient-to-br from-red-50 to-red-100/20 dark:from-red-950/20 shadow-sm border-red-100 dark:border-red-900/30",
  success: "bg-gradient-to-br from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20 shadow-sm border-emerald-100 dark:border-emerald-900/30",
  warning: "bg-gradient-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 shadow-sm border-amber-100 dark:border-amber-900/30",
};

const labelStyles = {
  default: "text-muted-foreground",
  danger: "text-red-600 dark:text-red-400 font-semibold",
  success: "text-emerald-600 dark:text-emerald-400 font-semibold",
  warning: "text-amber-600 dark:text-amber-400 font-semibold",
};

const valueStyles = {
  default: "text-foreground",
  danger: "text-red-700 dark:text-red-500 font-black",
  success: "text-emerald-700 dark:text-emerald-500 font-black",
  warning: "text-amber-700 dark:text-amber-500 font-black",
};

/**
 * Componente modular para exibição de métricas principais (KPIs).
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  description,
  icon: Icon,
  variant = "default",
  className = "",
}) => {
  return (
    <Card className={`${variantStyles[variant]} ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm ${labelStyles[variant]}`}>{label}</p>
            <h3 className={`text-3xl font-bold mt-2 ${valueStyles[variant]}`}>
              {value}
            </h3>
          </div>
          {Icon && (
            <Icon className={`w-8 h-8 opacity-80 ${variant === "default" ? "text-primary/50" : ""}`} />
          )}
        </div>
        {description && (
          <p className="text-xs text-foreground/70 mt-4">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
