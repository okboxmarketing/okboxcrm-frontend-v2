"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { useToast } from "@/hooks/use-toast";
import { acceptTicket } from "@/service/ticketsService";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TicketStatusEnum } from "@/lib/types";
import SaleButton from "./header-buttons/sale-button";
import LossButton from "./header-buttons/loss-button";
import TicketActionsDropdown from "./header-buttons/ticket-actions-dropdown";
import InfoSidebar from "./info-sidebar";
import { Loader2 } from "lucide-react";

const ChatHeader: React.FC = () => {
  const { selectedChat, fetchTickets, setTab, ticketCounts, updateChat } = useChatStore();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [acceptIsLoading, setAcceptIsLoading] = useState(false);

  const { user } = useAuthStore()

  const handleAcceptTicket = async () => {
    if (!selectedChat) return;
    try {
      setAcceptIsLoading(true);
      await acceptTicket(selectedChat.id);
      toast({
        description: "Ticket aceito com sucesso!",
      });
      // Atualiza o ticket no store
      const updatedChat = {
        ...selectedChat,
        status: "OPEN" as TicketStatusEnum,
      };
      updateChat(updatedChat);

      // Atualiza os contadores
      useChatStore.setState({
        ticketCounts: {
          pending: Math.max(0, ticketCounts.pending - 1),
          unread: Math.max(0, ticketCounts.unread - 1)
        }
      });
      // Busca tickets atualizados e muda para tab OPEN
      fetchTickets("OPEN");
      // Força a mudança da tab para OPEN
      setTab("OPEN");
    } catch (error) {
      toast({
        description: `Erro ao aceitar ticket: ${error}`,
        variant: "destructive",
      });
    } finally {
      setAcceptIsLoading(false);
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
            disabled={acceptIsLoading}
          >
            {acceptIsLoading ? <Loader2 className="animate-spin" /> : "ACEITAR"}
          </Button>
        )}
        {selectedChat.status !== "PENDING" && (
          <>
            <MoveTicketSelect ticketId={selectedChat.id} />
            <SaleButton />
            {selectedChat.status !== "LOSS" && (
              <LossButton />
            )}
          </>
        )}
        <TicketActionsDropdown
          ticketId={selectedChat.id}
          responsibleId={selectedChat.responsibleId}
        />
      </div>
      <InfoSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default ChatHeader;
