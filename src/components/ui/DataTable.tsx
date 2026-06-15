import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, History, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  type?: 'text' | 'boolean' | 'custom';
  /** Key used for sorting. If accessorKey is a string, it's used by default. For function accessors, provide this to enable sorting on that column. */
  sortKey?: keyof T;
  /** If true, sorting is disabled for this column */
  disableSort?: boolean;
}

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: number | string) => void;
  onHistory?: (item: T) => void;
  entityName: string;
  title?: string;
  /** Enable pagination controls. Default: false */
  paginated?: boolean;
  /** Default page size. Default: 50 */
  defaultPageSize?: number;
  /** Enable column sorting. Default: false */
  sortable?: boolean;
  /** Initial sort configuration: { key: string, direction: 'asc' | 'desc' } */
  defaultSort?: SortState | null;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading,
  onEdit,
  onDelete,
  onHistory,
  entityName,
  title,
  paginated = false,
  defaultPageSize = 50,
  sortable = false,
  defaultSort = null as (SortState | null),
}: DataTableProps<T>) {
  const [pageSize, setPageSize] = useState<number | 'all'>(
    paginated ? defaultPageSize : 'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortState | null>(defaultSort);

  // --- Sorting ---
  const getSortKeyForColumn = (column: Column<T>): string | null => {
    if (column.disableSort) return null;
    if (column.sortKey) return column.sortKey as string;
    if (typeof column.accessorKey === 'string') return column.accessorKey as string;
    return null;
  };

  const handleSort = (column: Column<T>) => {
    if (!sortable) return;
    const key = getSortKeyForColumn(column);
    if (!key) return;

    setSort(prev => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        // if desc, remove sort
        return null;
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sort.key];
      const bVal = (b as any)[sort.key];

      // Handle nested objects (e.g. court.name)
      const aDisplay = typeof aVal === 'object' && aVal !== null ? aVal.name || '' : aVal;
      const bDisplay = typeof bVal === 'object' && bVal !== null ? bVal.name || '' : bVal;

      // nulls/undefined go last
      if (aDisplay == null && bDisplay == null) return 0;
      if (aDisplay == null) return 1;
      if (bDisplay == null) return -1;

      let comparison = 0;
      if (typeof aDisplay === 'number' && typeof bDisplay === 'number') {
        comparison = aDisplay - bDisplay;
      } else if (typeof aDisplay === 'boolean' && typeof bDisplay === 'boolean') {
        comparison = (aDisplay === bDisplay) ? 0 : aDisplay ? -1 : 1;
      } else {
        comparison = String(aDisplay).localeCompare(String(bDisplay), 'pt-BR', { sensitivity: 'base' });
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sort]);

  // --- Pagination ---
  const totalItems = sortedData.length;
  const effectivePageSize = pageSize === 'all' ? totalItems : pageSize;
  const totalPages = effectivePageSize > 0 ? Math.ceil(totalItems / effectivePageSize) : 1;

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return sortedData;
    const start = (currentPage - 1) * effectivePageSize;
    return sortedData.slice(start, start + effectivePageSize);
  }, [sortedData, currentPage, effectivePageSize, pageSize]);

  const handlePageSizeChange = (value: string) => {
    if (value === 'all') {
      setPageSize('all');
    } else {
      setPageSize(Number(value));
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!sortable) return null;
    const key = getSortKeyForColumn(column);
    if (!key) return null;

    if (sort?.key === key) {
      return sort.direction === 'asc'
        ? <ArrowUp className="inline h-3.5 w-3.5 ml-1 text-primary" />
        : <ArrowDown className="inline h-3.5 w-3.5 ml-1 text-primary" />;
    }
    return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-30 group-hover:opacity-70" />;
  };

  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const displayEnd = Math.min(currentPage * effectivePageSize, totalItems);

  return (
    <div className="flex-1 border border-white/10 rounded-2xl shadow-xl bg-card/40 backdrop-blur-sm text-card-foreground overflow-hidden flex flex-col h-full">
      {/* Header with title and pagination controls */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        {title && (
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Registros</span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
          </div>
        )}
        {paginated && !isLoading && totalItems > 0 && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Exibir
            </span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[90px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {displayStart}–{displayEnd} de {totalItems}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 px-2 py-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              {columns.map((column, index) => {
                const isSortable = sortable && getSortKeyForColumn(column) !== null;
                return (
                  <TableHead
                    key={index}
                    className={`${column.className || ''} text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ${isSortable ? 'cursor-pointer select-none group hover:text-foreground transition-colors' : ''}`}
                    onClick={() => isSortable && handleSort(column)}
                  >
                    {column.header}
                    <SortIcon column={column} />
                  </TableHead>
                );
              })}
              {(onEdit || onDelete || onHistory) && <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center h-24">
                  Carregando {entityName}…
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center h-24">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all group/row">
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {column.type === 'boolean' ? (
                        <div className="flex justify-center">
                          <Checkbox checked={!!(typeof column.accessorKey === 'string' ? item[column.accessorKey] : false)} disabled />
                        </div>
                      ) : typeof column.accessorKey === 'function' ? (
                        column.accessorKey(item)
                      ) : (
                        (item[column.accessorKey] as any)?.toString() || '-'
                      )}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onHistory) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => onEdit(item)}
                            title="Editar"
                            aria-label="Editar registro"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onHistory && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => onHistory(item)}
                            title="Ver Histórico"
                            aria-label="Ver histórico de alterações"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(item.id)}
                            title="Excluir"
                            aria-label="Excluir registro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {paginated && !isLoading && totalItems > 0 && pageSize !== 'all' && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
