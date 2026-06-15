import React from 'react';
import { useOperationsData } from '../../../hooks/useOperationsData';
import { BottleneckChart } from '../../../components/dashboard/operations/BottleneckChart';
import { ProductivityLeaderboard } from '../../../components/dashboard/operations/ProductivityLeaderboard';
import { Activity } from 'lucide-react';

export const OperationsDashboard: React.FC<any> = (props) => {
  const { data, isLoading, isError } = useOperationsData(props);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full mt-6 bg-card/50 rounded-[2rem] border border-dashed">
        <p className="text-sm font-bold text-muted-foreground animate-pulse flex items-center gap-2">
          <Activity className="w-4 h-4" /> Calculando gargalos métricos...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-destructive/5 rounded-[2rem] mt-6 border border-destructive/20">
        <p className="text-destructive font-bold text-sm">Falha ao obter relatório operacional.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <BottleneckChart data={data.bottlenecks || []} />
      <ProductivityLeaderboard data={data.productivity || []} />
    </div>
  );
};
