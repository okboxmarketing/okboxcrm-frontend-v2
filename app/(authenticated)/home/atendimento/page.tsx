"use client";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";

const ChatContent = () => {
  const { tickets, setSelectedChat, selectedChat } = useChatContext();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const initialSelectionDoneRef = useRef(false);

  useEffect(() => {
    if (
      ticketId &&
      tickets.length > 0 &&
      !initialSelectionDoneRef.current &&
      !selectedChat
    ) {
      const selectedTicket = tickets.find(ticket => ticket.id === parseInt(ticketId));
      if (selectedTicket) {
        setSelectedChat(selectedTicket);
        initialSelectionDoneRef.current = true;
      }
    }
  }, [ticketId, tickets, setSelectedChat, selectedChat]);

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