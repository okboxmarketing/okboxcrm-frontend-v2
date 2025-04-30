"use client";

import { useEffect, useState } from "react";

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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "@/lib/types";
import { getHiddenTickets, getTickets, hideTicket, unhideTicket } from "@/service/ticketsService";
import { Badge } from "@/components/ui/badge";

const TicketsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'hidden'>('active');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [ticketToToggle, setTicketToToggle] = useState<Ticket | null>(null);
    const { toast } = useToast();

    const fetchTickets = async (tab: 'active' | 'hidden') => {
        try {
            const data = tab === 'hidden' ? await getHiddenTickets() : await getTickets();
            setTickets(data);
        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', description: 'Erro ao buscar tickets.' });
        }
    };

    useEffect(() => {
        fetchTickets(activeTab);
    }, [activeTab]);

    const handleToggleHidden = async () => {
        if (!ticketToToggle) return;
        try {
            if (activeTab === 'hidden') {
                await unhideTicket(ticketToToggle.id);
                toast({ description: 'Ticket exibido com sucesso!' });
            } else {
                await hideTicket(ticketToToggle.id);
                toast({ description: 'Ticket ocultado com sucesso!' });
            }
            fetchTickets(activeTab);
        } catch (error) {
            console.log(error);
            toast({ variant: 'destructive', description: 'Erro ao alterar estado do ticket.' });
        } finally {
            setConfirmDialogOpen(false);
            setTicketToToggle(null);
        }
    };

    const renderTable = () => (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Contato</TableHead>
                        <TableHead>Etapa do Kanban</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-gray-100">
                            <TableCell>{ticket.Contact.name}</TableCell>
                            <TableCell>
                                <Badge style={{ backgroundColor: ticket.KanbanStep?.color }} className="text-white">
                                    {ticket.KanbanStep?.name || 'Sem etapa'}
                                </Badge></TableCell>
                            <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={activeTab === 'hidden' ? 'outline' : 'destructive'}
                                    onClick={() => {
                                        setTicketToToggle(ticket);
                                        setConfirmDialogOpen(true);
                                    }}
                                >
                                    {activeTab === 'hidden' ? 'Exibir' : 'Ocultar'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tickets.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                Nenhum ticket {activeTab === 'hidden' ? 'oculto' : 'registrado'} encontrado
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Tickets</h1>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'active' | 'hidden')}>
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Ativos</TabsTrigger>
                    <TabsTrigger value="hidden">Ocultos</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    {renderTable()}
                </TabsContent>
                <TabsContent value="hidden">
                    {renderTable()}
                </TabsContent>
            </Tabs>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {activeTab === 'hidden' ? 'Exibir Ticket' : 'Ocultar Ticket'}
                        </DialogTitle>
                    </DialogHeader>
                    <p>
                        Tem certeza que deseja {activeTab === 'hidden' ? 'exibir' : 'ocultar'} o ticket <strong>{ticketToToggle?.id}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleToggleHidden}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TicketsPage;
