import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { causesService, type CauseFormData, type Cause } from '@/services/causes.service';
import { courtsService } from '@/services/courts.service';
import { areasService } from '@/services/areas.service';
import { stagesService } from '@/services/stages.service';
import { statusService } from '@/services/status.service';
import { outcomesService } from '@/services/outcomes.service';
import { cityService } from '@/services/city.service';
import { divisionsService } from '@/services/divisions.service';
import { usersService } from '@/services/users.service';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, X, Search, Briefcase, Plus, Pencil, Save, Loader2, Eye, Upload, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  glassCardCls,
  glassCardHeaderCls,
  labelCls,
  inputCls,
  selectCls,
} from '@/components/ui/FormField';
import { AuditHistory } from '../audit/AuditHistory';
import { printComponent } from '@/lib/printUtils';
import { ServiceContract } from '../documents/ServiceContract';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AREA_KEYWORDS } from '@/data/AREA_KEYWORDS';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Normaliza texto para comparação (remove acentos, converte para minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Função para determinar a área baseada na Vara/Divisão
const getAreaIdByDivision = (divisionName: string): number | null => {
  if (!divisionName) return null;

  const normalized = normalizeText(divisionName);
  const words = normalized.split(/[\s,./-]+/).filter(w => w.length > 2);

  // Percorre cada área e suas palavras-chave em ordem de prioridade
  const priorityOrder = [5, 6, 9, 2, 8, 3, 7, 1, 4, 37, 38, 39, 40, 41, 42];

  for (const areaId of priorityOrder) {
    const keywords = AREA_KEYWORDS[areaId] || [];
    for (const keyword of keywords) {
      if (normalized.includes(keyword) || words.some(w => w.includes(keyword))) {
        return areaId;
      }
    }
  }

  return null;
};

// Monetary field display helpers
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const parseBRL = (raw: string) =>
  parseFloat(raw.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

// Format process number: NNNNNNN-DD.AAAA.J.TR.OOOO
const maskProcessNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 20);
  if (digits.length === 0) return '';

  let formatted = '';
  // NNNNNNN (7 digits)
  if (digits.length > 0) formatted += digits.slice(0, 7);
  // DD (2 digits)
  if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
  // AAAA (4 digits)
  if (digits.length >= 9) formatted += '.' + digits.slice(9, 13);
  // J (1 digit)
  if (digits.length >= 13) formatted += '.' + digits.slice(13, 14);
  // TR (2 digits)
  if (digits.length >= 14) formatted += '.' + digits.slice(14, 16);
  // OOOO (4 digits)
  if (digits.length >= 16) formatted += '.' + digits.slice(16, 20);

  return formatted;
};

const causeSchema = z.object({
  number: z.string().min(1, { message: 'O número do processo é obrigatório' }),
  process_date: z.string().min(1, { message: 'A data do processo é obrigatória' }),
  description: z.string().optional().nullable(),
  court_id: z.number().min(1, { message: 'Selecione um tribunal' }),
  division_id: z.number().min(1, { message: 'Selecione uma Vara/Divisão' }),
  area_id: z.number().min(1, { message: 'Selecione uma Área' }),
  city_id: z.number().min(1, { message: 'A cidade é obrigatória' }),
  current_stage_id: z.number().optional().nullable(),
  current_status_id: z.number().optional().nullable(),
  outcome_id: z.number().optional().nullable(),
  total_value: z.number().optional().nullable(),
  total_fees: z.number().optional().nullable(),
  percentage: z.number().optional().nullable(),
  customer_amount: z.number().optional().nullable(),
  is_active: z.boolean().optional(),
  collaborator_ids: z.array(z.number()).optional(),
  client_ids: z.array(z.number()).min(1, { message: 'Selecione pelo menos um cliente' }),
  print_contract: z.boolean().optional(),
});

export const CauseForm: React.FC = () => {
  const currentUser = useCurrentUser();
  const [editingId, setEditingId] = useState<number | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch, trigger, getValues } = useForm<CauseFormData>({
    resolver: zodResolver(causeSchema) as any,
    defaultValues: {
      number: '',
      process_date: new Date().toISOString().split('T')[0],
      description: '',
      court_id: 0,
      division_id: undefined,
      area_id: undefined,
      city_id: undefined,
      current_stage_id: undefined,
      current_status_id: undefined,
      outcome_id: undefined,
      total_value: 0,
      total_fees: 0,
      percentage: 20,
      customer_amount: 0,
      is_active: true,
      collaborator_ids: [],
      client_ids: [],
      print_contract: false,
    }
  });

  // Display state for monetary fields
  const [totalValueDisplay, setTotalValueDisplay] = useState('');
  const [customerAmountDisplay, setCustomerAmountDisplay] = useState('');

  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [courtPopoverOpen, setCourtPopoverOpen] = useState(false);

  const [historyEntity, setHistoryEntity] = useState<{ id: number; number: string } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const defaultsAppliedRef = React.useRef(false);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states synchronized with URL
  const searchTerm = searchParams.get('q') || '';

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const setSearchTerm = (val: string) => updateFilters({ q: val });

  const selectedCityId = watch('city_id');
  const selectedCourtId = watch('court_id');
  const selectedStageId = watch('current_stage_id');
  const customerAmount = watch('customer_amount');
  const percentage = watch('percentage');
  const totalFees = watch('total_fees');

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: areasService.getAll });
  const { data: stages = [] } = useQuery({ queryKey: ['stages'], queryFn: stagesService.getAll });
  const { data: status = [] } = useQuery({ queryKey: ['status'], queryFn: statusService.getAll });
  const { data: cities = [] } = useQuery({ queryKey: ['cities'], queryFn: cityService.getAll });
  const { data: outcomes = [] } = useQuery({ queryKey: ['outcomes'], queryFn: outcomesService.getAll });
  const { data: collaborators = [] } = useQuery({ queryKey: ['collaborators'], queryFn: usersService.getCollaborators });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: usersService.getClients });

  const selectedCity = cities.find((c: any) => c.id === Number(selectedCityId));
  const selectedUf = selectedCity?.uf;

  const { data: courts = [] } = useQuery({
    queryKey: ['courts', selectedUf],
    queryFn: () => courtsService.getAll({ state: selectedUf }),
    enabled: !!selectedUf
  });

  const filteredStatus = React.useMemo(() => {
    if (!selectedStageId) return status;
    return (status as any[]).filter(s => s.stage_id === Number(selectedStageId));
  }, [status, selectedStageId]);

  // 1. AUTO-POPULATE NEW PROCESS DEFAULTS (via is_default flag from DB)
  // Uses a ref to guarantee defaults are applied exactly once per mount/reset,
  // even when React Query returns cached data instantly.
  React.useEffect(() => {
    if (editingId) return;
    if (defaultsAppliedRef.current) return;
    if (stages.length === 0 || status.length === 0 || outcomes.length === 0) return;

    const defaultStage = (stages as any[]).find((s) => s.is_default === true);
    const defaultStatus = (status as any[]).find((s) => s.is_default === true);
    const defaultOutcome = (outcomes as any[]).find((o) => o.is_default === true);

    const stageId = defaultStage?.id || stages[0]?.id;
    const statusId = defaultStatus?.id;
    const outcomeId = defaultOutcome?.id || outcomes[0]?.id;

    if (stageId) setValue('current_stage_id', stageId, { shouldValidate: true, shouldDirty: false });
    if (statusId) setValue('current_status_id', statusId, { shouldValidate: true, shouldDirty: false });
    if (outcomeId) setValue('outcome_id', outcomeId, { shouldValidate: true, shouldDirty: false });

    defaultsAppliedRef.current = true;
  }, [stages, status, outcomes, editingId, setValue, resetKey]);

  const filteredCourts = courts as any[];

  // Fetch all divisions (independent of city/court)
  const { data: divisions = [], isLoading: isLoadingDivisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionsService.getAll(),
  });

  // Calculate fees automatically
  useEffect(() => {
    const fees = (Number(customerAmount) * Number(percentage)) / 100;
    setValue('total_fees', Number(fees.toFixed(2)));
  }, [customerAmount, percentage, setValue]);

  // Reset court and division when city changes
  useEffect(() => {
    if (!editingId && selectedCityId) {
      const currentCourt = (courts as any[])?.find(c => c.id === Number(selectedCourtId));
      if (currentCourt && currentCourt.state !== selectedUf) {
        setValue('court_id', filteredCourts.length === 1 ? filteredCourts[0].id : 0);
        setValue('division_id', undefined);
      } else if (!selectedCourtId && filteredCourts.length === 1) {
        setValue('court_id', filteredCourts[0].id);
      }
    }
  }, [selectedCityId, selectedUf, courts, filteredCourts, selectedCourtId, setValue, editingId]);

  const selectedDivisionId = watch('division_id');

  // Auto-select area based on division name using deterministic keyword mapping
  useEffect(() => {
    if (selectedDivisionId && !editingId) {
      const division = (divisions as any[]).find(d => d.id === Number(selectedDivisionId));
      if (division && division.name) {
        const areaId = getAreaIdByDivision(division.name);
        if (areaId) {
          setValue('area_id', areaId);
        }
      }
    }
  }, [selectedDivisionId, divisions, setValue, editingId]);



  // Handle hierarchy resets
  const handleCityChange = (val: number) => {
    setValue('city_id', val);
    setValue('court_id', 0 as any);
  };

  const handleCourtChange = (val: number) => {
    setValue('court_id', val);
    // Division is no longer reset when court changes
  };

  const [showDeleted, setShowDeleted] = useState(false);

  const { data: causes = [], isLoading: isLoadingCauses } = useQuery({
    queryKey: ['causes', showDeleted],
    queryFn: () => causesService.getAll({
      includeDeleted: showDeleted,
    }),
  });

  const filteredCauses = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') return causes;

    return (causes as Cause[]).filter((cause) => {
      const number = (cause.number || '').toLowerCase();
      const description = (cause.description || '').toLowerCase();
      const clients = (cause.cause_users || [])
        .filter(cu => cu.role_type_id === 1 || cu.role_type === 'client')
        .map(cu => cu.user?.name?.toLowerCase() || '')
        .join(' ');
      const lawyers = (cause.cause_users || [])
        .filter(cu => cu.role_type_id === 2 || cu.role_type === 'lawyer')
        .map(cu => cu.user?.name?.toLowerCase() || '')
        .join(' ');
      const court = (cause.court?.name || '').toLowerCase();
      const division = (cause.division?.name || '').toLowerCase();

      return number.includes(term) ||
        description.includes(term) ||
        clients.includes(term) ||
        lawyers.includes(term) ||
        court.includes(term) ||
        division.includes(term);
    });
  }, [causes, searchTerm]);


  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const result = editingId
        ? await causesService.update({ id: editingId, data })
        : await causesService.create(data);

      // Upload do contrato se existir arquivo
      if (contractFile && result?.id) {
        await causesService.uploadContractDoc(Number(result.id), contractFile);
      }

      return result;
    },
    onSuccess: () => {
      setSubmissionStatus(editingId ? 'Processo atualizado com sucesso!' : 'Processo cadastrado com sucesso!');
      setContractFile(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['causes'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message || 'Erro ao enviar formulário'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: causesService.delete,
    onSuccess: () => {
      setSubmissionStatus('Processo excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['causes'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  });

  const onSubmit = (data: CauseFormData) => {
    console.log('Submitting data - print_contract:', data.print_contract);
    setSubmissionStatus('Iniciando envio...');

    // Explicitly pick only the fields we want to send to the backend
    const sanitized: any = {
      number: data.number,
      process_date: data.process_date,
      description: data.description,
      court_id: Number(data.court_id),
      division_id: data.division_id ? Number(data.division_id) : null,
      area_id: data.area_id ? Number(data.area_id) : null,
      city_id: data.city_id ? Number(data.city_id) : null,
      current_stage_id: data.current_stage_id ? Number(data.current_stage_id) : null,
      current_status_id: data.current_status_id ? Number(data.current_status_id) : null,
      outcome_id: data.outcome_id ? Number(data.outcome_id) : null,
      total_value: Number(data.total_value) || 0,
      customer_amount: Number(data.customer_amount) || 0,
      total_fees: Number(data.total_fees) || 0,
      percentage: Number(data.percentage) || 0,
      is_active: data.is_active,
      print_contract: data.print_contract,
      involved_users: [
        ...(data.client_ids || []).map(id => ({
          user_id: Number(id),
          role_type_id: 1, // Cliente
          party_side_id: 1, // Polo Ativo
          is_primary: true
        })),
        ...(data.collaborator_ids || []).map(id => ({
          user_id: Number(id),
          role_type_id: 2, // Advogado
          party_side_id: 1, // Polo Ativo
          is_primary: false
        }))
      ]
    };

    // Ensure logged in user is related if not already included
    if (!editingId && currentUser?.id && !sanitized.involved_users.some((u: any) => u.user_id === Number(currentUser.id))) {
      sanitized.involved_users.push({
        user_id: Number(currentUser.id),
        role_type_id: 2, // Advogado/Colaborador
        party_side_id: 1,
        is_primary: false
      });
    }

    mutation.mutate(sanitized);
  };

  const handleEdit = (cause: Cause) => {
    setEditingId(cause.id);

    // Compute IDs directly from cause_users which we know is present (used in columns)
    const collaboratorIds = (cause.cause_users || [])
      .filter(cu => cu.role_type_id === 2 || cu.role_type === 'lawyer')
      .map(cu => Number(cu.user?.id));

    const clientIds = (cause.cause_users || [])
      .filter(cu => cu.role_type_id === 1 || cu.role_type === 'client')
      .map(cu => Number(cu.user?.id));

    // Use reset() to populate all fields at once - cleaner for react-hook-form
    reset({
      number: cause.number,
      process_date: cause.process_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      description: cause.description || '',
      city_id: cause.city_id,
      court_id: cause.court_id,
      division_id: cause.division_id,
      area_id: cause.area_id,
      current_stage_id: cause.current_stage_id || (cause.current_stage as any)?.id,
      current_status_id: cause.current_status_id || (cause.current_status as any)?.id,
      outcome_id: cause.outcome_id || (cause.outcome as any)?.id,
      total_value: Number(cause.total_value) || 0,
      percentage: Number(cause.percentage) || 20,
      customer_amount: Number(cause.customer_amount) || 0,
      total_fees: Number(cause.total_fees) || 0,
      is_active: cause.is_active,
      collaborator_ids: collaboratorIds,
      client_ids: clientIds,
      print_contract: cause.print_contract,
    });

    // Sync display states for monetary fields
    setTotalValueDisplay(formatBRL(cause.total_value));
    setCustomerAmountDisplay(formatBRL(cause.customer_amount));
    setSubmissionStatus(null);
    setContractFile(null);

    // Scroll to top of the form
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      deleteMutation.mutate(id as number);
    }
  };

  const handleShowHistory = (cause: Cause) => {
    setHistoryEntity({ id: cause.id, number: cause.number });
  };

  const resetForm = () => {
    setEditingId(null);
    defaultsAppliedRef.current = false;

    reset({
      number: '',
      process_date: new Date().toISOString().split('T')[0],
      description: '',
      court_id: 0,
      division_id: undefined,
      area_id: undefined,
      city_id: undefined,
      current_stage_id: undefined,
      current_status_id: undefined,
      outcome_id: undefined,
      total_value: 0,
      total_fees: 0,
      percentage: 20,
      customer_amount: 0,
      is_active: true,
      collaborator_ids: [],
      client_ids: [],
      print_contract: false,
    });
    setTotalValueDisplay('');
    setCustomerAmountDisplay('');
    setContractFile(null);
    setResetKey(prev => prev + 1);
  };


  const handleUploadContract = async (id: number, file: File) => {
    try {
      setSubmissionStatus('Enviando contrato…');
      await causesService.uploadContractDoc(id, file);
      setSubmissionStatus('Contrato enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['causes'] });
      setTimeout(() => setSubmissionStatus(null), 3000);
    } catch (error: any) {
      setSubmissionStatus(`Erro no upload: ${error?.response?.data?.message || error.message}`);
    }
  };



  const columns: Column<Cause>[] = [

    {
      header: 'Data',
      accessorKey: (item) => item.process_date ? new Date(item.process_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
      sortKey: 'created_at',
    },
    {
      header: 'Tribunal',
      accessorKey: (item) => item.court?.name || '-',
      sortKey: 'court_id',
    },
    {
      header: 'Vara/Divisão',
      accessorKey: (item) => item.division?.name || '-',
      sortKey: 'division_id',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Área',
      accessorKey: (item) => item.area?.name || '-',
      sortKey: 'area_id',
      className: 'hidden md:table-cell',
    },
    {
      header: 'Fase',
      accessorKey: (item) => item.current_stage?.name || '-',
      sortKey: 'current_stage_id',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Status',
      accessorKey: (item) => item.current_status?.name || '-',
      sortKey: 'current_status_id',
    },
    {
      header: 'Responsáveis',
      accessorKey: (item) => item.cause_users?.filter(cu => cu.role_type_id === 2 || cu.role_type === 'lawyer').map(cu => cu.user?.name).filter(Boolean).join(', ') || '-',
      className: 'hidden xl:table-cell',
    },
    {
      header: 'Contrato',
      accessorKey: (cause: Cause) => (
        <div className="flex items-center justify-center gap-1">
          {cause.contract_doc_path ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-primary hover:text-primary/80"
              aria-label="Visualizar Contrato"
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${cause.contract_doc_path}`, '_blank')}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground italic px-2">Pendente</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-accent hover:text-accent/80"
            aria-label="Upload de Contrato Assinado"
            onClick={() => document.getElementById(`upload-contract-${cause.id}`)?.click()}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
          </Button>
          <input
            type="file"
            id={`upload-contract-${cause.id}`}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadContract(cause.id, file);
              e.target.value = '';
            }}
          />
        </div>
      ),
      disableSort: true,
      className: 'text-center w-[120px]',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Processos e Causas"
        description="Gerencie o portfólio jurídico, acompanhe prazos, valores e o andamento processual completo."
        icon={Briefcase}
      />

      <Card ref={formCardRef} className={`w-full ${glassCardCls}`}>
        <CardHeader className={glassCardHeaderCls}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-xl transition-all shadow-inner",
              editingId ? "bg-amber-500/20 text-amber-500" : "bg-primary/10 text-primary"
            )} aria-hidden="true">
              {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className={labelCls}>{editingId ? 'Editando' : 'Cadastro'}</span>
              <CardTitle className="text-xl font-bold tracking-tight">
                {editingId ? 'Editar Processo' : 'Novo Processo'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* SEÇÃO DE CLIENTES - PESQUISÁVEL E NO TOPO */}
            <div className="mb-5 pb-5 border-b border-white/10">
              <Label className={labelCls + " mb-3 block"}>Clientes do Processo <span className="text-destructive">*</span></Label>
              <Controller
                name="client_ids"
                control={control}
                render={({ field }) => {
                  const selectedIds = field.value || [];
                  const selectedNames = clients
                    .filter(c => selectedIds.includes(Number(c.id)))
                    .map(c => c.name);

                  return (
                    <div className="flex flex-col gap-2">
                      <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                            disabled={!!editingId}
                          >
                            {selectedNames.length > 0
                              ? `${selectedNames.length} cliente(s) selecionado(s)`
                              : "Pesquisar e selecionar clientes..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Digite o nome do cliente..." />
                            <CommandList>
                              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {clients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                      const id = Number(client.id);
                                      if (selectedIds.includes(id)) {
                                        field.onChange(selectedIds.filter(i => i !== id));
                                      } else {
                                        field.onChange([...selectedIds, id]);
                                      }
                                      setClientPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedIds.includes(Number(client.id)) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {client.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Exibição dos clientes selecionados em Badges (como tags) */}
                      {selectedNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {clients
                            .filter(c => selectedIds.includes(Number(c.id)))
                            .map(client => (
                              <div key={client.id} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                                <span>{client.name}</span>
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  aria-label="Remover cliente"
                                  onClick={() => field.onChange(selectedIds.filter(id => id !== Number(client.id)))}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                      {errors.client_ids && (
                        <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.client_ids.message}</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number" className={labelCls}>Número do Processo <span className="text-destructive">*</span></Label>
                <Input
                  id="number"
                  {...register('number', { required: "Obrigatório" })}
                  placeholder="0000000-00.0000.0.00.0000"
                  className={inputCls}
                  autoComplete="off"
                  onChange={(e) => {
                    const formatted = maskProcessNumber(e.target.value);
                    setValue('number', formatted, { shouldValidate: false });
                  }}
                />
                {errors.number && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="process_date" className={labelCls}>Data do Processo <span className="text-destructive">*</span></Label>
                <Input type="date" id="process_date" {...register('process_date', { required: "Obrigatório" })} className={inputCls} autoComplete="off" />
                {errors.process_date && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.process_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city_id" className={labelCls}>Cidade <span className="text-destructive">*</span></Label>
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field }) => (
                    <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal !h-11 rounded-xl !border-white/10 !bg-background/60",
                            selectCls,
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? (() => {
                                const city = cities.find((c) => c.id === field.value);
                                return city ? `${city.name} - ${city.uf}` : "Selecione a Cidade";
                              })()
                            : "Selecione a Cidade"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Pesquisar cidade..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                            <CommandGroup>
                              {cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={`${city.name} ${city.uf}`}
                                  onSelect={() => {
                                    handleCityChange(city.id);
                                    field.onChange(city.id);
                                    setCityPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === city.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {city.name} - {city.uf}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.city_id && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court_id" className={labelCls}>Tribunal <span className="text-destructive">*</span></Label>
                <Controller
                  name="court_id"
                  control={control}
                  rules={{ required: "Obrigatório" }}
                  render={({ field }) => (
                    <Popover open={courtPopoverOpen} onOpenChange={setCourtPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedCityId}
                          className={cn(
                            "w-full justify-between font-normal !h-11 rounded-xl !border-white/10 !bg-background/60",
                            selectCls,
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? courts.find((c) => c.id === field.value)?.name
                            : (selectedCityId ? "Selecione o Tribunal" : "Selecione a Cidade primeiro")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Pesquisar tribunal..." />
                          <CommandList>
                            <CommandEmpty>Nenhum tribunal encontrado.</CommandEmpty>
                            <CommandGroup>
                              {courts.map((court) => (
                                <CommandItem
                                  key={court.id}
                                  value={court.name}
                                  onSelect={() => {
                                    handleCourtChange(court.id);
                                    field.onChange(court.id);
                                    setCourtPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === court.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {court.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.court_id && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.court_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="division_id" className={labelCls}>Vara <span className="text-destructive">*</span></Label>
                <Controller
                  name="division_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger className={cn(selectCls, "cursor-pointer !h-11 rounded-xl !border-white/10 !bg-background/60")}>
                        <SelectValue placeholder={
                          isLoadingDivisions
                            ? "Carregando varas…"
                            : "Selecione a Vara"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDivisions ? (
                          <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando…
                          </div>
                        ) : (
                          divisions?.map(div => (
                            <SelectItem key={div.id} value={div.id.toString()}>{div.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.division_id && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.division_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_id" className={labelCls}>Área <span className="text-destructive">*</span></Label>
                <Controller
                  name="area_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                      <SelectTrigger className={cn(selectCls, "cursor-pointer !h-11 rounded-xl !border-white/10 !bg-background/60")}>
                        <SelectValue placeholder="Selecione a Área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas?.map(area => (
                          <SelectItem key={area.id} value={area.id.toString()}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.area_id && <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.area_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_stage_id" className={labelCls}>Fase</Label>
                <Controller
                  name="current_stage_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => {
                        field.onChange(Number(val));
                        // Reset status when stage changes
                        setValue('current_status_id', undefined);
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger className={cn(selectCls, "cursor-pointer !h-11 rounded-xl !border-white/10 !bg-background/60")}>
                        <SelectValue placeholder="Selecione a Fase" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages?.map(stage => (
                          <SelectItem key={stage.id} value={stage.id.toString()}>{stage.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_status_id" className={labelCls}>Status</Label>
                <Controller
                  name="current_status_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={selectedStageId?.toString()}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                      disabled={!selectedStageId}
                    >
                      <SelectTrigger className={cn(selectCls, "cursor-pointer !h-11 rounded-xl !border-white/10 !bg-background/60")}>
                        <SelectValue placeholder={selectedStageId ? "Selecione o Status" : "Selecione a Fase primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStatus?.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome_id" className={labelCls}>Resultado</Label>
                <Controller
                  name="outcome_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                      <SelectTrigger className={cn(selectCls, "cursor-pointer !h-11 rounded-xl !border-white/10 !bg-background/60")}>
                        <SelectValue placeholder="Resultado Final" />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomes?.map(outcome => (
                          <SelectItem key={outcome.id} value={outcome.id.toString()}>{outcome.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percentage" className={labelCls}>Porcentagem (%)</Label>
                <Input type="number" step="0.5" id="percentage" {...register('percentage', { valueAsNumber: true })} className={inputCls} autoComplete="off" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_value" className={labelCls}>Valor da Causa</Label>
                <Controller
                  name="total_value"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="total_value"
                      placeholder="R$ 0,00…"
                      className={inputCls}
                      value={totalValueDisplay}
                      onChange={(e) => {
                        setTotalValueDisplay(e.target.value);
                        field.onChange(parseBRL(e.target.value));
                      }}
                      onBlur={() => {
                        setTotalValueDisplay(formatBRL(field.value));
                      }}
                      onFocus={() => {
                        setTotalValueDisplay(
                          field.value ? field.value.toString().replace('.', ',') : ''
                        );
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_amount" className={labelCls}>Valor do Cliente</Label>
                <Controller
                  name="customer_amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="customer_amount"
                      placeholder="R$ 0,00…"
                      className={inputCls}
                      value={customerAmountDisplay}
                      onChange={(e) => {
                        setCustomerAmountDisplay(e.target.value);
                        field.onChange(parseBRL(e.target.value));
                      }}
                      onBlur={() => {
                        setCustomerAmountDisplay(formatBRL(field.value));
                      }}
                      onFocus={() => {
                        setCustomerAmountDisplay(
                          field.value ? field.value.toString().replace('.', ',') : ''
                        );
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_fees" className={labelCls}>Honorários</Label>
                <Input
                  id="total_fees"
                  readOnly
                  className={`${inputCls} bg-muted cursor-not-allowed`}
                  value={formatBRL(totalFees)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={labelCls}>Descrição / Objeto</Label>
              <Textarea id="description" {...register('description')} placeholder="Resumo do processo…" className="border-border/50 focus:ring-primary shadow-inner resize-none bg-background/40" />
            </div>

            <div className="space-y-2">
              <Label className={labelCls + " mb-2 block"}>Colaboradores Responsáveis</Label>
              <div className="p-3 rounded-xl bg-primary/5 border border-border/50">
                <Controller
                  name="collaborator_ids"
                  control={control}
                  render={({ field }) => {
                    const selectedIds = field.value || [];
                    const selectedCollaborators = collaborators?.filter(c => selectedIds.includes(Number(c.id))) || [];
                    
                    const visibleCollaborators = !editingId && currentUser
                      ? collaborators?.filter(c => Number(c.id) !== Number(currentUser.id))
                      : collaborators;

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                          {visibleCollaborators?.map(collab => {
                            const isChecked = selectedIds.includes(Number(collab.id));
                            return (
                              <div key={collab.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`collab-${collab.id}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...selectedIds, Number(collab.id)]);
                                    } else {
                                      field.onChange(selectedIds.filter(id => id !== Number(collab.id)));
                                    }
                                  }}
                                />
                                <Label htmlFor={`collab-${collab.id}`} className="text-xs font-bold cursor-pointer truncate">
                                  {collab.name}
                                </Label>
                              </div>
                            );
                          })}
                        </div>

                        {/* Badges dos colaboradores selecionados */}
                        {selectedCollaborators.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10">
                            {selectedCollaborators.map(collab => (
                              <Badge key={collab.id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                                {collab.name}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  aria-label="Remover colaborador"
                                  onClick={() => field.onChange(selectedIds.filter(id => id !== Number(collab.id)))}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}

                        {(!collaborators || collaborators.length === 0) && (
                          <p className="text-sm text-muted-foreground italic">Nenhum colaborador encontrado.</p>
                        )}
                      </>
                    );
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                O primeiro colaborador selecionado será o responsável principal.
              </p>
              {errors.collaborator_ids && (
                <p className="text-[10px] font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.collaborator_ids.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 border rounded-xl bg-accent/5 border-accent/20">
                  <Controller
                    name="print_contract"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="print_contract"
                        checked={field.value}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            const essentialFields = [
                              'number', 'process_date', 'city_id', 'court_id',
                              'division_id', 'area_id', 'client_ids', 'collaborator_ids'
                            ] as const;
                            const isValid = await trigger(essentialFields as any);
                            if (!isValid) {
                              toast.error("Preencha todos os campos obrigatórios antes de gerar o contrato.");
                              return;
                            }

                            // Gather data for the contract
                            const formValues = getValues();
                            const selectedClientIds = formValues.client_ids || [];
                            const contractClients = (clients as any[])
                              .filter(c => selectedClientIds.includes(c.id))
                              .map(c => ({ name: c.name, document: c.document }));

                            const selectedCourt = (courts as any[]).find(c => c.id === Number(formValues.court_id));
                            const selectedDivision = (divisions as any[]).find(d => d.id === Number(formValues.division_id));

                            const contractData = {
                              number: formValues.number,
                              description: formValues.description,
                              percentage: formValues.percentage,
                              clients: contractClients,
                              court: `${selectedCourt?.name || ''} - ${selectedDivision?.name || ''}`.trim() || 'Orgão Competente'
                            };

                            // Generate and open print dialog
                            printComponent(<ServiceContract cause={contractData} />, "Contrato de Honorários");
                          }
                          field.onChange(checked);
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="print_contract" className="text-sm font-semibold cursor-pointer">
                    Gerar Contrato de Prestação de Serviços (Impressão)
                  </Label>
                </div>

                {watch('print_contract') && (
                  <div className="space-y-3 p-4 border rounded-xl bg-card/50 border-white/10">
                    <Label className={labelCls}>Upload do Contrato Assinado (Opcional)</Label>
                    <div className="relative group">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setContractFile(file);
                        }}
                      />
                      <div className="rounded-xl border-dashed border-2 p-4 flex items-center justify-center gap-3 bg-background/20 group-hover:bg-primary/5 transition-all text-muted-foreground border-white/10">
                        <Upload className="w-4 h-4 text-primary/60" aria-hidden="true" />
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[200px]">
                          {contractFile?.name || 'Selecionar Contrato Digitalizado'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Salvando…</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                      {editingId ? 'Atualizar Processo' : 'Cadastrar Processo'}
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" className="h-11 font-bold text-xs uppercase tracking-widest rounded-xl border border-border/50 hover:bg-accent/10" onClick={() => resetForm()}>Cancelar</Button>
                )}
              </div>
            </div>
          </form>
          {submissionStatus && <p className="mt-4 text-center font-medium">{submissionStatus}</p>}
        </CardContent>
      </Card>

      <div className="min-h-[400px] flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por número, cliente ou descrição…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border/40 bg-background/40 backdrop-blur-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-3 px-4 h-11 rounded-xl bg-card/40 border border-white/10 shadow-sm shrink-0">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
              aria-label="Mostrar processos inativos"
            />
            <Label htmlFor="show-deleted" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer select-none whitespace-nowrap">
              Mostrar inativos
            </Label>
          </div>
        </div>
        <DataTable
          title="Lista de Processos"
          data={filteredCauses}
          columns={columns}
          isLoading={isLoadingCauses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHistory={handleShowHistory}
          entityName="Processos"
          paginated
          defaultPageSize={50}
          sortable
          defaultSort={{ key: 'created_at', direction: 'desc' }}
        />
      </div>

      <AuditHistory
        key={`audit-cause-${historyEntity?.id}`}
        isOpen={!!historyEntity}
        onClose={() => setHistoryEntity(null)}
        entityType="cause"
        entityId={historyEntity?.id || 0}
        entityName={historyEntity?.number}
      />
    </div>
  );
};
