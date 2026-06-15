import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cityService, type CityFormData, type City } from '@/services/city.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { MapPin, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, inputCls, glassCardCls, glassCardHeaderCls, labelCls } from '@/components/ui/FormField';

export const CityForm: React.FC = () => {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CityFormData>({
    defaultValues: {
      name: '',
      uf: '',
    }
  });
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: cityService.getAll,
  });

  const mutation = useMutation({
    mutationFn: (data: CityFormData) =>
      editingId ? cityService.update({ id: editingId as number, data }) : cityService.create(data),
    onSuccess: () => {
      setSubmissionStatus(editingId ? 'Cidade atualizada com sucesso!' : 'Cidade criada com sucesso!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao enviar formulário'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: cityService.delete,
    onSuccess: () => {
      setSubmissionStatus('Cidade excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  });

  const onSubmit = (data: CityFormData) => {
    const formData = {
      ...data,
      name: data.name ? toTitleCase(data.name) : '',
      uf: data.uf?.toUpperCase(),
    };
    setSubmissionStatus('Enviando...');
    mutation.mutate(formData);
  };

  const handleEdit = (city: City) => {
    setEditingId(city.id);
    setValue('name', city.name);
    setValue('uf', city.uf?.toUpperCase());
    setSubmissionStatus(null);

    // Scroll to top of the form
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Tem certeza que deseja excluir esta cidade?')) {
      deleteMutation.mutate(id as number);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    reset({ name: '', uf: '' });
  };

  const columns: Column<City>[] = [
    { header: 'Nome', accessorKey: 'name' },
    { header: 'UF', accessorKey: 'uf', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Cidades e Comarcas" 
        description="Gerencie as cidades onde o escritório atua para vincular aos tribunais e processos."
        icon={MapPin}
      />

      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <Card ref={formCardRef} className={cn("w-full h-fit overflow-hidden", glassCardCls)}>
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
                  {editingId ? 'Editar Cidade' : 'Nova Cidade'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormSection label="Nome da Cidade" htmlFor="name" required error={errors.name ? 'Este campo é obrigatório' : undefined}>
                <Input 
                  id="name" 
                  {...register('name', { required: true })} 
                  placeholder="Ex: São Paulo…" 
                  className={cn(inputCls, "capitalize")}
                  autoComplete="address-level2"
                />
              </FormSection>

              <FormSection label="UF (Estado)" htmlFor="uf" required error={errors.uf ? 'Obrigatório (máx 2 caracteres)' : undefined}>
                <Input 
                  id="uf" 
                  {...register('uf', { required: true, maxLength: 2 })} 
                  placeholder="Ex: SP" 
                  maxLength={2} 
                  className={cn(inputCls, "uppercase")} 
                  autoComplete="address-level1"
                />
              </FormSection>

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
        <div className="flex-1 min-h-[500px] animate-in fade-in duration-700 delay-100">
          <DataTable
            title="Lista de Cidades"
            data={cities}
            columns={columns}
            isLoading={isLoadingCities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityName="Cidade"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
