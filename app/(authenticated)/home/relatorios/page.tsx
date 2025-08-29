"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, FileSpreadsheet, FileDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiHelper } from "@/lib/apiHelper";
import { DateRange } from "react-day-picker";

interface Report {
    id: number;
    type: string;
    status: string;
    link: string;
    createdAt: string;
    data_inicio: string;
    data_fim: string;
    Company: {
        name: string;
    };
}

interface ReportsResponse {
    reports: Report[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

const reportTypeLabels: Record<string, string> = {
    SALES: 'Vendas',
    LOSS: 'Perdas',
    DASHBOARD: 'Dashboard',
    TICKETS: 'Tickets',
    CREATIVES: 'Criativos'
};

const statusLabels: Record<string, string> = {
    GENERATED: 'Gerado',
    ERROR: 'Erro',
    GENERATING: 'Gerando'
};

const statusColors: Record<string, string> = {
    GENERATED: 'bg-green-100 text-green-800',
    ERROR: 'bg-red-100 text-red-800',
    GENERATING: 'bg-yellow-100 text-yellow-800'
};

const getFileIcon = (link: string) => {
    if (link.includes('.pdf')) return <FileText className="h-4 w-4" />;
    if (link.includes('.xlsx')) return <FileSpreadsheet className="h-4 w-4" />;
    if (link.includes('.csv')) return <FileDown className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
};

const getFileExtension = (link: string) => {
    if (link.includes('.pdf')) return 'PDF';
    if (link.includes('.xlsx')) return 'XLSX';
    if (link.includes('.csv')) return 'CSV';
    return 'Arquivo';
};

export default function RelatoriosPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        type: 'all',
        status: 'all',
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined
    });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { toast } = useToast();

    const fetchReports = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== 'all' && value !== undefined) {
                    if (key === 'startDate' || key === 'endDate') {
                        if (value instanceof Date) {
                            queryParams.append(key, value.toISOString());
                        }
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });

            const response = await apiHelper.get<ReportsResponse>(`/reports?${queryParams.toString()}`);
            setReports(response.reports);
            setPagination(response.pagination);
        } catch (error: any) {
            toast({
                title: "Erro",
                description: "Erro ao carregar relatórios",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filters]);

    useEffect(() => {
        if (dateRange?.from) {
            setFilters(prev => ({ ...prev, startDate: dateRange.from }));
        }
        if (dateRange?.to) {
            setFilters(prev => ({ ...prev, endDate: dateRange.to }));
        }
    }, [dateRange]);

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            type: 'all',
            status: 'all',
            startDate: undefined,
            endDate: undefined
        });
        setDateRange(undefined);
    };

    const downloadReport = (link: string, filename: string) => {
        const a = document.createElement('a');
        a.href = link;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                    <p className="text-gray-600 mt-2">Gerencie e visualize todos os relatórios gerados</p>
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tipo de Relatório */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Relatório</Label>
                            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os tipos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os tipos</SelectItem>
                                    {Object.entries(reportTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Período */}
                        <div className="space-y-2">
                            <Label>Período</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                                    {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                                            )
                                        ) : (
                                            "Selecionar período"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Limpar Filtros */}
                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full"
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Relatórios */}
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios Gerados</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum relatório encontrado
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                            {getFileIcon(report.link)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-900">
                                                    Relatório de {reportTypeLabels[report.type] || report.type}
                                                </h3>
                                                <Badge className={statusColors[report.status] || 'bg-gray-100 text-gray-800'}>
                                                    {statusLabels[report.status] || report.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {getFileExtension(report.link)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Gerado em {format(new Date(report.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                {report.data_inicio && report.data_fim && (
                                                    <span className="ml-2">
                                                        • Período: {format(new Date(report.data_inicio), "dd/MM/yyyy", { locale: ptBR })} a {format(new Date(report.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {report.status === 'GENERATED' && (
                                            <Button
                                                size="sm"
                                                onClick={() => downloadReport(report.link, `relatorio_${report.type}_${report.id}.${getFileExtension(report.link).toLowerCase()}`)}
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginação */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <div className="text-sm text-gray-700">
                                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} relatórios
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={!pagination.hasPrev}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>

                                <div className="text-sm text-gray-700">
                                    Página {pagination.page} de {pagination.totalPages}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}









