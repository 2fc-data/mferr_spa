import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesService, type Rule } from '@/services/rules.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { ShieldCheck, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';

const ruleSchema = z.object({
  name: z.string().min(1, { message: 'O campo Nome é obrigatório' }),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type RuleFormData = z.infer<typeof ruleSchema>;

export const Rules = () => {
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();


  const { data: rules = [], isLoading } = useQuery<Rule[]>({
    queryKey: ['rules'],
    queryFn: rulesService.getAll,
  });

  const createRuleMutation = useMutation({
    mutationFn: rulesService.create,
    onSuccess: () => {
      setSubmissionStatus('Regra criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      handleCancel();
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao criar regra'}`);
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: rulesService.update,
    onSuccess: () => {
      setSubmissionStatus('Regra atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      handleCancel();
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao atualizar regra'}`);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: rulesService.delete,
    onSuccess: () => {
      setSubmissionStatus('Regra excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao excluir regra'}`);
    }
  });

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  const onSubmit = (data: RuleFormData) => {
    const formData = {
      ...data,
      name: data.name || '',
      description: data.description ? toTitleCase(data.description) : undefined,
    };
    setSubmissionStatus('Enviando…');
    if (editingId) {
      updateRuleMutation.mutate({ id: editingId, data: formData });
    } else {
      createRuleMutation.mutate(formData);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingId(rule.id);
    form.reset({
      name: rule.name,
      description: rule.description,
      is_active: rule.is_active,
    });
    setSubmissionStatus(null);

    // Scroll to top of the form
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDelete = (id: number | string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    deleteRuleMutation.mutate(id as number);
    if (editingId === id) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({ name: '', description: '', is_active: true });
    setSubmissionStatus(null);
  };

  const columns: Column<Rule>[] = [
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Descrição', accessorKey: 'description', className: 'hidden md:table-cell max-w-[300px] truncate' },
    { header: 'Ativa', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Regras e Permissões" 
        description="Defina as regras de acesso granulares que podem ser atribuídas aos perfis de usuário."
        icon={ShieldCheck}
      />

      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <Card ref={formCardRef} className="w-full border border-white/10 shadow-xl bg-card/40 backdrop-blur-sm rounded-2xl h-fit overflow-hidden">
          <CardHeader className="border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20 text-accent">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  {editingId ? 'Editar Regra' : 'Nova Regra'}
                </CardTitle>
                <CardDescription>
                  {editingId ? 'Atualize as definições da regra.' : 'Cadastre uma nova regra de sistema.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nome da Regra</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: process.create" 
                          {...field}                           className="h-11 border-border/50 focus:ring-accent capitalize"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Propósito desta regra…"
                          className="min-h-[100px] border-border/50 focus:ring-accent resize-none capitalize"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border border-border/50 rounded-lg bg-accent/5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium cursor-pointer flex-1 py-1">Regra Ativa</FormLabel>
                  </FormItem>
                )}
              />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 h-11 shadow-md transition-all active:scale-95" disabled={createRuleMutation.isPending || updateRuleMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId
                      ? (updateRuleMutation.isPending ? 'Salvando…' : 'Atualizar')
                      : (createRuleMutation.isPending ? 'Salvando…' : 'Salvar')}
                  </Button>
                  {(editingId || form.formState.isDirty) && (
                    <Button type="button" variant="outline" className="h-11 px-4" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
            {submissionStatus && (
              <div className={cn(
                "mt-4 p-3 rounded-lg text-center text-sm font-medium animate-in slide-in-from-top-2 duration-300",
                submissionStatus.includes('Erro') ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-green-500/10 text-green-600 border border-green-500/20"
              )}>
                {submissionStatus}
              </div>
            )}
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="flex-1 min-h-[500px] animate-in fade-in duration-700 delay-100">
          <DataTable
            title="Regras Cadastradas"
            data={rules}
            columns={columns}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityName="Regras"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
