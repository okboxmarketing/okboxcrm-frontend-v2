"use client";

import { Fragment, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLosses } from "@/service/lossService";
import { Loss } from "@/lib/types";
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
import { LossHistorySkeleton } from "@/components/skeleton/loss-list-skeleton";

const LossHistoryPage: React.FC = () => {
    const [losses, setLosses] = useState<Loss[]>([]);
    const [filteredLosses, setFilteredLosses] = useState<Loss[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLoss, setExpandedLoss] = useState<string | null>(null);
    const [date, setDate] = useState<DateRange | undefined>();
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLosses = async () => {
        setLoading(true);
        try {
            const data = await getLosses();
            if (data) {
                setLosses(data);
                setFilteredLosses(data);
            }
        } catch (error) {
            console.error("Erro ao carregar perdas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLosses();
    }, []);

    useEffect(() => {
        filterLosses();
    }, [date, searchTerm, losses]);

    const filterLosses = () => {
        let filtered = [...losses];

        if (date?.from && date?.to) {
            filtered = filtered.filter(loss => {
                const lossDate = parseISO(loss.createdAt);

                const startDate = new Date(date.from!);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(date.to!);
                endDate.setHours(23, 59, 59, 999);

                return isWithinInterval(lossDate, {
                    start: startDate,
                    end: endDate
                });
            });
        }

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(loss =>
                (loss.LossReason?.description || "").toLowerCase().includes(term) ||
                loss.observation?.toLowerCase().includes(term) ||
                loss.Ticket.Contact.name.toLowerCase().includes(term)
            );
        }

        setFilteredLosses(filtered);
    };

    const toggleLossDetails = (lossId: string) => {
        if (expandedLoss === lossId) {
            setExpandedLoss(null);
        } else {
            setExpandedLoss(lossId);
        }
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
                    <h1 className="text-2xl font-bold">Histórico de Perdas</h1>
                    <p className="text-black/40">Visualize todas as oportunidades perdidas</p>
                </div>
                <Badge className="bg-black text-white px-3 py-1 text-sm">
                    {filteredLosses.length}
                </Badge>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por cliente ou motivo de perda..."
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
                <LossHistorySkeleton />
            ) : filteredLosses.length > 0 ? (
                <div className="space-y-6">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Motivo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody key={filteredLosses.length}>
                            {filteredLosses.map((loss) => (
                                <Fragment key={loss.id}>
                                    <TableRow
                                        key={loss.id}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleLossDetails(loss.id)}
                                    >
                                        <TableCell>{formatDate(loss.createdAt)}</TableCell>
                                        <TableCell>{loss.Ticket.Contact.name}</TableCell>
                                        <TableCell>{loss.Ticket.Responsible?.name || "N/A"}</TableCell>
                                        <TableCell className="font-medium">{loss.LossReason?.description || loss.lossReasonId}</TableCell>
                                    </TableRow>
                                    {expandedLoss === loss.id && (
                                        <TableRow className="bg-gray-50">
                                            <TableCell colSpan={5} className="p-4">
                                                <div className="text-sm">
                                                    <h3 className="font-medium mb-2">Detalhes da Perda</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-gray-500">Cliente:</p>
                                                            <p>{loss.Ticket.Contact.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Telefone:</p>
                                                            <p>{loss.Ticket.Contact.phone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Responsável:</p>
                                                            <p>{loss.Ticket.Responsible?.name || "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Data:</p>
                                                            <p>{formatDate(loss.createdAt)}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500">Motivo:</p>
                                                            <p>{loss.LossReason?.description || loss.lossReasonId}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500">Descrição:</p>
                                                            <p>{loss.observation || "Sem descrição"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>Nenhuma perda encontrada com os filtros aplicados.</p>
                </div>
            )}
        </div>
    );
};

export default LossHistoryPage;