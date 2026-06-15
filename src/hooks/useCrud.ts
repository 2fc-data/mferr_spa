import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { DefaultValues, FieldValues } from 'react-hook-form';

interface CrudService<T, FormData> {
  getAll: (params?: any) => Promise<T[]>;
  create: (data: FormData) => Promise<T>;
  update: (params: { id: number; data: Partial<FormData> }) => Promise<T>;
  delete: (id: number) => Promise<void>;
}

interface UseCrudOptions<T, FormData extends FieldValues> {
  service: CrudService<T, FormData>;
  entityName: string;
  queryKey: string;
  defaultValues: DefaultValues<FormData>;
  onSuccess?: () => void;
  transformData?: (data: FormData) => FormData;
}

export function useCrud<T extends { id: number }, FormData extends FieldValues>({
  service,
  entityName,
  queryKey,
  defaultValues,
  onSuccess,
  transformData
}: UseCrudOptions<T, FormData>) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    defaultValues
  });

  const { data: entities = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => service.getAll()
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      editingId ? service.update({ id: editingId, data }) : service.create(data),
    onSuccess: () => {
      setSubmissionStatus(editingId ? `${entityName} atualizado com sucesso!` : `${entityName} criado com sucesso!`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (onSuccess) onSuccess();
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao processar requisição'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: service.delete,
    onSuccess: () => {
      setSubmissionStatus(`${entityName} excluído com sucesso!`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao excluir registro'}`);
      setTimeout(() => setSubmissionStatus(null), 5000);
    }
  });

  const onSubmit = (data: FormData) => {
    setSubmissionStatus('Enviando...');
    
    // Aplicar transformação de dados se definida
    const finalData = transformData ? transformData(data) : data;
    
    // Gerar um payload limpo: remover campos de sistema, objetos e valores undefined
    const cleanData: any = {};
    
    Object.keys(finalData).forEach(key => {
      const val = (finalData as any)[key];
      
      // Bloquear campos de sistema
      if (['id', 'created_at', 'updated_at', 'deleted_at'].includes(key)) return;
      
      // Bloquear arrays e objetos aninhados
      if (val !== null && typeof val === 'object') return;

      // Não incluir se for undefined
      if (val === undefined) return;

      // Remover chaves de relacionamento (_id) com valor null/undefined
      if (key.endsWith('_id') && !val) return;

      cleanData[key] = val;
    });
    
    mutation.mutate(cleanData as FormData);
  };

  const handleEdit = (entity: T) => {
    setEditingId(entity.id);
    form.reset(entity as unknown as DefaultValues<FormData>);
    setSubmissionStatus(null);
  };

  const handleDelete = (id: number | string) => {
    if (confirm(`Tem certeza que deseja excluir este ${entityName.toLowerCase()}?`)) {
      deleteMutation.mutate(id as number);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    form.reset(defaultValues);
  };

  return {
    entities,
    isLoading,
    editingId,
    submissionStatus,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    submit: onSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting: mutation.isPending,
    setEditingId
  };
}
