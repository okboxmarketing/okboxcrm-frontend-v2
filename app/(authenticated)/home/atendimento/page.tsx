"use client";
import { useEffect } from "react";
import { Suspense } from "react";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { useChatStore } from "@/store/chatStore";
import useAuthStore from "@/store/authStore";

export default function Chat() {
  const initialize = useChatStore((s) => s.initialize);
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Só inicializa quando estiver autenticado e não estiver carregando
    if (isAuthenticated && !isLoading) {
      initialize();
    }
  }, [initialize, isAuthenticated, isLoading]);

  // Se ainda está carregando a autenticação, mostra loading
  if (isLoading) {
    return <div>Carregando autenticação...</div>;
  }

  // Se não está autenticado, não mostra nada (será redirecionado)
  if (!isAuthenticated) {
    return <div>Redirecionando...</div>;
  }

  return (
    <Suspense fallback={<div>Carregando chat…</div>}>
      <div className="flex h-screen overflow-hidden">
        <ChatSidebarWithContext />
        <ChatMainWithContext />
      </div>
    </Suspense>
  );
}
