import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getURI, ENTITIES } from '@/services/getURI';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Users, Link as LinkIcon, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection, inputCls, glassCardCls, glassCardHeaderCls, labelCls } from '@/components/ui/FormField';

interface CauseUserFormData {
  cause_id: number;
  user_id: number;
}

export const CauseUserForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CauseUserFormData>();
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const onSubmit = async (data: CauseUserFormData) => {
    setSubmissionStatus('Enviando...');
    try {
      const response = await fetch(getURI(ENTITIES.CAUSE_USERS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) setSubmissionStatus('Vínculo criado com sucesso!');
      else setSubmissionStatus(`Erro: ${response.statusText}`);
    } catch (e) { setSubmissionStatus('Erro ao enviar formulário'); }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[800px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Vínculo de Usuários" 
        description="Associe usuários a processos específicos para controle de acesso e responsabilidades."
        icon={Users}
      />

      <Card className={cn("w-full overflow-hidden", glassCardCls)}>
        <CardHeader className={glassCardHeaderCls}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-inner">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className={labelCls}>Configuração</span>
              <CardTitle className="text-2xl font-bold tracking-tight">Vincular Usuário ao Processo</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection label="ID do Processo (Cause ID)" htmlFor="cause_id" required error={errors.cause_id ? 'Obrigatório' : undefined}>
                <Input 
                  type="number" 
                  id="cause_id" 
                  {...register('cause_id', { required: true, valueAsNumber: true })} 
                  placeholder="0…"
                  className={inputCls}
                />
              </FormSection>
              
              <FormSection label="ID do Usuário (User ID)" htmlFor="user_id" required error={errors.user_id ? 'Obrigatório' : undefined}>
                <Input 
                  type="number" 
                  id="user_id" 
                  {...register('user_id', { required: true, valueAsNumber: true })} 
                  placeholder="0…"
                  className={inputCls}
                />
              </FormSection>
            </div>

            <Button type="submit" className="w-full h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
              <Save className="w-4 h-4 mr-2" />
              Salvar Vínculo
            </Button>
          </form>
          {submissionStatus && (
            <div className={cn(
              "mt-6 p-3 rounded-lg text-center text-sm font-medium animate-in slide-in-from-top-2 duration-300",
              submissionStatus.includes('Erro') ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-green-500/10 text-green-600 border border-green-500/20"
            )}>
              {submissionStatus}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
