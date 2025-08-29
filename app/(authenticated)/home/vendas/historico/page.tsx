"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/lib/types";
import { getSales, deleteSale } from "@/service/saleService";
import { DateRange } from "react-day-picker";
import { format, formatDate, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";
import { SalesListSkeleton } from "@/components/skeleton/sales-list-skeleton";
import { useToast } from "@/hooks/use-toast";
import { ExportDropdown } from "@/components/reports/export-dropdown";

const SalesHistoryPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSale, setExpandedSale] = useState<string | null>(null);
    const [date, setDate] = useState<DateRange | undefined>();
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const { toast } = useToast();

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await getSales();
            if (data) {
                setSales(data);
                setFilteredSales(data);
            }
        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            toast({
                title: "Erro",
                description: "Erro ao carregar vendas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        filterSales();
    }, [date, searchTerm, sales]);

    const filterSales = () => {
        let filtered = [...sales];

        if (date?.from && date?.to) {
            filtered = filtered.filter(sale => {
                const saleDate = parseISO(sale.createdAt);

                const startDate = new Date(date.from!);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(date.to!);
                endDate.setHours(23, 59, 59, 999);

                return isWithinInterval(saleDate, {
                    start: startDate,
                    end: endDate
                });
            });
        }

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(sale =>
                sale.Ticket.Contact.name.toLowerCase().includes(term) ||
                (sale.Ticket.Responsible?.name || "").toLowerCase().includes(term) ||
                sale.SaleItems.some(item =>
                    item.Product.name.toLowerCase().includes(term)
                )
            );
        }

        setFilteredSales(filtered);
    };

    const toggleSaleDetails = (saleId: string) => {
        if (expandedSale === saleId) {
            setExpandedSale(null);
        } else {
            setExpandedSale(saleId);
        }
    };

    const clearFilters = () => {
        setDate(undefined);
        setSearchTerm("");
    };

    const handleOpenDeleteDialog = (sale: Sale) => {
        setSelectedSale(sale);
        setConfirmDeleteDialog(true);
    };

    const handleDeleteSale = async () => {
        if (!selectedSale) return;

        setDeletingSaleId(selectedSale.id);
        try {
            await deleteSale(selectedSale.id);

            // Remove a venda da lista local
            setSales(prevSales => prevSales.filter(sale => sale.id !== selectedSale.id));

            toast({
                title: "Sucesso",
                description: "Venda deletada com sucesso",
            });

            setConfirmDeleteDialog(false);
            setSelectedSale(null);
        } catch (error) {
            console.error("Erro ao deletar venda:", error);
            toast({
                title: "Erro",
                description: "Erro ao deletar venda",
                variant: "destructive",
            });
        } finally {
            setDeletingSaleId(null);
        }
    };

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
                    <p className="text-black/40">Visualize todas as vendas realizadas</p>
                </div>
                <Badge className="bg-black text-white px-3 py-1 text-sm">
                    {filteredSales.length}
                </Badge>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por cliente, responsável ou produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/yyyy", { locale: ptBR })
                                )
                            ) : (
                                <span>Selecione um período</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>

                <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                </Button>

                <ExportDropdown />
            </div>

            {loading ? (
                <SalesListSkeleton />
            ) : filteredSales.length > 0 ? (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map((sale) => (
                                <React.Fragment key={sale.id}>
                                    <TableRow
                                        className="hover:bg-gray-100"
                                        onClick={() => toggleSaleDetails(sale.id)}
                                    >
                                        <TableCell>{formatDate(sale.createdAt, "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="font-medium">{sale.Ticket.Contact.name}</TableCell>
                                        <TableCell>{sale.Ticket.Responsible?.name || "N/A"}</TableCell>
                                        <TableCell>{formatPrice(sale.totalAmount)}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                disabled={deletingSaleId === sale.id}
                                                onClick={() => handleOpenDeleteDialog(sale)}
                                            >
                                                {deletingSaleId === sale.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {expandedSale === sale.id && (
                                        <TableRow key={`${sale.id}-details`} className="bg-gray-50">
                                            <TableCell colSpan={5} className="p-4">
                                                <div className="text-sm">
                                                    <h3 className="font-medium mb-2">Itens da Venda</h3>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Produto</TableHead>
                                                                <TableHead>Quantidade</TableHead>
                                                                <TableHead>Preço Unitário</TableHead>
                                                                <TableHead>Total</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {sale.SaleItems.map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>{item.Product.name}</TableCell>
                                                                    <TableCell>{item.quantity}</TableCell>
                                                                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                                                                    <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhuma venda encontrada com os filtros aplicados
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão da Venda</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Tem certeza que deseja excluir a venda do cliente{" "}
                            <strong>{selectedSale?.Ticket.Contact.name}</strong>?
                        </p>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Esta ação irá:</p>
                            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                                <li>Remover a venda permanentemente do histórico</li>
                                <li>Remover venda do dashboard</li>
                                <li>Reverter o ticket para status Contato Feito</li>
                                <li>Permitir que o lead seja trabalhado novamente</li>
                                <li>Esta ação não pode ser desfeita</li>
                            </ul>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                                <strong>Valor da venda:</strong> {selectedSale && formatPrice(selectedSale.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Data da venda:</strong> {selectedSale && formatDate(selectedSale.createdAt, "dd/MM/yyyy")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSale}
                            disabled={deletingSaleId === selectedSale?.id}
                        >
                            {deletingSaleId === selectedSale?.id ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Deletando...
                                </>
                            ) : (
                                "Deletar Venda"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesHistoryPage;