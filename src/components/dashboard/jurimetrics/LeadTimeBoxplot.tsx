import React from "react";
import { Clock } from "lucide-react";

interface BoxplotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

interface LeadTimeBoxplotProps {
  data: BoxplotData;
}

export const LeadTimeBoxplot: React.FC<LeadTimeBoxplotProps> = ({ data }) => {
  const { min, q1, median, q3, max, outliers } = data;

  if (max === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-[400px] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-foreground">Gargalos de Tramitação</h3>
        <p className="text-xs text-muted-foreground mb-8">Boxplot: Tempo de Tramitação (Dias) e Outliers</p>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sem dados de tramitação</p>
            <p className="text-xs mt-1">Não há processos com tempo de ciclo calculável neste período.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Normalization for the 0-100% scale
  const range = (max - min) || 1;
  const toPct = (val: number) => ((val - min) / range) * 100;

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-[400px] flex flex-col">
      <h3 className="text-lg font-bold mb-1 text-foreground">Gargalos de Tramitação</h3>
      <p className="text-xs text-muted-foreground mb-8">Boxplot: Tempo de Tramitação (Dias) e Outliers</p>
      
      <div className="flex-1 flex flex-col justify-center px-4 relative">
        {/* The Boxplot SVG */}
        <div className="relative h-24 w-full bg-muted/20 rounded-lg flex items-center">
            {/* Median Line */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-primary z-20"
                style={{ left: `${toPct(median)}%` }}
            >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded shadow-sm">
                    {Math.round(median)}d
                </span>
            </div>

            {/* IQR Box */}
            <div 
                className="absolute top-4 bottom-4 bg-primary/20 border-2 border-primary/50 z-10 rounded-sm"
                style={{ 
                    left: `${toPct(q1)}%`, 
                    width: `${toPct(q3) - toPct(q1)}%` 
                }}
            />

            {/* Whisker Line */}
            <div 
                className="absolute left-0 right-0 h-0.5 bg-muted-foreground/30 top-1/2 -translate-y-1/2"
                style={{ 
                    left: `${toPct(min)}%`, 
                    right: `${100 - toPct(max)}%` 
                }}
            />

            {/* Min/Max Caps */}
            <div className="absolute top-8 bottom-8 w-0.5 bg-muted-foreground/50" style={{ left: `${toPct(min)}%` }} />
            <div className="absolute top-8 bottom-8 w-0.5 bg-muted-foreground/50" style={{ left: `${toPct(max)}%` }} />

            {/* Outliers */}
            {outliers.map((o, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-destructive/60 hover:bg-destructive transition-colors cursor-help"
                    style={{ left: `${toPct(o)}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                    title={`Outlier: ${o} dias`}
                />
            ))}
        </div>

        {/* Legend */}
        <div className="mt-12 grid grid-cols-5 text-xs font-mono text-foreground/80 uppercase tracking-tighter">
            <div className="text-center">Min: {Math.round(min)}d</div>
            <div className="text-center">Q1: {Math.round(q1)}d</div>
            <div className="text-center font-bold text-primary">Med: {Math.round(median)}d</div>
            <div className="text-center">Q3: {Math.round(q3)}d</div>
            <div className="text-center">Max: {Math.round(max)}d</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Metodologia OPC:</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">O Quê:</span> Dispersão temporal da tramitação. <br/>
          <span className="font-bold text-foreground">Por Quê:</span> Pontos vermelhos representam passivo oculto/gargalo operacional. <br/>
          <span className="font-bold text-foreground">Como:</span> Auditar processos com lead time {'>'} {Math.round(max)} dias (Outliers).
        </p>
      </div>
    </div>
  );
};
