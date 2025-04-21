"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/lib/types";
import { getSales } from "@/service/saleService";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SalesListSkeleton } from "@/components/skeleton/sales-list-skeleton";

const SalesHistoryPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSale, setExpandedSale] = useState<string | null>(null);
    const [date, setDate] = useState<DateRange | undefined>();
    const [searchTerm, setSearchTerm] = useState("");

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const clearFilters = () => {
        setDate(undefined);
        setSearchTerm("");
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
                <div>
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
                </div>
                <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                </Button>
            </div>

            {loading ? (
                <SalesListSkeleton />
            ) : filteredSales.length > 0 ? (
                <div className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Valor Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody key={filteredSales.length}>
                            {filteredSales.map((sale) => (
                                <>
                                    <TableRow
                                        key={sale.id}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleSaleDetails(sale.id)}
                                    >
                                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                                        <TableCell>{sale.Ticket.Contact.name}</TableCell>
                                        <TableCell>{sale.Ticket.Responsible?.name || "N/A"}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                                    </TableRow>
                                    {expandedSale === sale.id && (
                                        <TableRow className="bg-gray-50">
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
                                                                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                                                    <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>Nenhuma venda encontrada com os filtros aplicados.</p>
                </div>
            )}
        </div>
    );
};

export default SalesHistoryPage;