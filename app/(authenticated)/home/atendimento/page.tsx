"use client";
import { Suspense } from "react";
import ChatMainWithContext from "@/components/atendimento/chat-main";
import ChatSidebarWithContext from "@/components/atendimento/chat-sidebar";
import { WhatsAppConnectionAlert } from "@/components/ui/whatsapp-connection-alert";
import useAuthStore from "@/store/authStore";

export default function Chat() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Preparando o atendimento...</h2>
            <p className="text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Saindo do CRM</h2>
            <p className="text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Carregando Chat</h2>
            <p className="text-gray-600">Preparando atendimento...</p>
          </div>
        </div>
      </div>
    }>
      <div className="flex h-screen overflow-hidden">
        <ChatSidebarWithContext />
        <div className="flex-1 flex flex-col">
          <WhatsAppConnectionAlert className="m-4" />
          <ChatMainWithContext />
        </div>
      </div>
    </Suspense>
  );
}
