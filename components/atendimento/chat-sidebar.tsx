"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { KanbanStep, Ticket } from "@/lib/types";
import { acceptTicket } from "@/service/ticketsService";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { TicketList } from "./chat-sidebar/ticket-list";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { PuffLoader, PulseLoader } from "react-spinners";
import { ChatSidebarHeader } from "./chat-sidebar/header";
import { ChatSidebarTabs } from "./chat-sidebar/tabs";

const ChatSidebar: React.FC = () => {
  const {
    tickets,
    tab,
    setTab,
    selectedChat,
    selectChat,
    fetchTickets,
    fetchMoreTickets,
    hasMoreTickets,
    isLoadingMoreTickets,
    ticketCounts,
    fetchTicketCounts
  } = useChatStore()
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [selectedKanbanStep, setSelectedKanbanStep] = useState<string>("all");
  const { user } = useAuthStore();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const lastTicketRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMoreTickets || loadingRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreTickets && !loadingRef.current) {
        loadingRef.current = true;
        fetchMoreTickets().finally(() => {
          loadingRef.current = false;
        });
      }
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    if (node) observerRef.current.observe(node);
  }, [isLoadingMoreTickets, hasMoreTickets, fetchMoreTickets]);

  useEffect(() => {
    getKanbanSteps().then(setKanbanSteps).catch(console.error);
  }, []);

  useEffect(() => {
    const kanbanStepId = selectedKanbanStep === "all"
      ? undefined
      : selectedKanbanStep === "active"
        ? undefined
        : +selectedKanbanStep;

    const onlyActive = selectedKanbanStep === "active";
    const responsibleId = showMyTickets ? user?.userId : undefined;

    fetchTickets(tab, undefined, kanbanStepId, responsibleId, onlyActive);
    fetchTicketCounts();
  }, [tab, fetchTickets, fetchTicketCounts, selectedKanbanStep, showMyTickets, user?.userId]);

  const sortedTickets = useMemo(() => {
    return [...tickets]
      .filter(t => t.lastMessage)
      .sort((a, b) =>
        new Date(b.lastMessage!.createdAt).getTime()
        - new Date(a.lastMessage!.createdAt).getTime()
      );
  }, [tickets]);

  const openTickets = sortedTickets.filter(t => ["OPEN", "SOLD", "LOSS"].includes(t.status));
  const pendingTickets = sortedTickets.filter(t => t.status === "PENDING");

  const matchesSearch = (t: Ticket) => t.Contact.name.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredOpen = openTickets.filter(matchesSearch);
  const filteredPending = pendingTickets.filter(matchesSearch);


  const handleFilterTickets = (value: string) => {
    setSelectedKanbanStep(value);
    if (value === "all") {
      setShowMyTickets(false);
    }
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      <ChatSidebarHeader
        showMyTickets={showMyTickets}
        setShowMyTickets={setShowMyTickets}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedKanbanStep={selectedKanbanStep}
        handleFilterTickets={handleFilterTickets}
        kanbanSteps={kanbanSteps}
        userRole={user?.userRole}
        tab={tab}
      />

      <ChatSidebarTabs
        tab={tab}
        setTab={setTab}
        ticketCounts={ticketCounts}
      />

      <div className="flex-1 overflow-y-auto">
        {tab === "PENDING" ? (
          <>
            {isLoadingMoreTickets && tickets.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <PuffLoader size={20} />
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Você ainda não tem tickets nesta etapa
              </div>
            ) : (
              <TicketList
                tickets={filteredPending}
                selectedChat={selectedChat}
                onSelectChat={selectChat}
                onAcceptTicket={async t => {
                  await acceptTicket(t.id);
                  fetchTickets("OPEN");
                  setTab("OPEN");
                  selectChat(t)
                }}
                loading={false}
                showAcceptButton={user?.userRole !== "ADVISOR"}
                type="PENDING"
              />
            )}
            {hasMoreTickets && (
              <div ref={lastTicketRef} className="p-4 text-center text-sm text-gray-500">
                {isLoadingMoreTickets ? (
                  <div className="flex justify-center">
                    <PulseLoader />
                  </div>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <>
            {isLoadingMoreTickets && tickets.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <PuffLoader size={20} />
              </div>
            ) : filteredOpen.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Você ainda não tem tickets nesta etapa
              </div>
            ) : (
              <TicketList
                tickets={filteredOpen}
                selectedChat={selectedChat}
                onSelectChat={selectChat}
                loading={false}
                type="OPEN"
              />
            )}
            {hasMoreTickets && (
              <div ref={lastTicketRef} className="p-4 text-center text-sm text-gray-500">
                {isLoadingMoreTickets ? (
                  <div className="flex justify-center">
                    <PulseLoader />
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;