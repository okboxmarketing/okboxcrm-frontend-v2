"use client";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { TabStatusEnum } from "@/lib/types";
import { acceptTicket } from "@/service/ticketsService";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TicketList } from "./chat-sidebar/ticket-list";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

const ChatSidebar: React.FC = () => {
  const {
    openTickets,
    pendingTickets,
    tab,
    setTab,
    selectedChat,
    selectChat,
    fetchOpen,
    fetchMoreOpen,
    openHasNext,
    openLoading,
    fetchPending,
    fetchMorePending,
    pendingHasNext,
    pendingLoading,
    openCount,
    pendingCount,
  } = useChatStore();

  const { user } = useAuthStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const TabStatus = {
    OPEN: "OPEN" as TabStatusEnum,
    PENDING: "PENDING" as TabStatusEnum,
  };

  const handleAcceptTicket = async (ticketId: number) => {
    await acceptTicket(ticketId);
    toast({ description: "Ticket aceito com sucesso" });
    setTab(TabStatus.OPEN);
  };

  // Load first page on mount or tab change
  useEffect(() => {
    if (tab === TabStatus.OPEN) {
      fetchOpen(1);
    } else {
      fetchPending(1);
    }
  }, [tab, fetchOpen, fetchPending]);

  // Infinite scroll observer
  useEffect(() => {
    const ref = scrollRef.current;
    const sent = sentinelRef.current;
    if (!ref || !sent) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (tab === TabStatus.OPEN && openHasNext && !openLoading) {
            fetchMoreOpen();
          }
          if (tab === TabStatus.PENDING && pendingHasNext && !pendingLoading) {
            fetchMorePending();
          }
        }
      },
      { root: ref, rootMargin: "200px" }
    );
    observer.observe(sent);
    return () => observer.disconnect();
  }, [tab, openHasNext, openLoading, pendingHasNext, pendingLoading, fetchMoreOpen, fetchMorePending]);

  const tickets = tab === TabStatus.OPEN ? openTickets : pendingTickets;
  const loading = tab === TabStatus.OPEN ? openLoading : pendingLoading;
  const hasNext = tab === TabStatus.OPEN ? openHasNext : pendingHasNext;

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <h1 className="text-xl font-semibold">Atendimento</h1>
        {user?.userRole !== "ADVISOR" && tab !== TabStatus.PENDING && (
          <div className="ml-auto flex items-center gap-2">
            <Switch id="myTicketsSwitch" checked={false} disabled />
            <label htmlFor="myTicketsSwitch" className="text-sm text-gray-400">
              Meus Tickets
            </label>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input className="pl-9 bg-gray-50" placeholder="Pesquisar ticket..." disabled />
        </div>
      </div>

      <div className="p-4 border-b">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabStatusEnum)}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value={TabStatus.OPEN} className="gap-2">
              ATENDENDO
              <Badge variant={"destructive"}>{openCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value={TabStatus.PENDING} className="gap-2">
              AGUARDANDO
              {pendingCount > 0 && (
                <Badge variant={"destructive"}>{pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <TicketList
          tickets={tickets}
          selectedChat={selectedChat}
          onSelectChat={selectChat}
          onAcceptTicket={
            async (t) => {
              await handleAcceptTicket(t.id);
              fetchPending()
            }}
          loading={loading}
          showAcceptButton={user?.userRole !== "ADVISOR" && tab === "PENDING"}
          type={tab}
        />

        {hasNext && (
          <div
            ref={sentinelRef}
            className="h-8 flex items-center justify-center text-sm text-gray-500"
          >
            {loading ? "Carregando…" : "Role para carregar mais"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;