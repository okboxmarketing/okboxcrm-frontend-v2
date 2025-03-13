"use client";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { ChatProvider } from "@/contexts/ChatContext";

export default function Chat() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden">
        <ChatSidebarWithContext />
        <ChatMainWithContext />
      </div>
    </ChatProvider>
  );
}
