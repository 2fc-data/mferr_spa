import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const BottleneckChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex-1 flex flex-col min-h-[400px]">
      <h3 className="text-lg font-black tracking-tight mb-2">Gargalos por Atividades (Dias Médios)</h3>
      <p className="text-xs text-muted-foreground mb-6 font-medium">As atividades com maior tempo histórico até a conclusão.</p>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%" className="-ml-4">
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
            <Bar 
              dataKey="avgDays" 
              fill="var(--destructive)" 
              radius={[0, 8, 8, 0]} 
              barSize={24}
              label={{ position: 'right', fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, formatter: (val: number) => `${val} dias` }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
