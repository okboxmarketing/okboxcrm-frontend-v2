"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash, EyeOff, ChevronRight, ArrowRightLeft, Loader2 } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteTicket, hideTicket, transferTicket, acceptTicket } from "@/service/ticketsService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { findMyCompany } from "@/service/companyService";
import { User } from "@/lib/types";
import SaleButton from "./header-buttons/sale-button";
import LossButton from "./header-buttons/loss-button";
import InfoSidebar from "./info-sidebar";

const ChatHeader: React.FC = () => {
  const { selectedChat, fetchTickets, selectChat, removeTicket } = useChatStore();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleFetchTickets = useCallback(() => {
    return fetchTickets("OPEN");
  }, [fetchTickets]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmHideOpen, setConfirmHideOpen] = useState(false);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [transferringUserId, setTransferringUserId] = useState<string | null>(null);

  const { user } = useAuthStore()

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await findMyCompany()
      if (data) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedChat) return;
    try {
      await deleteTicket(selectedChat.id);
      toast({
        description: "Ticket excluído com sucesso!",
      });
      selectChat(null)
      removeTicket(selectedChat.id);
    } catch (error) {
      console.error("Erro ao excluir ticket:", error);
      toast({
        description: "Erro ao excluir ticket",
        variant: "destructive",
      });
    }
    setConfirmDeleteOpen(false);
  }

  const handleHideTicket = async () => {
    if (!selectedChat) return;
    try {
      await hideTicket(selectedChat.id);
      toast({
        description: "Ticket ocultado com sucesso!",
      });
      selectChat(null)
      removeTicket(selectedChat.id);
    } catch (error) {
      console.error("Erro ao ocultar ticket:", error);
      toast({
        description: "Erro ao ocultar ticket",
        variant: "destructive",
      });
    }
    setConfirmHideOpen(false);
  }

  const handleAcceptTicket = async () => {
    if (!selectedChat) return;
    try {
      await acceptTicket(selectedChat.id);
      toast({
        description: "Ticket aceito com sucesso!",
      });
      // Atualiza o ticket no store
      selectChat({
        ...selectedChat,
        status: "OPEN",
      });
      // Busca tickets atualizados e muda para tab OPEN
      fetchTickets("OPEN");
      // Força a mudança da tab para OPEN
      useChatStore.setState({ tab: "OPEN" });
    } catch (error) {
      console.error("Erro ao aceitar ticket:", error);
      toast({
        description: "Erro ao aceitar ticket",
        variant: "destructive",
      });
    }
  }

  if (!selectedChat) return null;

  return (
    <div className="sticky top-0 flex items-center justify-between border-b bg-[#FAFAFA] z-10">
      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors w-full"
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen(true);
        }}
      >
        <UserAvatar
          name={selectedChat.Contact.name}
          pictureUrl={selectedChat.Contact.pictureUrl}
          expanded={false}
        />
        <div>
          <h2 className="font-semibold">{selectedChat.Contact.name}</h2>
          {selectedChat.responsibleId && (
            <p className="text-sm text-black/40">
              Clique para ver mais informações
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {selectedChat.status === "PENDING" && user?.userRole !== "ADVISOR" && (
          <Button
            onClick={handleAcceptTicket}
            className="bg-green-500 hover:bg-green-500/70 whitespace-nowrap"
          >
            ACEITAR
          </Button>
        )}
        {selectedChat.status !== "PENDING" && user?.userRole !== "ADVISOR" && (
          <>
            <MoveTicketSelect ticketId={selectedChat.id} fetchTickets={handleFetchTickets} />
            <SaleButton />
            {selectedChat.status !== "LOSS" && (
              <LossButton />
            )}
          </>
        )}
        {user?.userRole !== "ADVISOR" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setConfirmHideOpen(true)} className="flex items-center gap-2 text-blue-500 hover:bg-blue-100">
                <EyeOff />
                Ocultar Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="flex items-center gap-2 text-red-500 hover:bg-red-100">
                <Trash />
                Excluir Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                fetchUsers()
                setConfirmTransferOpen(true)
              }} className="flex items-center gap-2 text-green-400 hover:bg-green-100">
                <ArrowRightLeft />
                Transferir Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <p>Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTicket}>
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
              <Button variant="outline" onClick={() => setConfirmHideOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleHideTicket}>
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
                      isLoading={transferringUserId === thisUser.id}
                      variant="outline"
                      disabled={thisUser.id === selectedChat.responsibleId}
                      onClick={async () => {
                        if (!selectedChat) return;
                        setTransferringUserId(thisUser.id);
                        try {
                          await transferTicket(selectedChat.id, thisUser.id);
                          toast({
                            description: "Ticket transferido com sucesso!",
                          });
                          if (user?.userRole === "USER") {
                            selectChat(null);
                            removeTicket(selectedChat.id);
                          } else {
                            selectChat({
                              ...selectedChat,
                              responsibleId: thisUser.id,
                              Responsible: {
                                name: thisUser.name,
                              }
                            });
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
                        }
                      }}
                    >
                      Transferir
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmTransferOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <InfoSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default ChatHeader;
