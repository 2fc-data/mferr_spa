import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addressesService } from '@/services/addresses.service';
import { toast } from 'sonner';
import {
  labelCls,
  inputCls,
  selectCls,
} from '@/components/ui/FormField';
import { cn, capitalize } from '@/lib/utils';

export const AddressForm = () => {
  const { control, setValue, watch } = useFormContext();
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const cepValue = watch('address.postcode');

  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = (cepValue || '').replace(/\D/g, '');
      if (cleanCep.length === 8) {
        setIsSearchingCep(true);
        const data = await addressesService.getCEP(cleanCep);
        setIsSearchingCep(false);
        if (data) {
          setValue('address.street', data.street);
          setValue('address.district', data.district);
          setValue('address.city', data.city);
          setValue('address.state', data.state);
          toast.success('Endereço preenchido via CEP!');
        } else {
          toast.error('CEP não encontrado.');
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
        fetchCep();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cepValue, setValue]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          name="address.postcode"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls} required>
                CEP
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="00000-000" 
                    autoComplete="postal-code"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      const masked = value.replace(/(\d{5})(\d)/, '$1-$2');
                      field.onChange(masked);
                    }} 
                    className={inputCls} 
                  />
                  {isSearchingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="address.address_type_id"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls}>
                Tipo de Endereço
              </FormLabel>
              <Select 
                onValueChange={(val) => field.onChange(Number(val))} 
                value={field.value?.toString() || '1'}
              >
                <FormControl>
                  <SelectTrigger className={cn(selectCls, "cursor-pointer")}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Residencial</SelectItem>
                  <SelectItem value="2">Comercial</SelectItem>
                  <SelectItem value="3">Cobrança</SelectItem>
                  <SelectItem value="4">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="address.street"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls} required>Logradouro</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Rua..." 
                  autoComplete="street-address"
                  value={field.value || ''}
                  onChange={field.onChange}
                  className={inputCls} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField
          name="address.number"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls} required>Número</FormLabel>
              <FormControl>
                <Input placeholder="123" value={field.value || ''} onChange={field.onChange} className={inputCls} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="address.complement"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls}>Complemento</FormLabel>
              <FormControl>
                <Input placeholder="Apto, Bloco, etc." value={field.value || ''} onChange={e => field.onChange(capitalize(e.target.value))} className={inputCls} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="address.district"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelCls} required>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Bairro" value={field.value || ''} onChange={field.onChange} className={inputCls} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="address.city"
            control={control}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className={labelCls} required>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" value={field.value || ''} onChange={field.onChange} className={inputCls} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="address.state"
            control={control}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className={labelCls} required>UF</FormLabel>
                <FormControl>
                  <Input placeholder="UF" maxLength={2} value={field.value || ''} onChange={(e) => field.onChange(e.target.value.toUpperCase())} className={inputCls} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
