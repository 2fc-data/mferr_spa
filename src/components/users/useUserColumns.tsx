import { useMemo } from 'react';
import type { Column } from '@/components/ui/DataTable';
import type { User } from '@/services/users.service';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';


export const useUserColumns = () => {
  return useMemo<Column<User>[]>(() => [
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Usuário', accessorKey: 'username', className: 'hidden xl:table-cell' },
    {
      header: 'Cadastro',
      accessorKey: (user: User) => {
        const raw = user.created_at || user.createdAt;
        if (!raw) return <span className="text-xs">-</span>;
        return <span className="text-xs">{formatDate(raw, { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>;
      },
      sortKey: 'created_at',
    },
    { header: 'E-mail', accessorKey: 'email', className: 'hidden md:table-cell' },
    { header: 'Telefone', accessorKey: 'phone1', className: 'hidden lg:table-cell' },
    {
      header: 'Perfis',
      accessorKey: (user: User) => {
        const profiles = user.profiles || [];
        return (
          <div className="flex flex-wrap gap-1">
            {profiles.map((p: any) => (
              <span key={p.id} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {p.name}
              </span>
            ))}
          </div>
        );
      },
      disableSort: true,
    },
    {
      header: 'LGPD',
      accessorKey: (user: User) => {
        const isMinor = user.is_minor;
        const hasDoc = isMinor ? user.lgpd_minor_doc_path : user.lgpd_doc_path;

        return (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              {hasDoc ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                  title={isMinor ? "Visualizar Termo de Menor" : "Visualizar Termo de Titular"}
                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${hasDoc}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              ) : (
                <span className="text-[10px] text-muted-foreground italic px-2">Pendente</span>
              )}
              {isMinor && (
                <span className="text-[7px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Menor</span>
              )}
            </div>
          </div>
        );
      },
      disableSort: true,
      className: 'text-center w-[120px]',
    },
  ], []);
};
