import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { areasService, type AreaFormData, type Area } from '@/services/areas.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useCrud } from '@/hooks/useCrud';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Layers, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, CheckboxRow, inputCls, textareaCls } from '@/components/ui/FormField';

export const AreaForm: React.FC = () => {

  const {
    entities: areas,
    isLoading: isLoadingAreas,
    editingId,
    submissionStatus,
    form,
    onSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting
  } = useCrud<Area, AreaFormData>({
    service: areasService,
    entityName: 'Área',
    queryKey: 'areas',
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
    transformData: (data) => ({
      ...data,
      name: data.name ? toTitleCase(data.name) : '',
      description: data.description ? toTitleCase(data.description) : '',
    })
  });

  const formCardRef = useRef<HTMLDivElement>(null);

  const onEditWrapper = (entity: Area) => {
    handleEdit(entity);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const { register, formState: { errors }, watch, setValue } = form;
  const isActive = watch('is_active');

  const columns: Column<Area>[] = [
    { 
      header: 'Nome', 
      accessorKey: (item: Area) => toTitleCase(item.name) 
    },
    { header: 'Descrição', accessorKey: 'description', className: 'hidden md:table-cell max-w-[200px] truncate' },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Áreas de Atuação" 
        description="Gerencie as áreas de especialidade jurídica do escritório para organizar processos e honorários."
        icon={Layers}
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
                  {editingId ? 'Editar Área' : 'Nova Área'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <form onSubmit={onSubmit} className="space-y-5">
              <FormSection label="Nome da Área" htmlFor="name" required error={errors.name ? 'Este campo é obrigatório' : undefined}>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Ex: Direito Civil…"
                  className={cn(inputCls, 'capitalize')}
                  autoComplete="off"
                />
              </FormSection>

              <FormSection label="Descrição" htmlFor="description">
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva brevemente a área…"
                  className={cn(textareaCls, 'min-h-[100px]', 'capitalize')}
                />
              </FormSection>

              <CheckboxRow
                id="is_active"
                label="Área Ativa"
                checked={isActive}
                onCheckedChange={(v) => setValue('is_active', v)}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-11 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isSubmitting ? 'Salvando…' : editingId ? 'Atualizar Área' : 'Salvar Área'}
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
            title="Lista de Áreas"
            data={areas}
            columns={columns}
            isLoading={isLoadingAreas}
            onEdit={onEditWrapper}
            onDelete={handleDelete}
            entityName="Áreas"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
