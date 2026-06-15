import {
  UserCheck
} from 'lucide-react';
import {
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { User } from '@/services/users.service';
import { capitalize } from '@/lib/utils';
import {
  labelCls,
  inputCls,
} from '@/components/ui/FormField';

interface MinorResponsibleSectionProps {
  responsibleSearch: string;
  setResponsibleSearch: (val: string) => void;
  showResponsibleDropdown: boolean;
  setShowResponsibleDropdown: (val: boolean) => void;
  filteredResponsibles: User[];
  form: any;
}

export const MinorResponsibleSection = ({
  responsibleSearch,
  setResponsibleSearch,
  showResponsibleDropdown,
  setShowResponsibleDropdown,
  filteredResponsibles,
  form,
}: MinorResponsibleSectionProps) => {
  const { watch, setValue, control } = form;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-primary" aria-hidden="true" />
        <span className={labelCls}>Responsável Legal</span>
      </div>

      <div className="bg-primary/5 p-5 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label className={labelCls}>
              Buscar Responsável
            </Label>
            <div className="relative">
              <Input
                placeholder="Nome ou CPF do responsável…"
                value={responsibleSearch}
                autoComplete="off"
                onChange={(e) => {
                  setResponsibleSearch(e.target.value);
                  setShowResponsibleDropdown(true);
                }}
                onFocus={() => setShowResponsibleDropdown(true)}
                className={inputCls}
              />
              {responsibleSearch && showResponsibleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {filteredResponsibles.length > 0 ? (
                    filteredResponsibles.map((resp: User) => (
                      <div
                        key={resp.id}
                        className="p-3 hover:bg-accent/10 cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => {
                          setValue('responsible_id', Number(resp.id));
                          setResponsibleSearch(resp.name);
                          setShowResponsibleDropdown(false);
                          toast.success(`Responsável vinculado: ${resp.name}`);
                        }}
                      >
                        <div>
                          <p className="font-medium text-sm">{resp.name}</p>
                          <p className="text-xs text-muted-foreground">{resp.document}</p>
                        </div>
                        {watch('responsible_id') === resp.id && <UserCheck className="w-4 h-4 text-green-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground italic text-center">Nenhum resultado encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="responsible_relation"
            control={control}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className={labelCls} required>Relação com o Menor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Mãe, Pai, Tutor…" value={field.value || ''} onChange={e => field.onChange(capitalize(e.target.value))} className={inputCls} />
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
