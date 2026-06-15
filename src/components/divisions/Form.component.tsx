import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { divisionsService, type DivisionFormData, type Division } from '@/services/divisions.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useCrud } from '@/hooks/useCrud';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Scale, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';

export const CourtDivisionForm: React.FC = () => {
  const {
    entities: divisions,
    isLoading: isLoadingDivisions,
    editingId,
    submissionStatus,
    form,
    onSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting
  } = useCrud<Division, DivisionFormData>({
    service: divisionsService,
    entityName: 'Vara / Seção',
    queryKey: 'divisions',
    defaultValues: {
      name: '',
      is_active: true,
    },
    transformData: (data) => ({
      ...data,
      name: data.name ? toTitleCase(data.name) : ''
    })
  });

  const formCardRef = useRef<HTMLDivElement>(null);

  const onEditWrapper = (entity: Division) => {
    handleEdit(entity);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const { register, formState: { errors }, watch, setValue } = form;
  const isActive = watch('is_active');

  const columns: Column<Division>[] = [
    { 
      header: 'Nome', 
      accessorKey: (item: Division) => toTitleCase(item.name)
    },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Varas e Divisões"
        description="Gerencie as varas, seções e divisões para organização dos processos."
        icon={Scale}
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
                  {editingId ? 'Editar Vara' : 'Nova Vara'}
                </CardTitle>
                <CardDescription>
                  {editingId ? 'Atualize as informações da vara.' : 'Cadastre uma nova vara judicial.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nome da Vara</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Ex: 1ª Vara Cível"
                  className={cn("h-11 border-border/50 focus:ring-accent", "capitalize")}
                />
                {errors.name && <p className="text-destructive text-xs font-semibold">Este campo é obrigatório</p>}
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/5 border border-border/50 transition-colors hover:bg-accent/10">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', !!checked)}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer flex-1">Status Ativo</Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 h-11 shadow-md transition-all active:scale-95" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Salvando…' : editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" className="h-11 px-4" onClick={resetForm}>
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
            title="Lista de Varas"
            data={divisions}
            columns={columns}
            isLoading={isLoadingDivisions}
            onEdit={onEditWrapper}
            onDelete={handleDelete}
            entityName="Varas"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
