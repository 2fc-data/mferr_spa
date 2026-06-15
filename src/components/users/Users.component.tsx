import { useState, useMemo, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormField
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService, type User } from '@/services/users.service';
import { profilesService } from '@/services/profiles.service';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { DashboardPageHeader } from '../layout/DashboardPageHeader';
import {
  Users as UsersIcon,
  Loader2,
  Pencil,
  UserPlus,
  Search,
  MapPin,
  Save,
  Trash2,
  Clock,
  Shield,
  ShieldCheck,
  Upload,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { printComponent } from '@/lib/printUtils';
import { LGPDPrivacyTerm } from '../documents/LGPDPrivacyTerm';
import { LGPDMinorPrivacyTerm } from '../documents/LGPDMinorPrivacyTerm';
import { DataTable } from '@/components/ui/DataTable';
import { AuditHistory } from '../audit/AuditHistory';
import { AddressForm } from './AddressForm';
import { addressesService } from '@/services/addresses.service';
import {
  calculateAge,
  maskDocument,
  maskPhone,
  maskRG,
  maskPIS,
  maskCTPS,
  capitalize,
  cn
} from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useUserColumns } from './useUserColumns';
import { MinorResponsibleSection } from './MinorResponsibleSection';
import {
  glassCardCls,
  glassCardHeaderCls,
  labelCls,
  inputCls,
  FormSection,
  CheckboxRow
} from '@/components/ui/FormField';

const generateUniqueUsername = (name: string, usersList: any[], currentId?: number | string | null): string => {
  if (!name) return '';
  const parts = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, '')
    .trim().split(/\s+/);
  
  if (parts.length === 0) return '';
  
  let baseUsername = parts[0];
  if (parts.length > 1) {
    baseUsername = `${parts[0]}.${parts[parts.length - 1]}`;
  }

  let username = baseUsername;
  let counter = 1;
  const existingUsernames = new Set(
    usersList
      .filter((u) => u.id !== currentId)
      .map(u => u.username)
  );
  
  while (existingUsernames.has(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  return username;
};

const userSchema = z.object({
  name: z.string().min(1, { message: 'O campo Nome é obrigatório' }),
  username: z.string().optional().nullable(),
  document: z.string().min(1, { message: 'O campo CPF/CNPJ é obrigatório' }).max(18, { message: 'CPF ou CNPJ inválido' }).trim(),
  email: z.string().email({ message: 'E-mail inválido' }).min(1, { message: 'O campo E-mail é obrigatório' }),
  password: z.string().optional().nullable(),
  phone1: z.string().min(1, { message: 'O campo Telefone 1 é obrigatório' }),
  phone2: z.string().optional().nullable(),
  is_active: z.boolean(),
  profile_ids: z.array(z.number()).min(1, { message: 'Selecione pelo menos um perfil' }),
  address: z.object({
    id: z.union([z.number(), z.string()]).optional(),
    postcode: z.string().optional().nullable().or(z.literal('')),
    city: z.string().optional().nullable().or(z.literal('')),
    state: z.string().optional().nullable().or(z.literal('')),
    district: z.string().optional().nullable().or(z.literal('')),
    street: z.string().optional().nullable().or(z.literal('')),
    number: z.string().optional().nullable().or(z.literal('')),
    complement: z.string().optional().nullable().or(z.literal('')),
    address_type_id: z.number().optional().nullable(),
  }),
  nationality: z.string().min(1, { message: 'Nacionalidade é obrigatória' }).max(50),
  birth_state: z.string().min(1, { message: 'Naturalidade (UF) é obrigatória' }).max(2),
  profession: z.string().max(50).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  mother_name: z.string().min(1, { message: 'Nome da mãe é obrigatório' }).max(100),
  father_name: z.string().max(100).optional().nullable(),
  rg: z.string().max(14, { message: 'O RG deve ter no máximo 14 caracteres' }).optional().nullable(),
  pis: z.string().max(15, { message: 'O PIS deve ter no máximo 15 caracteres' }).optional().nullable(),
  ctps: z.string().max(20, { message: 'A CTPS deve ter no máximo 20 caracteres' }).optional().nullable(),
  responsible_id: z.number().optional().nullable(),
  responsible_relation: z.string().optional().nullable(),
  is_minor: z.boolean().optional(),
  lgpd_date: z.string().optional().nullable(),
  lgpd_doc_path: z.string().optional().nullable(),
  lgpd_minor_doc_path: z.string().optional().nullable(),
  different_address: z.boolean().optional(),
  resp_name: z.string().optional().nullable(),
  resp_document: z.string().optional().nullable(),
  resp_phone: z.string().optional().nullable(),
  print_lgpd_consent: z.boolean().default(false),
  print_lgpd_minor_consent: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.is_minor && !data.print_lgpd_minor_consent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O termo de consentimento do menor é obrigatório",
      path: ["print_lgpd_minor_consent"],
    });
  }
  if (!data.is_minor && !data.print_lgpd_consent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O termo de consentimento é obrigatório",
      path: ["print_lgpd_consent"],
    });
  }
});

type UserFormData = z.infer<typeof userSchema>;

export const Users = () => {
  const [lgpdFile, setLgpdFile] = useState<File | null>(null);
  const [lgpdMinorFile, setLgpdMinorFile] = useState<File | null>(null);
  const [lgpdTermDownloaded, setLgpdTermDownloaded] = useState(false);

  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.profiles?.some((p: any) => p.id === 1);
  const isManager = currentUser?.profiles?.some((p: any) => p.id === 2);
  const formCardRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [historyEntity, setHistoryEntity] = useState<User | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [responsibleSearch, setResponsibleSearch] = useState('');
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [isCreatingNewResponsible, setIsCreatingNewResponsible] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', showDeleted],
    queryFn: showDeleted ? usersService.getAllIncludingDeleted : usersService.getAll,
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: profilesService.getAll,
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: '', username: '', email: '', document: '', password: '', phone1: '', phone2: '',
      is_active: true, profile_ids: [],
      address: { postcode: '', city: '', state: '', district: '', street: '', number: '', complement: '', address_type_id: 1 },
      nationality: 'Brasileira', birth_state: 'MG', profession: '', birth_date: '', mother_name: '', father_name: '',
      rg: '', pis: '', ctps: '', responsible_id: null, responsible_relation: '',
      is_minor: false, lgpd_date: new Date().toISOString().split('T')[0],
      lgpd_doc_path: null, lgpd_minor_doc_path: null, different_address: false,
      resp_name: '', resp_document: '', resp_phone: '',
      print_lgpd_consent: false, print_lgpd_minor_consent: false,
    },
  });

  const { watch, setValue } = form;
  const birthDate = watch('birth_date');
  const isMinor = useMemo(() => {
    if (!birthDate) return false;
    return calculateAge(birthDate) < 18;
  }, [birthDate]);

  useEffect(() => {
    setValue('is_minor', isMinor);
    if (!isMinor) {
      setValue('responsible_id', undefined);
      setValue('responsible_relation', '');
    }
  }, [isMinor, setValue]);

  const filteredResponsibles = useMemo(() => {
    if (!responsibleSearch) return [];
    const term = responsibleSearch.toLowerCase();
    return users.filter((u: User) => u.name.toLowerCase().includes(term) || (u.document && u.document.includes(term))).slice(0, 5);
  }, [users, responsibleSearch]);

  const handleEdit = useCallback(async (user: User) => {
    if (isManager && !isAdmin && user.profiles?.some((p: any) => p.id === 1 || p.id === 2)) {
      toast.error("Gerentes não podem modificar Administradores ou outros Gerentes.");
      return;
    }
    setEditingId(user.id || null);
    try {
      const fullUser = await usersService.getById(user.id);
      let addr = fullUser.addresses?.[0];

      // Fallback: if no address found in the user object, try fetching explicitly
      if (!addr && user.id) {
        try {
          const userAddrs = await addressesService.getByUser(user.id);
          if (userAddrs && userAddrs.length > 0) {
            addr = userAddrs[0];
          }
        } catch (err) {
          console.error("Erro ao buscar endereços separadamente:", err);
        }
      }

      const pivot = (addr as any)?.UserAddress || (addr as any)?.user_address || {};

      form.reset({
        ...fullUser,
        password: '',
        profile_ids: fullUser.profiles?.map(p => p.id as number) || [],
        address: addr ? {
          ...addr,
          id: addr.id,
          postcode: addr.postcode || '',
          city: addr.city || '',
          state: addr.state || '',
          district: addr.district || '',
          street: addr.street || '',
          number: addr.number || '',
          complement: addr.complement || '',
          address_type_id: pivot.address_type_id || (addr as any).address_type_id || (addr as any).address_type?.id || 1
        } : { address_type_id: 1 },
        different_address: !!addr
      });
    } catch (e) {
      form.reset({ ...user, profile_ids: user.profiles?.map(p => p.id as number) || [] });
    }
    if (user.responsible_id) {
      const resp = users.find((u: User) => Number(u.id) === Number(user.responsible_id));
      if (resp) setResponsibleSearch(resp.name);
    } else setResponsibleSearch('');
    setLgpdTermDownloaded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [form, users, isManager, isAdmin]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    form.reset({ name: '', username: '', email: '', document: '', phone1: '', is_active: true, profile_ids: [], nationality: 'Brasileira', birth_state: 'MG' });
    setResponsibleSearch('');
    setIsCreatingNewResponsible(false);
    setLgpdTermDownloaded(false);
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let finalResponsibleId = data.responsible_id;
      if (isMinor && isCreatingNewResponsible && data.resp_name && data.resp_document) {
        const cleanDoc = data.resp_document.replace(/\D/g, '');
        const existingResp = users.find((u: User) => (u.document || '').replace(/\D/g, '') === cleanDoc);

        if (existingResp) {
          finalResponsibleId = Number(existingResp.id);
        } else {
          const newResp = await usersService.create({
            name: data.resp_name,
            document: data.resp_document,
            phone1: data.resp_phone,
            username: `resp_${cleanDoc}`,
            email: `${cleanDoc}@sistema.com`,
            profile_ids: [4],
            is_active: true
          });
          finalResponsibleId = Number(newResp.id);
        }
      }
      const { address, resp_name, resp_document, resp_phone, ...userData } = data;
      // Remove empty password (class-validator rejects '' against @MinLength(6))
      if (!userData.password) delete userData.password;
      const res = editingId
        ? await usersService.update(editingId as number, { ...userData, responsible_id: finalResponsibleId })
        : await usersService.create({ ...userData, responsible_id: finalResponsibleId, lgpd_date: new Date().toISOString().split('T')[0] });
      if (address && res?.id && (!isMinor || data.different_address)) {
        const mandatoryFields = ['postcode', 'city', 'state', 'district', 'street', 'number'];
        const isPartiallyFilled = mandatoryFields.some(f => !!String(address[f as keyof typeof address] || '').trim());
        const isCompletelyFilled = mandatoryFields.every(f => !!String(address[f as keyof typeof address] || '').trim());

        if (isPartiallyFilled) {
          if (!isCompletelyFilled) {
            toast.error("Para salvar o endereço, preencha todos os campos obrigatórios (CEP, Cidade, UF, Bairro, Logradouro e Número).");
          } else {
            const addrPayload: any = {
              user_id: Number(res.id),
              address_type_id: address.address_type_id || 1,
              is_primary: address.is_primary ?? true
            };

            const fields = [...mandatoryFields, 'complement'];
            fields.forEach(f => {
              const val = String(address[f as keyof typeof address] || '').trim();
              if (val) addrPayload[f] = val;
            });

            if (editingId && address.id) {
              await addressesService.update(Number(address.id), addrPayload);
            } else {
              await addressesService.create(addrPayload);
            }
          }
        }
      }
      const userId = Number(res.id);

      // Upload de documentos LGPD se houver arquivos selecionados
      if (lgpdFile) {
        await usersService.uploadLgpdDoc(userId, lgpdFile);
        // Sincronizar campo print_lgpd_consent para 1 conforme solicitado
        await usersService.update(userId, { print_lgpd_consent: true });
      }

      if (lgpdMinorFile) {
        await usersService.uploadLgpdMinorDoc(userId, lgpdMinorFile);
        // Sincronizar campo print_lgpd_minor_consent para 1 conforme solicitado
        await usersService.update(userId, { print_lgpd_minor_consent: true });
      }

      return res;
    },
    onSuccess: () => {
      toast.success(editingId ? 'Usuário atualizado!' : 'Usuário criado!');

      // Limpar estados de arquivo
      setLgpdFile(null);
      setLgpdMinorFile(null);

      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || err.message || 'Erro ao salvar usuário.';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  });

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Excluir usuário?')) return;
    try {
      await usersService.delete(id);
      toast.success('Excluído!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { toast.error('Erro ao excluir'); }
  }, [queryClient]);

  const handleRestore = useCallback(async (id: number) => {
    if (!window.confirm('Restaurar este usuário?')) return;
    try {
      await usersService.restore(id);
      toast.success('Usuário restaurado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao restaurar usuário.');
    }
  }, [queryClient]);

  const baseColumns = useUserColumns();
  const columns = useMemo<any[]>(() => [
    ...baseColumns,
    ...(showDeleted ? [{
      header: 'Status', accessorKey: (user: any) => (
        user.deleted ? (
          <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">Inativo</Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>
        )
      ), disableSort: true, className: 'w-[80px]'
    }] : []),
    {
      header: 'Ações', accessorKey: (user: any) => (
        <div className="flex items-center gap-1">
          {user.deleted ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={() => handleRestore(user.id as number)} title="Restaurar" aria-label="Restaurar usuário"><RotateCcw className="w-4 h-4" /></Button>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(user)} title="Editar" aria-label="Editar usuário"><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(user.id as number)} title="Excluir" aria-label="Excluir usuário"><Trash2 className="w-4 h-4" /></Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryEntity(user)} title="Histórico" aria-label="Ver histórico do usuário"><Clock className="w-4 h-4" /></Button>
        </div>
      ), disableSort: true, className: 'text-right w-[140px]'
    }
  ], [baseColumns, handleEdit, handleDelete, handleRestore, showDeleted]);

  const filteredUsers = useMemo(() => {
    const s = deferredSearchTerm.toLowerCase();
    return users.filter((u: any) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.document && u.document.includes(s)));
  }, [users, deferredSearchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader title="Gestão de Usuários" icon={UsersIcon} />
      <Card ref={formCardRef} className={`w-full ${glassCardCls}`}>
        <CardHeader className={glassCardHeaderCls}>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-[10px] font-black tabular-nums bg-primary/10 text-primary border border-primary/20 rounded-xl px-2.5 py-1">
              {editingId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </Badge>
            <div className="flex flex-col">
              <span className={labelCls}>{editingId ? 'Editando' : 'Cadastro'}</span>
              <CardTitle className="text-xl font-bold tracking-tight">
                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(
            v => mutation.mutate(v),
            (errors) => {
              console.error('Form Validation Errors:', errors);
              toast.error("Existem campos obrigatórios não preenchidos ou inválidos.");
            }
          )}>
            <CardContent className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField name="name" render={({ field }) => (
                  <FormSection label="Nome Completo" required error={form.formState.errors.name?.message}>
                    <Input
                      placeholder="Nome completo…"
                      autoComplete="name"
                      value={field.value || ''}
                      onChange={e => field.onChange(capitalize(e.target.value))}
                      onBlur={() => {
                        form.trigger('name');
                        if (!editingId) {
                          const generated = generateUniqueUsername(field.value, users, editingId);
                          form.setValue('username', generated, { shouldValidate: true });
                        }
                      }}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="username" render={({ field }) => (
                  <FormSection label="Usuário (Login)" error={form.formState.errors.username?.message}>
                    <Input
                      placeholder="usuario_login…"
                      autoComplete="username"
                      value={field.value || ''}
                      readOnly={true}
                      className={`${inputCls} bg-muted cursor-not-allowed`}
                    />
                  </FormSection>
                )} />
                <FormField name="document" render={({ field }) => (
                  <FormSection label="CPF / CNPJ" required error={form.formState.errors.document?.message}>
                    <Input
                      placeholder="000.000.000-00…"
                      autoComplete="off"
                      inputMode="numeric"
                      {...field}
                      onChange={e => field.onChange(maskDocument(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="email" render={({ field }) => (
                  <FormSection label="E-mail" required error={form.formState.errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com…"
                      autoComplete="email"
                      spellCheck={false}
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value.toLowerCase())}
                      onBlur={() => form.trigger('email')}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="password" render={({ field }) => (
                  <FormSection label={editingId ? "Nova Senha (Opcional)" : "Senha de Acesso"} error={form.formState.errors.password?.message}>
                    <Input
                      type="password"
                      placeholder="******"
                      autoComplete="new-password"
                      value={field.value || ''}
                      onChange={field.onChange}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <FormField name="phone1" render={({ field }) => (
                  <FormSection label="Telefone 1" required error={form.formState.errors.phone1?.message}>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000…"
                      autoComplete="tel"
                      inputMode="tel"
                      {...field}
                      onChange={e => field.onChange(maskPhone(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="phone2" render={({ field }) => (
                  <FormSection label="Telefone 2" error={form.formState.errors.phone2?.message}>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000…"
                      autoComplete="tel"
                      inputMode="tel"
                      value={field.value || ''}
                      onChange={e => field.onChange(maskPhone(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="birth_date" render={({ field }) => (
                  <FormSection label="Data de Nascimento" required error={form.formState.errors.birth_date?.message}>
                    <Input
                      type="date"
                      autoComplete="bday"
                      value={field.value || ''}
                      onChange={field.onChange}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="nationality" render={({ field }) => (
                  <FormSection label="Nacionalidade" required error={form.formState.errors.nationality?.message}>
                    <Input
                      autoComplete="off"
                      value={field.value || ''}
                      onChange={e => field.onChange(capitalize(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormField name="birth_state" render={({ field }) => (
                  <FormSection label="UF Nascimento" required error={form.formState.errors.birth_state?.message}>
                    <Input
                      placeholder="Ex: MG"
                      maxLength={2}
                      {...field}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="profession" render={({ field }) => (
                  <FormSection label="Profissão" error={form.formState.errors.profession?.message}>
                    <Input
                      placeholder="Ex: Advogado, Autônomo…"
                      value={field.value || ''}
                      onChange={e => field.onChange(capitalize(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="mother_name" render={({ field }) => (
                  <FormSection label="Nome da Mãe" required error={form.formState.errors.mother_name?.message}>
                    <Input
                      placeholder="Nome completo da mãe…"
                      value={field.value || ''}
                      onChange={e => field.onChange(capitalize(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <FormField name="father_name" render={({ field }) => (
                  <FormSection label="Nome do Pai" error={form.formState.errors.father_name?.message}>
                    <Input
                      placeholder="Nome completo do pai (opcional)…"
                      value={field.value || ''}
                      onChange={e => field.onChange(capitalize(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="rg" render={({ field }) => (
                  <FormSection label="RG" error={form.formState.errors.rg?.message}>
                    <Input
                      placeholder="00.000.000-0"
                      value={field.value || ''}
                      onChange={e => field.onChange(maskRG(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="pis" render={({ field }) => (
                  <FormSection label="PIS/PASEP" error={form.formState.errors.pis?.message}>
                    <Input
                      placeholder="000.00000.00-0"
                      value={field.value || ''}
                      onChange={e => field.onChange(maskPIS(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
                <FormField name="ctps" render={({ field }) => (
                  <FormSection label="CTPS" error={form.formState.errors.ctps?.message}>
                    <Input
                      placeholder="0000000/000-00"
                      value={field.value || ''}
                      onChange={e => field.onChange(maskCTPS(e.target.value))}
                      className={inputCls}
                    />
                  </FormSection>
                )} />
              </div>
              {isMinor && (
                <MinorResponsibleSection
                  form={form}
                  responsibleSearch={responsibleSearch}
                  setResponsibleSearch={setResponsibleSearch}
                  showResponsibleDropdown={showResponsibleDropdown}
                  setShowResponsibleDropdown={setShowResponsibleDropdown}
                  filteredResponsibles={filteredResponsibles}
                />
              )}
              <div className="space-y-4 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className={cn(labelCls, "after:content-['*'] after:ml-0.5 after:text-destructive")}>Endereço</span>
                </div>
                <AddressForm />
              </div>
              {(isAdmin || isManager) && (
                <div className="space-y-4 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span className={cn(labelCls, "after:content-['*'] after:ml-0.5 after:text-destructive")}>Perfil de Acesso</span>
                  </div>
                  {form.formState.errors.profile_ids && (
                    <p className="text-[10px] font-semibold text-destructive flex items-center gap-1">
                      {form.formState.errors.profile_ids.message}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-between gap-2">
                    {allProfiles.filter((p: any) => p.is_active).map((profile: any) => {
                      const selectedIds = form.watch('profile_ids') || [];
                      const isChecked = selectedIds.includes(profile.id);
                      return (
                        <div key={profile.id} className="flex-shrink-0">
                          <CheckboxRow
                            id={`profile-${profile.id}`}
                            label={profile.name}
                            checked={isChecked}
                            onCheckedChange={() => {
                              const current = form.getValues('profile_ids') || [];
                              if (isChecked) {
                                form.setValue('profile_ids', current.filter((id: number) => id !== profile.id), { shouldValidate: true });
                              } else {
                                form.setValue('profile_ids', [...current, profile.id], { shouldValidate: true });
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                    {allProfiles.filter((p: any) => p.is_active).length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-4 w-full">Nenhum perfil encontrado.</p>
                    )}
                  </div>
                </div>
              )}

              {/* LGPD Section */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className={cn(labelCls, "after:content-['*'] after:ml-0.5 after:text-destructive")}>Proteção de Dados (LGPD)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <FormField
                    name={isMinor ? "print_lgpd_minor_consent" : "print_lgpd_consent"}
                    render={({ field }) => (
                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-4 bg-primary/5 border-white/5 shadow-inner hover:bg-primary/10 transition-colors h-full">
                        <Checkbox
                          id="lgpd-checkbox"
                          checked={field.value}
                          onCheckedChange={async (checked) => {
                            if (checked) {
                              const essentialFields = [
                                'name', 'document', 'email', 'phone1', 'profile_ids',
                                'nationality', 'birth_state', 'birth_date', 'mother_name'
                              ] as const;

                              const isValid = await form.trigger(essentialFields as any);
                              if (!isValid) {
                                toast.error("Preencha todos os campos obrigatórios antes de autorizar.");
                                return;
                              }

                              field.onChange(true);
                              setLgpdTermDownloaded(false);
                              if (!form.getValues('lgpd_date')) {
                                form.setValue('lgpd_date', new Date().toISOString().split('T')[0]);
                              }
                            } else {
                              field.onChange(false);
                              setLgpdTermDownloaded(false);
                            }
                          }}
                        />
                        <div className="space-y-1 leading-none">
                          <label
                            htmlFor="lgpd-checkbox"
                            className="font-extrabold text-[10px] uppercase tracking-widest cursor-pointer text-foreground/90 select-none block w-full"
                          >
                            {isMinor
                              ? 'Autorizo o tratamento de dados do menor (LGPD)'
                              : 'Autorizo o tratamento dos meus dados (LGPD)'}
                          </label>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                            Marque para autorizar e gerar o protocolo para assinatura.
                          </p>
                          {form.formState.errors[isMinor ? "print_lgpd_minor_consent" : "print_lgpd_consent"] && (
                            <p className="text-[10px] font-semibold text-destructive mt-1">
                              {form.formState.errors[isMinor ? "print_lgpd_minor_consent" : "print_lgpd_consent"]?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  />

                  {/* Upload de Documento Assinado */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <Label className={labelCls}>Upload do Termo Digitalizado ({isMinor ? 'Menor' : 'Titular'})</Label>
                      <div className="relative group">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (isMinor) setLgpdMinorFile(file);
                              else setLgpdFile(file);
                            }
                          }}
                        />
                        <div className={`rounded-xl border-dashed border-2 p-4 flex items-center justify-center gap-3 transition-all border-white/10 ${lgpdTermDownloaded && !lgpdFile && !lgpdMinorFile ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-background/20 group-hover:bg-primary/5 text-muted-foreground'}`}>
                          <Upload className={`w-4 h-4 ${lgpdTermDownloaded && !lgpdFile && !lgpdMinorFile ? 'text-destructive' : 'text-primary/60'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[200px]">
                            {lgpdTermDownloaded && !lgpdFile && !lgpdMinorFile
                              ? 'Aguardando upload do termo...'
                              : (isMinor ? lgpdMinorFile?.name : lgpdFile?.name) || 'Selecionar Termo Digitalizado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Exibir link se já houver documento */}
                    {(isMinor ? form.watch('lgpd_minor_doc_path') : form.watch('lgpd_doc_path')) && (
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Arquivado
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-7 text-[10px] uppercase font-bold"
                          onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${isMinor ? form.getValues('lgpd_minor_doc_path') : form.getValues('lgpd_doc_path')}`, '_blank')}
                        >
                          Visualizar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t border-white/10 px-6 py-4">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="w-full p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-2">
                  <p className="text-xs font-bold text-destructive uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Erros de Validação:
                  </p>
                  <ul className="list-disc ml-5 space-y-1">
                    {Object.entries(form.formState.errors).map(([key, error]: [string, any]) => {
                      const fieldNames: Record<string, string> = {
                        name: 'Nome Completo',
                        document: 'CPF / CNPJ',
                        email: 'E-mail',
                        phone1: 'Telefone 1',
                        profile_ids: 'Perfil de Acesso',
                        nationality: 'Nacionalidade',
                        birth_state: 'UF Nascimento',
                        mother_name: 'Nome da Mãe',
                        father_name: 'Nome do Pai',
                        birth_date: 'Data de Nascimento',
                        profession: 'Profissão',
                        rg: 'RG',
                        pis: 'PIS',
                        ctps: 'CTPS',
                        responsible_id: 'Responsável Legal',
                        responsible_relation: 'Relação com Menor',
                        address: 'Endereço (CEP, Rua, etc.)',
                      };
                      return (
                        <li key={key} className="text-[10px] text-destructive font-semibold uppercase tracking-tight">
                          <span className="underline">{fieldNames[key] || key}</span>: {error.message || 'Campo inválido ou incompleto'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl border border-border/50 hover:bg-accent/10"
                  onClick={resetForm}
                >
                  {editingId ? 'Cancelar' : 'Limpar'}
                </Button>
                {editingId ? (
                  <Button
                    type="submit"
                    className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? <><Loader2 className="animate-spin w-4 h-4 mr-2" aria-hidden="true" />Salvando…</>
                      : <><Save className="mr-2 w-4 h-4" aria-hidden="true" />Atualizar Usuário</>
                    }
                  </Button>
                ) : !lgpdTermDownloaded ? (
                  <Button
                    type="button"
                    className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    disabled={!form.watch(isMinor ? 'print_lgpd_minor_consent' : 'print_lgpd_consent')}
                    onClick={() => {
                      const formData = form.getValues();
                      if (isMinor) {
                        printComponent(<LGPDMinorPrivacyTerm user={formData as any} />, 'Termo LGPD Menor');
                      } else {
                        printComponent(<LGPDPrivacyTerm user={formData as any} />, 'Termo LGPD');
                      }
                      setLgpdTermDownloaded(true);
                      toast.info("Termo gerado para download...");
                    }}
                  >
                    <Save className="mr-2 w-4 h-4" aria-hidden="true" />Baixar Termo LGPD
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 h-11 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    disabled={mutation.isPending || !(isMinor ? lgpdMinorFile : lgpdFile)}
                  >
                    {mutation.isPending
                      ? <><Loader2 className="animate-spin w-4 h-4 mr-2" aria-hidden="true" />Salvando…</>
                      : <><Save className="mr-2 w-4 h-4" aria-hidden="true" />Salvar Usuário</>
                    }
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
      <div className="flex flex-col gap-4">
        {(isAdmin || isManager) && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar por nome, e-mail ou documento…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  id="show-deleted"
                  checked={showDeleted}
                  onCheckedChange={setShowDeleted}
                  aria-label="Mostrar usuários inativos"
                />
                <label htmlFor="show-deleted" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                  Mostrar inativos
                </label>
              </div>
            )}
          </div>
        )}
        {isAdmin && (
          <DataTable data={filteredUsers} columns={columns} isLoading={isLoadingUsers} title="Usuários" entityName="Usuário" paginated sortable defaultSort={{ key: 'created_at', direction: 'desc' }} />
        )}
        {isManager && !isAdmin && (
          deferredSearchTerm.length >= 3 ? (
            <DataTable data={filteredUsers} columns={columns} isLoading={isLoadingUsers} title="Resultado da Busca" entityName="Usuário" paginated sortable defaultSort={{ key: 'created_at', direction: 'desc' }} />
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              Digite pelo menos 3 caracteres para buscar usuários.
            </p>
          )
        )}
      </div>
      <AuditHistory isOpen={!!historyEntity} onClose={() => setHistoryEntity(null)} entityType="user" entityId={historyEntity?.id ? Number(historyEntity.id) : 0} entityName={historyEntity?.name} />
    </div>
  );
};
