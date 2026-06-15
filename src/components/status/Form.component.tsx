import React, { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusService, type StatusFormData, type Status } from '@/services/status.service';
import { stagesService } from '@/services/stages.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useCrud } from '@/hooks/useCrud';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import { Activity, Plus, Pencil, Save, X } from 'lucide-react';
import { cn, toTitleCase } from '@/lib/utils';
import { FormSection, CheckboxRow, inputCls, textareaCls, selectCls } from '@/components/ui/FormField';

export const StatusForm: React.FC = () => {
  const {
    entities: statuses,
    isLoading: isLoadingStatus,
    editingId,
    submissionStatus,
    form,
    submit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting
  } = useCrud<Status, StatusFormData>({
    service: statusService,
    entityName: 'Status',
    queryKey: 'status',
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      stage_id: undefined,
    },
    transformData: (data) => ({
      ...data,
      name: data.name ? toTitleCase(data.name) : '',
      description: data.description ? toTitleCase(data.description) : '',
    })
  });

  const formCardRef = useRef<HTMLDivElement>(null);

  const onEditWrapper = (entity: Status) => {
    handleEdit(entity);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };


  const { register, control, formState: { errors }, watch, setValue, handleSubmit } = form;
  const isActive = watch('is_active');

  const [stageError, setStageError] = useState<string | undefined>();

  const onSubmitWrapper = handleSubmit((data: StatusFormData) => {
    if (!data.stage_id) {
      setStageError('Selecione uma fase processual');
      return;
    }
    setStageError(undefined);
    submit(data);
  });

  const { data: stages = [] } = useQuery({
    queryKey: ['stages'],
    queryFn: stagesService.getAll,
  });

  const columns: Column<Status>[] = [
    { 
      header: 'Nome', 
      accessorKey: (item) => toTitleCase(item.name),
      sortKey: 'name' 
    },
    {
      header: 'Fase',
      accessorKey: (item) => item.stage?.name ? toTitleCase(item.stage.name) : '—',
      sortKey: 'stage',
      className: 'hidden sm:table-cell',
    },
    { 
      header: 'Descrição', 
      accessorKey: (item) => item.description ? toTitleCase(item.description) : '—',
      sortKey: 'description', 
      className: 'hidden lg:table-cell max-w-[200px] truncate' 
    },
    { header: 'Ativo', accessorKey: 'is_active', type: 'boolean', className: 'text-center w-[100px]' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Status de Processos" 
        description="Gerencie os diferentes estados de tramitação para acompanhar a evolução das causas."
        icon={Activity}
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
                  {editingId ? 'Editar Status' : 'Novo Status'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <form onSubmit={onSubmitWrapper} className="space-y-5">
              <FormSection label="Nome do Status" htmlFor="name" required error={errors.name ? 'Este campo é obrigatório' : undefined}>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Ex: Petição inicial protocolada…"
                  className={cn(inputCls, 'capitalize')}
                  autoComplete="off"
                />
              </FormSection>

              <FormSection label="Fase Processual" htmlFor="stage_id" hint="Vincule este status à sua fase correspondente no processo." error={stageError}>
                <Controller
                  name="stage_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                      value={field.value?.toString() ?? ""}
                    >
                      <SelectTrigger id="stage_id" className={selectCls}>
                        <SelectValue placeholder="Selecione a Fase…" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages
                          .filter((s) => s.is_active)
                          .map((stage) => (
                            <SelectItem key={stage.id} value={stage.id.toString()}>
                              {stage.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormSection>

              <FormSection label="Descrição" htmlFor="description">
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva brevemente o status…"
                  className={cn(textareaCls, 'min-h-[100px]', 'capitalize')}
                />
              </FormSection>

              <CheckboxRow
                id="is_active"
                label="Status Ativo"
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
                  {isSubmitting ? 'Salvando…' : editingId ? 'Atualizar Status' : 'Salvar Status'}
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
            title="Lista de Status"
            data={statuses}
            columns={columns}
            isLoading={isLoadingStatus}
            onEdit={onEditWrapper}
            onDelete={handleDelete}
            entityName="Status"
            paginated
            defaultPageSize={10}
            sortable
          />
        </div>
      </div>
    </div>
  );
};
