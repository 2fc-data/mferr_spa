import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { profilesService, type Profile, type CreateProfileData } from '@/services/profiles.service';
import { rulesService } from '@/services/rules.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { UserCog, Plus, Pencil, Save, X, Shield } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, CheckboxRow, inputCls, textareaCls, glassCardHeaderCls, labelCls } from '@/components/ui/FormField';

export const Profiles: React.FC = () => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();


  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateProfileData>({
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      rule_ids: []
    }
  });

  const selectedRuleIds = watch('rule_ids') || [];
  const isActive = watch('is_active');

  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: profilesService.getAll,
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['rules'],
    queryFn: rulesService.getAll,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProfileData) =>
      editingId ? profilesService.update({ id: editingId, data }) : profilesService.create(data),
    onSuccess: () => {
      setSubmissionStatus(editingId ? 'Perfil atualizado!' : 'Perfil criado!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: profilesService.delete,
    onSuccess: () => {
      setSubmissionStatus('Perfil excluído!');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  });

  const onSubmit = (data: CreateProfileData) => {
    if (!data.rule_ids || data.rule_ids.length === 0) {
      setRuleError('Selecione pelo menos uma regra');
      return;
    }
    setRuleError(null);
    const formData = {
      ...data,
      name: data.name ? toTitleCase(data.name) : '',
      description: data.description ? toTitleCase(data.description) : undefined,
    };
    mutation.mutate(formData);
  };

  const onSubmitWrapper = handleSubmit(onSubmit);

  const handleEdit = (profile: Profile) => {
    setEditingId(profile.id);
    reset({
      name: profile.name,
      description: profile.description || '',
      is_active: profile.is_active,
      rule_ids: profile.rules?.map(r => r.id) || []
    });

    // Scroll to top of the form
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Deseja excluir este perfil?')) {
      deleteMutation.mutate(id as number);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    reset({ name: '', description: '', is_active: true, rule_ids: [] });
  };

  const toggleRule = (ruleId: number) => {
    setRuleError(null);
    const current = selectedRuleIds;
    const exists = current.includes(ruleId);
    if (exists) {
      setValue('rule_ids', current.filter(id => id !== ruleId));
    } else {
      setValue('rule_ids', [...current, ruleId]);
    }
  };

  const columns: Column<Profile>[] = [
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Descrição', accessorKey: 'description', className: 'hidden md:table-cell max-w-[300px] truncate' },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Perfis de Acesso"
        description="Defina papéis e permissões para os usuários do sistema, garantindo a segurança e governança dos dados."
        icon={UserCog}
      />

      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <Card ref={formCardRef} className="w-full border border-white/10 shadow-xl bg-card/40 backdrop-blur-sm rounded-2xl h-fit overflow-hidden">
          <CardHeader className={glassCardHeaderCls}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-all shadow-inner",
                editingId ? "bg-amber-500/20 text-amber-500" : "bg-primary/10 text-primary"
              )}>
                {editingId ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div className="flex flex-col">
                <span className={labelCls}>
                  {editingId ? 'Editando' : 'Cadastro'}
                </span>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {editingId ? 'Editar Perfil' : 'Novo Perfil'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <form onSubmit={onSubmitWrapper} className="space-y-6">
              <FormSection label="Nome do Perfil" htmlFor="name" required error={errors.name ? 'Este campo é obrigatório' : undefined}>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Ex: Advogado Pleno…"
                  className={cn(inputCls, 'capitalize')}
                  autoComplete="off"
                />
              </FormSection>

              <FormSection label="Descrição" htmlFor="description">
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva as responsabilidades…"
                  className={cn(textareaCls, "min-h-[80px]", "capitalize")}
                />
              </FormSection>

              <div className="space-y-3">
                <Label className={cn(labelCls, "flex items-center gap-2 mb-2")}>
                  <Shield className="w-4 h-4 text-primary" />
                  Regras / Permissões
                </Label>
                {ruleError && (
                  <p className="text-xs text-destructive flex items-center gap-1">{ruleError}</p>
                )}
                <div className="border border-white/10 rounded-2xl p-4 bg-primary/5 max-h-[250px] overflow-y-auto space-y-1 shadow-inner">
                  {rules.map(rule => (
                    <div key={rule.id} className="border-none bg-transparent hover:bg-primary/10 p-2 rounded-lg transition-colors">
                      <CheckboxRow
                        id={`rule-${rule.id}`}
                        label={toTitleCase(rule.description || rule.name)}
                        checked={selectedRuleIds.includes(rule.id)}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                  ))}
                  {rules.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">Nenhuma regra encontrada.</p>
                  )}
                </div>
              </div>

              <CheckboxRow
                id="is_active"
                label="Perfil Ativo"
                checked={!!isActive}
                onCheckedChange={(checked) => setValue('is_active', !!checked)}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all" disabled={mutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {mutation.isPending ? 'Salvando…' : editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" className="h-11 px-4 font-bold rounded-xl border border-white/10" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
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
        <div className="flex-1 min-h-[500px] animate-in fade-in duration-700 delay-200">
          <DataTable
            title="Lista de Perfis"
            data={profiles}
            columns={columns}
            isLoading={isLoadingProfiles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityName="Perfis"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
