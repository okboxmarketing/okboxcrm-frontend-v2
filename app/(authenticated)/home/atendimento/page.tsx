"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";

const ChatContent = () => {
  const { tickets, setSelectedChat } = useChatContext();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  useEffect(() => {
    if (ticketId && tickets.length > 0) {
      const selectedTicket = tickets.find(ticket => ticket.id === parseInt(ticketId));
      if (selectedTicket) {
        setSelectedChat(selectedTicket);
      }
    }
  }, [ticketId, tickets, setSelectedChat]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebarWithContext />
      <ChatMainWithContext />
    </div>
  );
};

export default function Chat() {
  return (
    <ChatProvider>
      <Suspense fallback={<div></div>}>
        <ChatContent />
      </Suspense>
    </ChatProvider>
  );
}
