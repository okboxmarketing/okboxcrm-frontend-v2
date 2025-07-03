"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/lib/types";
import { listTickets, getHiddenTickets, unhideTicket } from "@/service/ticketsService";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { KanbanStep } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, Loader2 } from "lucide-react";
import { Suspense } from "react";

interface TicketsTableProps {
    tickets: Ticket[];
    isHiddenTickets?: boolean;
    onUnhide?: (ticketId: number) => Promise<void>;
}

function TicketsTable({ tickets, isHiddenTickets = false, onUnhide }: TicketsTableProps) {
    const { toast } = useToast();
    const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null);

    const handleUnhide = async (ticketId: number) => {
        if (!onUnhide) return;
        try {
            setLoadingTicketId(ticketId);
            await onUnhide(ticketId);
            toast({
                title: "Ticket reativado",
                description: "O ticket foi reativado com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error("Erro ao reativar ticket:", error);
            toast({
                title: "Erro ao reativar ticket",
                description: "Ocorreu um erro ao tentar reativar o ticket.",
                variant: "destructive",
            });
        } finally {
            setLoadingTicketId(null);
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="">Cliente</TableHead>
                        {!isHiddenTickets && <TableHead className="">Etapa</TableHead>}
                        <TableHead className="">Responsável</TableHead>
                        <TableHead className="">Última Atualização</TableHead>
                        {isHiddenTickets && <TableHead className="">Ações</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="max-w-[250px]">
                                <div className="truncate" title={ticket.Contact.name}>
                                    {ticket.Contact.name}
                                </div>
                            </TableCell>
                            {!isHiddenTickets && (
                                <TableCell className="max-w-[150px]">
                                    {ticket.KanbanStep ? (
                                        <Badge style={{ backgroundColor: ticket.KanbanStep.color }} className="min-w-[100px] text-center truncate" title={ticket.KanbanStep.name}>
                                            {ticket.KanbanStep.name}
                                        </Badge>
                                    ) : (
                                        <Badge className="min-w-[100px] text-center truncate bg-gray-500">
                                            Sem Etapa
                                        </Badge>
                                    )}
                                </TableCell>
                            )}
                            <TableCell className="max-w-[200px]">
                                <div className="truncate" title={ticket.Responsible?.name || "Sem Responsável"}>
                                    {ticket.Responsible?.name || "Sem Responsável"}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[180px]">
                                <div className="truncate">
                                    {format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm", {
                                        locale: ptBR,
                                    })}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[120px]">
                                {isHiddenTickets && (
                                    <div
                                        onClick={() => handleUnhide(ticket.id)}
                                        className={`w-full flex items-center ${loadingTicketId === ticket.id ? "animate-pulse" : ""}`}
                                    >
                                        <Eye />
                                        {loadingTicketId === ticket.id && <span className="ml-2">Reativando...</span>}
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function TicketsContent() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [hiddenTickets, setHiddenTickets] = useState<Ticket[]>([]);
    const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
    const [selectedKanbanStep, setSelectedKanbanStep] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "hidden" ? "hidden" : "all");

    const handleUnhideTicket = async (ticketId: number) => {
        await unhideTicket(ticketId);
        setHiddenTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleKanbanStepChange = (value: string) => {
        setSelectedKanbanStep(value);
        setPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setPage(1);
    };

    useEffect(() => {
        getKanbanSteps().then(setKanbanSteps).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                if (activeTab === "all") {
                    const kanbanStepId = selectedKanbanStep === "all" ? undefined : parseInt(selectedKanbanStep);
                    const { data, meta } = await listTickets(page, 10, kanbanStepId);
                    setTickets(data);
                    setTotalPages(meta.pageCount);
                } else {
                    const data = await getHiddenTickets();
                    setHiddenTickets(data);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Erro ao buscar tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [page, selectedKanbanStep, activeTab]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tickets</h1>
                <div className="flex gap-4">
                    {activeTab === "all" && (
                        <Select value={selectedKanbanStep} onValueChange={handleKanbanStepChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Etapa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Etapas</SelectItem>
                                {kanbanSteps.map((step, i) => {
                                    if (step?.id == null) {
                                        console.warn(`kanbanSteps[${i}] sem id:`, step);
                                        return null;
                                    }
                                    const idStr = step.id.toString();
                                    return (
                                        <SelectItem key={idStr} value={idStr}>
                                            <p style={{ color: step.color }}>{step.name}</p>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">Todos os Tickets</TabsTrigger>
                    <TabsTrigger value="hidden">Tickets Ocultos</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <TicketsTable
                        tickets={tickets}
                    />
                </TabsContent>
                <TabsContent value="hidden">
                    <TicketsTable
                        tickets={hiddenTickets}
                        isHiddenTickets={true}
                        onUnhide={handleUnhideTicket}
                    />
                </TabsContent>
            </Tabs>

            {loading && (
                <div className="absolute inset-0 bg-white/50 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}

            {activeTab === "all" && (
                <div className="mt-4 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="py-2 px-4">
                        Página {page} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        Próxima
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function TicketsPage() {
    return (
        <Suspense fallback={<div><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <TicketsContent />
        </Suspense>
    );
}
