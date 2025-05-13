"use client";

import { useEffect, useState } from "react";
import { Ticket, TicketStatusEnum } from "@/lib/types";
import { listTickets } from "@/service/ticketsService";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { KanbanStep } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TICKET_STATUS = {
    ALL: "all",
    OPEN: "OPEN",
    PENDING: "PENDING",
    SOLD: "SOLD",
    LOSS: "LOSS"
} as const;

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
    const [selectedKanbanStep, setSelectedKanbanStep] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getKanbanSteps().then(setKanbanSteps).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const kanbanStepId = selectedKanbanStep === "all" ? undefined : parseInt(selectedKanbanStep);
                const status = selectedStatus === "all" ? undefined : selectedStatus as TicketStatusEnum;
                const { data, meta } = await listTickets(page, 10, kanbanStepId, status);
                setTickets(data);
                setTotalPages(meta.pageCount);
            } catch (error) {
                console.error("Erro ao buscar tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [page, selectedKanbanStep, selectedStatus]);

    const handleKanbanStepChange = (value: string) => {
        setSelectedKanbanStep(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case TICKET_STATUS.OPEN:
                return "text-blue-600";
            case TICKET_STATUS.PENDING:
                return "text-yellow-600";
            case TICKET_STATUS.SOLD:
                return "text-green-600";
            case TICKET_STATUS.LOSS:
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tickets</h1>
                <div className="flex gap-4">
                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TICKET_STATUS.ALL}>Todos os Status</SelectItem>
                            <SelectItem value={TICKET_STATUS.OPEN}>Em Atendimento</SelectItem>
                            <SelectItem value={TICKET_STATUS.PENDING}>Aguardando</SelectItem>
                            <SelectItem value={TICKET_STATUS.SOLD}>Vendido</SelectItem>
                            <SelectItem value={TICKET_STATUS.LOSS}>Perdido</SelectItem>
                        </SelectContent>
                    </Select>

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
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Etapa</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.Contact.name}</TableCell>
                                        <TableCell>
                                            <span style={{ color: ticket.KanbanStep.color }}>
                                                {ticket.KanbanStep.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={getStatusColor(ticket.status)}>
                                                {ticket.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{ticket.Responsible?.name || "-"}</TableCell>
                                        <TableCell>
                                            {format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm", {
                                                locale: ptBR,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                onClick={() => router.push(`/home/atendimento?ticket=${ticket.id}`)}
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

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
                </>
            )}
        </div>
    );
}
