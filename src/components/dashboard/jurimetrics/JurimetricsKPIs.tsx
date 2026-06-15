import { Scale, Clock, Hash, Banknote } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils';

interface JurimetricsKPIsProps {
  actionCount: number;
  meanValue: number;
  medianValue: number;
  meanLeadTime: number;
  medianLeadTime: number;
  onTable: number;
  title?: string;
}

export const JurimetricsKPIs: React.FC<JurimetricsKPIsProps> = ({
  actionCount,
  meanValue,
  medianValue,
  meanLeadTime,
  medianLeadTime,
  onTable,
  title,
}) => {
  return (
    <div className="space-y-6">
      {title && <h2 className="text-lg font-semibold text-muted-foreground mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Volume Card */}
        <div className="bg-card dark:bg-surface-700 p-4 rounded-xl border border-border shadow-sm flex flex-col items-start gap-3">
          <div className="bg-blue-500/10 rounded-lg p-3 flex justify-center items-center">
            <Hash size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium uppercase">Volume Processual</p>
            <h3 className="text-xl font-bold text-foreground">{actionCount} <span className="text-sm font-normal text-muted-foreground italic">processos</span></h3>
          </div>
        </div>

        {/* Financial Metrics Card */}
        <div className="bg-card dark:bg-surface-700 p-4 rounded-xl border border-border shadow-sm flex flex-col items-start gap-3">
          <div className="bg-green-500/10 rounded-lg p-3 flex justify-center items-center">
            <Scale size={20} className="text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Métricas Financeiras</p>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm text-muted-foreground font-semibold">Média:</span>
              <span className="text-lg font-bold text-primary">{formatCompactCurrency(meanValue)}</span>
              <span className="text-sm text-muted-foreground font-semibold">Mediana:</span>
              <span className="text-lg font-bold text-primary">{formatCompactCurrency(medianValue)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic mt-1">Mediana reduz distorção de outliers</p>
          </div>
        </div>

        {/* Lead Time Card */}
        <div className="bg-card dark:bg-surface-700 p-4 rounded-xl border border-border shadow-sm flex flex-col items-start gap-3">
          <div className="bg-orange-500/10 rounded-lg p-3 flex justify-center items-center">
            <Clock size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Lead Time (Ciclo de Vida)</p>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-xs text-muted-foreground">Média:</span>
              <span className="text-base font-bold">{Math.round(meanLeadTime)} <span className="text-xs font-normal">dias</span></span>
              <span className="text-xs text-muted-foreground">Mediana:</span>
              <span className="text-lg font-bold">{Math.round(medianLeadTime)} <span className="text-xs font-normal">dias</span></span>
            </div>
          </div>
        </div>

        {/* On Table Card */}
        <div className="bg-card dark:bg-surface-700 p-4 rounded-xl border border-border shadow-sm flex flex-col items-start gap-3">
          <div className="bg-purple-500/10 rounded-lg p-3 flex justify-center items-center">
            <Banknote size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Valor da Causa</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCompactCurrency(onTable)}</h3>
            <p className="text-[10px] text-muted-foreground italic mt-1">Valor negociado estimado</p>
          </div>
        </div>
      </div>
    </div>
  );
};