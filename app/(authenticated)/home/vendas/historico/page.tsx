"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/lib/types";
import { getSales } from "@/service/saleService";

const SalesHistoryPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSale, setExpandedSale] = useState<string | null>(null);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await getSales();
            if (data) {
                setSales(data);
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

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
                    <p className="text-black/40">Visualize todas as vendas realizadas</p>
                </div>
                <Badge className="bg-black text-white px-3 py-1 text-sm">
                    {sales.length}
                </Badge>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Carregando vendas...</p>
            ) : sales.length > 0 ? (
                <div className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Ticket ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
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
                                        <TableCell>{sale.ticketId}</TableCell>
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
                    <p>Nenhuma venda encontrada.</p>
                </div>
            )}
        </div>
    );
};

export default SalesHistoryPage;