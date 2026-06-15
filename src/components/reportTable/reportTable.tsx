import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowUpDown, ChevronLeft, ChevronRight, FileDown, FileSpreadsheet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { formatCompactCurrency } from "@/lib/utils";

interface ReportTableProps {
  data: any[];
}

type SortDirection = "asc" | "desc";
type SortConfig = {
  key: string | null;
  direction: SortDirection;
};

export const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const flattenData = useMemo(() => {
    return data.map(item => ({
      ...item,
      court_name: item.court?.name || '-',
      area_name: item.area?.name || '-',
      outcome_name: item.outcome?.name || '-',
    }));
  }, [data]);

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "-";
    return formatCompactCurrency(num);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return flattenData;

    return [...flattenData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (sortConfig.key === "total_value") {
        const aNum = parseFloat(aValue as string);
        const bNum = parseFloat(bValue as string);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [flattenData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Processo",
      "Tribunal",
      "Área",
      "Data Processo",
      "Desfecho",
      "Valor",
    ];
    const tableRows: any[] = [];

    sortedData.forEach((client, index) => {
      const clientData = [
        index + 1,
        client.number,
        client.court_name,
        client.area_name,
        formatDate(client.process_date),
        client.outcome_name,
        formatCurrency(client.total_value),
      ];
      tableRows.push(clientData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.text("Inventário de Processos", 14, 15);
    doc.save("inventario_processos.pdf");
  };

  const exportToCSV = () => {
    const headers = [
      "#",
      "Processo",
      "Tribunal",
      "Área",
      "Data Processo",
      "Desfecho",
      "Valor",
    ];

    const csvRows = [headers.join(",")];

    sortedData.forEach((client, index) => {
      const row = [
        index + 1,
        `"${client.number ?? ""}"`,
        `"${client.court_name ?? ""}"`,
        `"${client.area_name ?? ""}"`,
        `"${formatDate(client.process_date) ?? ""}"`,
        `"${client.outcome_name ?? ""}"`,
        `"${formatCurrency(client.total_value).replace("R$", "").trim()}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventario_processos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="space-y-4 p-3 border-navy-500 border-1 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Exibir</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[120px] text-muted-foreground">
              <SelectValue placeholder="50" />
            </SelectTrigger>
            <SelectContent>
              {[50, 100, 150, 200, 500, 1000]
                .filter((opt) => opt < sortedData.length)
                .map((opt) => (
                  <SelectItem key={opt} value={opt.toString()}>
                    {opt}
                  </SelectItem>
                ))
              }
              <SelectItem value={sortedData.length.toString()}>Todos ({sortedData.length})</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">itens</span>
        </div>
        <div className="flex gap-2">
          <Button
             onClick={exportToCSV}
             variant="outline"
             className="px-3 py-1 h-auto font-normal rounded-md text-sm gap-2 border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground"
          >
             <FileSpreadsheet className="h-4 w-4 " />
             Exportar CSV
          </Button>
          <Button
             onClick={exportToPDF}
             variant="outline"
             className="px-3 py-1 h-auto font-normal rounded-md text-sm gap-2 border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground"
          >
             <FileDown className="h-4 w-4" />
             Exportar PDF
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableCaption>Inventário extraído do motor de Jurimetria</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead
                 className="cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("number")}
              >
                 Processo <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead
                 className="cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("court_name")}
              >
                 Tribunal <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead
                 className="cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("area_name")}
              >
                 Área <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead
                 className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("process_date")}
              >
                 Data Processo <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead
                 className="cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("outcome_name")}
              >
                 Desfecho <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead
                 className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => handleSort("total_value")}
              >
                 Valor <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Nenhum processo encontrado na amostra.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-muted-foreground">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{client.number}</TableCell>
                  <TableCell>{client.court_name}</TableCell>
                  <TableCell>{client.area_name}</TableCell>
                  <TableCell className="text-right">{formatDate(client.process_date)}</TableCell>
                  <TableCell>{client.outcome_name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(client.total_value)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Exibindo {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} até{" "}
          {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} resultados
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 h-auto font-normal rounded-md text-sm border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 h-auto font-normal rounded-md text-sm border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-muted-foreground"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
