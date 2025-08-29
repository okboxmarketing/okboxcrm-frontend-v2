"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, FileDown, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReportExtension } from "@/service/reportService";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

interface SimpleExportDropdownProps {
    onExport?: () => void;
    reportType: 'contacts' | 'tickets' | 'products' | 'vendas' | 'perdas' | 'dashboard';
    generateReport: (params: { startDate: string; endDate: string; extension: ReportExtension }) => Promise<any>;
}

export function SimpleExportDropdown({ onExport, reportType, generateReport }: SimpleExportDropdownProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExtension, setSelectedExtension] = useState<ReportExtension>(ReportExtension.XLSX);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const getReportTypeTitle = () => {
        switch (reportType) {
            case 'vendas': return 'Vendas';
            case 'perdas': return 'Perdas';
            case 'dashboard': return 'Dashboard';
            default: return 'Relatório';
        }
    };

    const handleExport = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                title: "Erro",
                description: "Selecione um período para o relatório",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        try {
            await generateReport({
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString(),
                extension: selectedExtension,
            });

            toast({
                title: "Sucesso",
                description: "Relatório gerado com sucesso!",
            });

            setIsDialogOpen(false);
            onExport?.();
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            toast({
                title: "Erro",
                description: "Erro ao gerar relatório",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const getExtensionIcon = (extension: ReportExtension) => {
        switch (extension) {
            case ReportExtension.XLSX:
                return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
            case ReportExtension.PDF:
                return <FileText className="h-5 w-5 text-red-600" />;
            case ReportExtension.CSV:
                return <FileDown className="h-5 w-5 text-blue-600" />;
            default:
                return <FileDown className="h-5 w-5" />;
        }
    };

    const getExtensionLabel = (extension: ReportExtension) => {
        switch (extension) {
            case ReportExtension.XLSX:
                return "Excel (.xlsx)";
            case ReportExtension.PDF:
                return "PDF (.pdf)";
            case ReportExtension.CSV:
                return "CSV (.csv)";
            default:
                return "Arquivo";
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
            >
                <Download className="h-4 w-4" />
                Exportar
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Exportar Relatório de {getReportTypeTitle()}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Seleção de Formato */}
                        <div className="space-y-3">
                            <Label>Formato do Relatório</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.values(ReportExtension).map((extension) => (
                                    <div
                                        key={extension}
                                        className={`flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedExtension === extension
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedExtension(extension)}
                                    >
                                        {getExtensionIcon(extension)}
                                        <span className="text-sm font-medium">
                                            {getExtensionLabel(extension)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Seleção de Período */}
                        <div className="space-y-3">
                            <Label>Período do Relatório</Label>
                            <div className="flex justify-center">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                    className="rounded-md border"
                                />
                            </div>
                            {dateRange?.from && dateRange?.to && (
                                <div className="text-sm text-gray-600 text-center">
                                    Período selecionado: {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a{" "}
                                    {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={!dateRange?.from || !dateRange?.to || isGenerating}
                            className="flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Gerar Relatório
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
