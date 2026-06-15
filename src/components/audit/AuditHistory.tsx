import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User as UserIcon, AlertCircle, ArrowRight, FilePlus, RefreshCcw, History, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AuditHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: number;
  entityName?: string;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}) => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', entityType, entityId],
    queryFn: () => auditService.getByEntity(entityType, Number(entityId)),
    enabled: isOpen && !!entityId && Number(entityId) > 0,
  });

  const formatValue = (val: any) => {
    if (val === null || val === undefined || val === 'vazio') {
      return <span className="text-accent/60 italic font-medium">vazio</span>;
    }
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    if (typeof val === 'object') return JSON.stringify(val);
    
    const strVal = String(val);
    // Detection for ISO dates
    if (strVal.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const date = new Date(strVal);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR');
        }
      } catch (e) { /* ignore */ }
    }
    
    return strVal;
  };

  const getFriendlyFieldName = (field: string) => {
    const names: Record<string, string> = {
      name: 'Nome',
      username: 'Usuário',
      email: 'E-mail',
      document: 'Documento',
      phone1: 'Telefone 1',
      phone2: 'Telefone 2',
      is_active: 'Ativo',
      number: 'Número',
      total_value: 'Valor da Causa',
      customer_amount: 'Valor do Cliente',
      total_fees: 'Honorários',
      percentage: 'Porcentagem',
      description: 'Descrição',
      court_id: 'Tribunal',
      current_stage_id: 'Fase',
      current_status_id: 'Status',
      outcome_id: 'Resultado',
      city_id: 'Cidade',
      court_division_id: 'Vara / Divisão',
      area_id: 'Área',
      subject: 'Assunto',
      litigation_type: 'Tipo de Litígio',
      process_date: 'Data do Processo',
      Ação: 'Evento',
      Colaboradores: 'Equipe de Colaboradores',
      Clientes: 'Clientes Relacionados',
    };
    return names[field] || field;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0 border-primary/20">
        <DialogHeader className="p-8 pb-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-primary">
                <History className="w-8 h-8 text-accent" />
                Dossiê de Alterações
              </DialogTitle>
              <DialogDescription className="text-base font-semibold text-muted-foreground">
                {entityName ? (
                  <span>Processo: <span className="text-accent font-bold text-lg">{entityName}</span></span>
                ) : (
                  `Log de atividades para ${entityType} #${entityId}`
                )}
              </DialogDescription>
            </div>
            <div className="hidden sm:flex flex-col items-end text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-50">
              <span>Juris Audit System</span>
              <span>v2.1 Law Edition</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-950">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
              <RefreshCcw className="w-12 h-12 animate-spin text-accent" />
              <p className="text-lg font-medium animate-pulse">Consultando base de dados jurídica…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-4 p-8 text-destructive bg-destructive/5 border border-destructive/20 rounded-2xl">
              <AlertCircle className="w-8 h-8" />
              <div className="space-y-1">
                <p className="text-lg font-bold">Erro na recuperação dos registros</p>
                <p className="text-sm opacity-80">Não foi possível estabelecer conexão para extração do dossiê.</p>
              </div>
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
              <FilePlus className="w-16 h-16 text-muted-foreground/30" />
              <p className="text-xl font-medium font-serif italic text-muted-foreground">Nenhum evento registrado no dossiê deste documento.</p>
            </div>
          ) : (
            <div className="space-y-12 relative before:absolute before:inset-0 before:left-5 before:w-1 before:bg-muted before:h-full">
              {logs.map((log) => {
                const isCreate = log.action === 'CREATE';
                const changes = log.changes ? Object.entries(log.changes) : [];

                if (!isCreate && changes.length === 0) return null;
                
                return (
                  <div key={log.id} className="relative pl-12">
                    {/* Activity Indicator Dot */}
                    <div className={cn(
                      "absolute left-[13px] top-1.5 w-4 h-4 rounded-full ring-8 ring-white dark:ring-slate-950 border-4 z-10",
                      isCreate ? "bg-emerald-500 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-primary border-accent/30 shadow-[0_0_15px_rgba(35,50,90,0.3)]"
                    )} />
                    
                    {/* Timestamp & User Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black bg-secondary text-primary px-3 py-1.5 rounded-lg border border-primary/10 shadow-sm">
                          {new Date(log.created_at).toLocaleDateString('pt-BR')} {' '}
                          <span className="text-primary/60 font-bold ml-1">
                            {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                        <span className={cn(
                          "text-xs uppercase font-black px-3 py-1 rounded-md tracking-wider shadow-sm",
                          isCreate ? "bg-emerald-600 text-white" : "bg-primary text-white"
                        )}>
                          {isCreate ? 'Criação' : 'Atualização'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                        <UserIcon className="w-4 h-4 text-accent" />
                        {log.user?.name || 'Sistema'}
                      </div>
                    </div>

                    {/* Change Cards */}
                    <div className={cn(
                      "rounded-2xl border-2 shadow-md overflow-hidden transition-all hover:shadow-lg",
                      isCreate ? "bg-emerald-50/20 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" : "bg-white border-muted dark:bg-slate-900 dark:border-slate-800"
                    )}>
                      {isCreate && (
                        <div className="p-6 flex items-center gap-5 border-b border-emerald-100 bg-emerald-50/50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                          <div className="p-4 bg-emerald-500/10 rounded-2xl">
                            <FilePlus className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">Formalização de Registro</p>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-500/60 font-medium font-serif italic">Este documento foi formalmente integrado ao sistema com os seguintes dados iniciais:</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="divide-y divide-muted">
                        {changes.map(([field, delta]: [string, any]) => (
                          <div key={field} className="group transition-colors">
                            {/* Field Label Full Width */}
                            <div className="px-6 py-2.5 bg-muted/30 border-b border-muted flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span className="text-xs uppercase font-black tracking-widest text-primary/80">
                                {getFriendlyFieldName(field)}
                              </span>
                            </div>
                            
                            {/* Side by Side Diff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                              {/* BEFORE */}
                              <div className="p-6 bg-red-50/20 dark:bg-red-950/20 border-r border-muted/50 group-hover:bg-red-100/30 transition-colors">
                                <span className="block text-[10px] uppercase tracking-[0.15em] font-black text-red-600 mb-2">Informações Anteriores</span>
                                <div className="min-w-0">
                                  <p className="text-lg font-bold line-through text-red-900 dark:text-red-400 break-words">
                                    {formatValue(delta.old ?? delta.oldValue ?? delta.valor_anterior)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* AFTER */}
                              <div className="p-6 bg-emerald-50/20 dark:bg-emerald-950/20 group-hover:bg-emerald-100/30 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="block text-[10px] uppercase tracking-[0.15em] font-black text-emerald-700">Informações Atuais</span>
                                  <ArrowRight className="w-4 h-4 text-emerald-600 hidden md:block" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-lg font-black text-slate-900 dark:text-emerald-400 break-words decoration-accent/30 decoration-4 underline-offset-8">
                                    {formatValue(delta.new ?? delta.newValue ?? delta.novo_conteudo)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t bg-muted/40 flex justify-between items-center px-10">
          <p className="text-xs text-muted-foreground italic font-bold opacity-60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Certificado de integridade gerado automaticamente.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>Monitoramento em Tempo Real</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
