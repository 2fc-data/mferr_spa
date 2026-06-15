
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const ProductivityLeaderboard = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex-1 flex flex-col">
      <h3 className="text-lg font-black tracking-tight mb-2">Placar de Operações</h3>
      <p className="text-xs text-muted-foreground mb-6 font-medium">Membros da equipe com maior vazão de resolução.</p>
      
      <div className="space-y-4 overflow-y-auto pr-2">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-8">Nenhum dado de produtividade no período.</p>
        )}
        {data.map((user, i) => (
          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-primary/5 rounded-2xl border border-white/5 transition-colors hover:bg-primary/10 group">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/20 text-primary font-black uppercase text-xs">
                  {user.userName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-extrabold text-[13px] leading-tight text-foreground/90 group-hover:text-foreground transition-colors">{user.userName}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">Ranking #{i + 1}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 sm:mt-0 ml-12 sm:ml-0">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-muted-foreground">Velocidade</span>
                <span className="font-black text-[13px] tabular-nums text-emerald-500">{user.avgDays} dias</span>
              </div>
              <div className="w-px h-8 bg-border/50 hidden sm:block"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-muted-foreground">Volume</span>
                <Badge variant="outline" className="mt-1 h-5 px-2 text-[11px] font-black tabular-nums bg-primary text-primary-foreground border-transparent shadow-sm">
                  {user.tasksCompleted} conc.
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
