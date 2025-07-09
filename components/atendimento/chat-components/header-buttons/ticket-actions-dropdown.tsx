"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash, EyeOff, ChevronRight, ArrowRightLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { deleteTicket, hideTicket, transferTicket } from "@/service/ticketsService";
import { findMyCompany } from "@/service/companyService";
import { User } from "@/lib/types";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

interface TicketActionsDropdownProps {
    ticketId: number;
    responsibleId?: string | null;
}

const TicketActionsDropdown: React.FC<TicketActionsDropdownProps> = ({
    ticketId,
    responsibleId
}) => {
    const { toast } = useToast();
    const { selectChat, removeTicket, updateChat, ticketCounts } = useChatStore();
    const { user } = useAuthStore();

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmHideOpen, setConfirmHideOpen] = useState(false);
    const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [transferringUserId, setTransferringUserId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHiding, setIsHiding] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);

    const fetchUser = async () => {
        setLoadingUsers(true);
        try {
            const data = await findMyCompany()
            if (data) {
                setUsers(data.users)
            }
        } catch (error) {
            toast({
                description: `Erro ao carregar usuários: ${error}`,
                variant: "destructive",
            });
        } finally {
            setLoadingUsers(false);
        }
    }

    const handleDeleteTicket = async () => {
        try {
            setIsDeleting(true);
            await deleteTicket(ticketId);
            toast({
                description: "Ticket excluído com sucesso!",
            });
            removeTicket(ticketId);
            selectChat(null)
        } catch (error) {
            toast({
                description: `Erro ao excluir ticket: ${error}`,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
        setConfirmDeleteOpen(false);
    }

    const handleHideTicket = async () => {
        try {
            setIsHiding(true);
            await hideTicket(ticketId);
            toast({
                description: "Ticket ocultado com sucesso!",
            });
            ticketCounts.pending = Math.max(0, ticketCounts.pending - 1);
            ticketCounts.unread = Math.max(0, ticketCounts.unread - 1);
            removeTicket(ticketId);
            selectChat(null)
        } catch (error) {
            toast({
                description: `Erro ao ocultar ticket: ${error}`,
                variant: "destructive",
            });
        } finally {
            setIsHiding(false);
        }
        setConfirmHideOpen(false);
    }

    const handleTransferTicket = async (userId: string, userName: string) => {
        try {
            setIsTransferring(true);
            setTransferringUserId(userId);
            await transferTicket(ticketId, userId);
            toast({
                description: `Ticket transferido para ${userName}!`,
            });
            if (user?.userRole === "USER") {
                removeTicket(ticketId);
                selectChat(null);
            } else {
                // Atualiza o ticket no store com o novo responsável
                const currentChat = useChatStore.getState().selectedChat;
                if (currentChat) {
                    const updatedChat = {
                        ...currentChat,
                        responsibleId: userId,
                        Responsible: {
                            name: userName,
                        }
                    };
                    updateChat(updatedChat);
                }
            }
            setConfirmTransferOpen(false);
        } catch (error) {
            console.error("Erro ao transferir ticket:", error);
            toast({
                description: "Erro ao transferir ticket",
                variant: "destructive",
            });
        } finally {
            setTransferringUserId(null);
            setIsTransferring(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2">
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => setConfirmHideOpen(true)}
                        className="flex items-center gap-2 text-blue-500 hover:bg-blue-100"
                    >
                        <EyeOff />
                        Ocultar Ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setConfirmDeleteOpen(true)}
                        className="flex items-center gap-2 text-red-500 hover:bg-red-100"
                    >
                        <Trash />
                        Excluir Ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            fetchUser()
                            setConfirmTransferOpen(true)
                        }}
                        className="flex items-center gap-2 text-green-400 hover:bg-green-100"
                    >
                        <ArrowRightLeft />
                        Transferir Ticket
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                    </DialogHeader>
                    <p>Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTicket} isLoading={isDeleting}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmHideOpen} onOpenChange={setConfirmHideOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Você tem certeza?</DialogTitle>
                    </DialogHeader>
                    <p>Tem certeza que deseja ocultar este ticket? Ele não vai mais participar de seu atendimento, métricas e kanban.</p>
                    <Link href={'/home/tickets'} className="flex items-center gap-2 text-blue-500 hover:text-blue-300 text-sm">
                        <ChevronRight />
                        Ver Tickets Ocultos
                    </Link>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmHideOpen(false)} disabled={isHiding}>
                            Cancelar
                        </Button>
                        <Button onClick={handleHideTicket} isLoading={isHiding}>
                            Ocultar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmTransferOpen} onOpenChange={setConfirmTransferOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selecione o novo responsável</DialogTitle>
                    </DialogHeader>
                    {loadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-8 w-8" />
                        </div>
                    ) : (
                        <div className="py-4 space-y-2">
                            {users.map((thisUser) => (
                                <div key={thisUser.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar name={thisUser.name} pictureUrl={thisUser.profileImage} />
                                        <span>{thisUser.name}</span>
                                    </div>
                                    <Button
                                        isLoading={isTransferring && transferringUserId === thisUser.id}
                                        variant="outline"
                                        disabled={thisUser.id === responsibleId}
                                        onClick={() => handleTransferTicket(thisUser.id, thisUser.name)}
                                    >
                                        Transferir
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmTransferOpen(false)} disabled={isTransferring}>
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TicketActionsDropdown; 