"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MoveDownRight } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { useChatContext } from "@/contexts/ChatContext";

const ChatHeader: React.FC = () => {
  const { selectedChat, fetchTickets } = useChatContext();

  if (!selectedChat) return null;

  return (
    <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-[#FAFAFA] z-10">
      <div className="flex items-center gap-3">
        <Avatar>
          {selectedChat.Contact.pictureUrl ? (
            <AvatarImage src={selectedChat.Contact.pictureUrl} />
          ) : (
            <AvatarFallback>{selectedChat.Contact.name[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h2 className="font-semibold">{selectedChat.Contact.name}</h2>
          {selectedChat.responsibleId && (
            <p className="text-sm text-black/40">
              Acompanhado por: {selectedChat.Responsible?.name}
            </p>
          )}
        </div>
      </div>
      {selectedChat.status !== "PENDING" && (
        <div className="flex items-center gap-4">
          <MoveTicketSelect ticketId={selectedChat.id} fetchTickets={fetchTickets} />
          <Button>
            <ShoppingCart />
          </Button>
          <Button>
            <MoveDownRight />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;