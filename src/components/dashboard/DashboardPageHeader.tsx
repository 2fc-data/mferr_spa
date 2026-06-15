import React from "react";

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  subtitle?: string;
  className?: string;
}

/**
 * Componente padronizado para os cabeçalhos das páginas do Dashboard.
 */
export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({ 
  title, 
  description, 
  subtitle,
  className = "" 
}) => {
  return (
    <div className={`mt-8 mb-6 px-4 ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
        {title}
      </h1>
      <p className="text-muted-foreground mt-3 text-[15px] bg-accent/5 p-4 rounded-xl border-l-[3px] border-l-accent shadow-sm flex items-start">
        <span className="font-semibold text-primary mr-2">
          {subtitle || "Propósito"}:
        </span>
        {description}
      </p>
    </div>
  );
};
