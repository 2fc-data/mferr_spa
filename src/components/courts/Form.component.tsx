import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { courtsService, type CourtFormData, type Court } from '@/services/courts.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Landmark, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, CheckboxRow, inputCls, textareaCls } from '@/components/ui/FormField';

export const CourtForm: React.FC = () => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CourtFormData>({
    defaultValues: {
      name: '',
      description: '',
      state: '',
      is_federal: false,
      is_active: true,
    }
  });
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: courts = [], isLoading: isLoadingCourts } = useQuery({
    queryKey: ['courts'],
    queryFn: courtsService.getAll,
  });

  const mutation = useMutation({
    mutationFn: (data: CourtFormData) =>
      editingId ? courtsService.update({ id: editingId, data }) : courtsService.create(data),
    onSuccess: () => {
      setSubmissionStatus(editingId ? 'Tribunal atualizado com sucesso!' : 'Tribunal criado com sucesso!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['courts'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao enviar formulário'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: courtsService.delete,
    onSuccess: () => {
      setSubmissionStatus('Tribunal excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao excluir'}`);
      setTimeout(() => setSubmissionStatus(null), 5000);
    }
  });

  const onSubmit = (data: CourtFormData) => {
    const formData = {
      ...data,
      name: data.name ? data.name.toUpperCase() : '',
      description: data.description ? toTitleCase(data.description) : '',
      state: data.state ? data.state.toUpperCase() : '',
    };
    setSubmissionStatus('Enviando…');
    mutation.mutate(formData);
  };

  const handleEdit = (court: Court) => {
    setEditingId(court.id);
    setValue('name', court.name?.toUpperCase());
    setValue('description', court.description);
    setValue('state', court.state || '');
    setValue('is_federal', court.is_federal);
    setValue('is_active', court.is_active);
    setSubmissionStatus(null);

    // Scroll to top of the form
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Tem certeza que deseja excluir este tribunal?')) {
      deleteMutation.mutate(id as number);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    reset({ name: '', description: '', state: '', is_federal: false, is_active: true });
  };

  const isActive = watch('is_active');
  const isFederal = watch('is_federal');

  const columns: Column<Court>[] = [
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Descrição', accessorKey: 'description', className: 'hidden md:table-cell' },
    { header: 'Estado', accessorKey: 'state', className: 'text-center w-[80px]' },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Tribunais e Órgãos"
        description="Cadastre os tribunais e órgãos jurisdicionais onde o escritório possui causas em andamento."
        icon={Landmark}
      />

      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <Card ref={formCardRef} className="w-full border border-white/10 shadow-xl bg-card/40 backdrop-blur-sm rounded-2xl h-fit overflow-hidden">
          <CardHeader className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-all shadow-inner",
                editingId
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-primary/10 text-primary"
              )}>
                {editingId ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                  {editingId ? 'Editando' : 'Cadastro'}
                </span>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {editingId ? 'Editar Tribunal' : 'Novo Tribunal'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormSection label="Nome do Tribunal" htmlFor="name" required error={errors.name?.message}>
                <Input
                  id="name"
                  {...register('name', { required: 'Obrigatório' })}
                  placeholder="Ex: TJMG"
                  className={cn(inputCls, 'uppercase')}
                  autoComplete="off"
                />
              </FormSection>

              <FormSection label="Descrição / Observações" htmlFor="description">
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Tribunal de Justiça de ..."
                  className={cn(textareaCls, 'min-h-[80px]', 'capitalize')}
                />
              </FormSection>

              <FormSection label="Estado (UF)" htmlFor="state">
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Ex: SP…"
                  maxLength={2}
                  className={cn(inputCls, 'uppercase')}
                />
              </FormSection>

              <div className="flex flex-col gap-3">
                <CheckboxRow
                  id="is_federal"
                  label="Tribunal Federal / Nacional"
                  checked={isFederal}
                  onCheckedChange={(v) => setValue('is_federal', v)}
                />

                <CheckboxRow
                  id="is_active"
                  label="Tribunal Ativo"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('is_active', v)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-11 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                  disabled={mutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                  {mutation.isPending ? 'Salvando…' : editingId ? 'Atualizar Tribunal' : 'Salvar Tribunal'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" className="h-11 px-4 font-bold" onClick={resetForm} aria-label="Cancelar edição">
                    <X className="w-4 h-4" aria-hidden="true" />
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
        <div className="flex-1 min-h-[500px] animate-in fade-in duration-700 delay-100">
          <DataTable
            title="Lista de Tribunais"
            data={courts}
            columns={columns}
            isLoading={isLoadingCourts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityName="Courts"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
