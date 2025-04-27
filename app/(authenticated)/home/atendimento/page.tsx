"use client";
import { useEffect } from "react";
import { Suspense } from "react";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { useChatStore } from "@/store/chatStore";

export default function Chat() {
  const initialize = useChatStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Suspense fallback={<div>Carregando chat…</div>}>
      <div className="flex h-screen overflow-hidden">
        <ChatSidebarWithContext />
        <ChatMainWithContext />
      </div>
    </Suspense>
  );
}
