import React from "react";
import { Card } from "@/components/ui/card";
import { Info, Target, Lightbulb, Scale } from "lucide-react";

interface DashboardExpertInsightProps {
  title?: string;
  object: string | React.ReactNode;
  purpose: string | React.ReactNode;
  conclusion: string | React.ReactNode;
  className?: string;
}

/**
 * DashboardExpertInsight Component
 * 
 * Standardized component for the "Metodologia OPC" (O Quê, Por Quê, Como).
 * Designed with a premium, legal-department aesthetic.
 */
export const DashboardExpertInsight: React.FC<DashboardExpertInsightProps> = ({
  title = "Insight do Especialista",
  object,
  purpose,
  conclusion,
  className = "",
}) => {
  return (
    <Card className={`overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent shadow-sm ${className}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-black uppercase tracking-wider text-primary">
            {title}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* O QUE (OBJECT) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>O Quê</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {object}
            </p>
          </div>

          {/* POR QUE (PURPOSE) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Por Quê</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {purpose}
            </p>
          </div>

          {/* COMO (CONCLUSION) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Conclusão / Ação</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {conclusion}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
