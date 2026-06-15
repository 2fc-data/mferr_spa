import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, DollarSign, AlertTriangle, Clock } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  story: string;
  icon: React.ReactNode;
  trendColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, story, icon, trendColor }) => {
  const isPositive = trend?.includes("▲");
  const TrendIcon = isPositive ? TrendingUp : (trend?.includes("▼") ? TrendingDown : Minus);

  return (
    <Card className="shadow-sm border-l-4 border-l-primary overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-center text-muted-foreground mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider">{title}</span>
          <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black tracking-tight">{value}</h3>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground italic line-clamp-2">
          {story}
        </p>
      </CardContent>
    </Card>
  );
};

interface KpiGridProps {
  story: any;
}

export const KpiGrid = React.memo(({ story }: KpiGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard 
        title="Volume Total" 
        value={story.volume.headline} 
        trend={story.volume.subline} 
        story={story.volume.story}
        icon={<Target className="w-4 h-4" />}
        trendColor={story.volume.color}
      />
      <KpiCard 
        title="Ticket Médio" 
        value={story.ticket.headline} 
        trend={story.ticket.subline} 
        story={story.ticket.story}
        icon={<DollarSign className="w-4 h-4" />}
        trendColor={story.ticket.color}
      />
      <KpiCard 
        title="Prioridade Alta" 
        value={story.priority.headline} 
        trend={story.priority.subline} 
        story={story.priority.story}
        icon={<AlertTriangle className="w-4 h-4" />}
        trendColor={story.priority.color}
      />
      <KpiCard 
        title="Tempo Médio" 
        value={story.timing.headline} 
        trend={story.timing.subline} 
        story={story.timing.story}
        icon={<Clock className="w-4 h-4" />}
        trendColor={story.timing.color}
      />
    </div>
  );
});
