import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { outcomesService, type OutcomeFormData, type Outcome } from '@/services/outcomes.service';
import { statusService } from '@/services/status.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useCrud } from '@/hooks/useCrud';
import { useQuery } from '@tanstack/react-query';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Gavel, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, CheckboxRow, inputCls, textareaCls, glassCardCls, glassCardHeaderCls, labelCls } from '@/components/ui/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const OutcomesForm: React.FC = () => {
  const formCardRef = useRef<HTMLDivElement>(null);


  const {
    entities: outcomes,
    isLoading: isLoadingOutcomes,
    editingId,
    submissionStatus,
    form,
    onSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting
  } = useCrud<Outcome, OutcomeFormData>({
    service: outcomesService,
    entityName: 'Resultado',
    queryKey: 'outcomes',
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

  // Fetch statuses for the select field
  const { data: statusList } = useQuery({
    queryKey: ['statuses-list'],
    queryFn: () => statusService.getAll(),
  });

  const onEditWrapper = (entity: Outcome) => {
    handleEdit(entity);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const { register, formState: { errors }, watch, setValue } = form;
  const isActive = watch('is_active');
  const selectedStatusId = watch('status_id');

  const columns: Column<Outcome>[] = [
    { 
      header: 'Nome', 
      accessorKey: (item: Outcome) => toTitleCase(item.name) 
    },
    { header: 'Descrição', accessorKey: 'description', className: 'hidden md:table-cell max-w-[200px] truncate' },
    { 
      header: 'Status Vinculado', 
      accessorKey: (item: Outcome) => item.status?.name || <span className="text-muted-foreground italic">Nenhum</span>,
      className: 'hidden lg:table-cell'
    },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Resultados de Processos" 
        description="Gerencie os possíveis desdobramentos e decisões finais dos processos no sistema."
        icon={Gavel}
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
                  {editingId ? 'Editar Resultado' : 'Novo Resultado'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <form onSubmit={onSubmit} className="space-y-5">
              <FormSection label="Nome do Resultado" htmlFor="name" required error={errors.name ? 'Este campo é obrigatório' : undefined}>
                <Input 
                  id="name" 
                  {...register('name', { required: true })} 
                  placeholder="Ex: Procedente…"
                  className={cn(inputCls, 'capitalize')}
                  autoComplete="off"
                />
              </FormSection>

              <FormSection label="Descrição" htmlFor="description">
                <Textarea 
                  id="description" 
                  {...register('description')} 
                  placeholder="Descreva brevemente o resultado…"
                  className={cn(textareaCls, "min-h-[100px]", "capitalize")}
                />
              </FormSection>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status_id" className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Vincular ao Status</Label>
                <Select 
                  value={selectedStatusId ? String(selectedStatusId) : "none"} 
                  onValueChange={(val) => setValue('status_id', val === "none" ? undefined : Number(val))}
                >
                  <SelectTrigger id="status_id" className="h-10 rounded-lg bg-background/80 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer">
                    <SelectValue placeholder="Selecione um status (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border/50 max-h-60">
                    <SelectItem value="none" className="cursor-pointer text-xs">Nenhum (sem vínculo)</SelectItem>
                    {(statusList || []).map((status) => (
                      <SelectItem key={status.id} value={String(status.id)} className="cursor-pointer text-xs">
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CheckboxRow
                id="is_active"
                label="Resultado Ativo"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', !!checked)}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Salvando…' : editingId ? 'Atualizar' : 'Salvar'}
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
            title="Lista de Resultados"
            data={outcomes}
            columns={columns}
            isLoading={isLoadingOutcomes}
            onEdit={onEditWrapper}
            onDelete={handleDelete}
            entityName="Resultados"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
