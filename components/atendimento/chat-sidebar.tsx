"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { KanbanStep, Ticket, TicketStatusEnum } from "@/lib/types";
import { acceptTicket } from "@/service/ticketsService";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "../ui/badge";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TicketList } from "./chat-sidebar/ticket-list";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

const ChatSidebar: React.FC = () => {
  const { tickets, tab, setTab, selectedChat, selectChat, fetchTickets } = useChatStore()
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [selectedKanbanStep, setSelectedKanbanStep] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsLoading(tickets.length === 0);
  }, [tickets]);

  useEffect(() => {
    getKanbanSteps().then(setKanbanSteps).catch(console.error);
  }, []);

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

  const filteredOpen = openTickets.filter(t =>
    matchesSearch(t) &&
    (showMyTickets ? t.responsibleId === user?.userId : true) &&
    (selectedKanbanStep === "all"
      ? true
      : selectedKanbanStep === "active"
        ? t.KanbanStep.name !== "Sem Contato" && !["SOLD", "LOSS"].includes(t.status)
        : t.KanbanStep.id === +selectedKanbanStep
    )
  );

  const filteredPending = pendingTickets.filter(matchesSearch);

  const searchTickets = (ticket: Ticket) => {
    const lowercaseSearch = searchTerm.toLowerCase();

    const matchesContactName = ticket.Contact.name.toLowerCase().includes(lowercaseSearch);

    return matchesContactName
  };



  const filteredOpenTickets = openTickets.filter(ticket =>
    (showMyTickets ? ticket.responsibleId === user?.userId : true) &&
    searchTickets(ticket) &&
    (
      selectedKanbanStep === "all" ? true :
        selectedKanbanStep === "active" ?
          ticket.KanbanStep.name !== "Sem Contato" &&
          ticket.status !== "SOLD" &&
          ticket.status !== "LOSS"
          :
          ticket.KanbanStep.id === parseInt(selectedKanbanStep)
    )
  );

  const filteredPendingTickets = pendingTickets.filter(searchTickets);

  const sortedOpenTickets = [...filteredOpenTickets].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt || 0).getTime() -
      new Date(a.lastMessage?.createdAt || 0).getTime()
  );

  const sortedPendingTickets = [...filteredPendingTickets].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt || 0).getTime() -
      new Date(a.lastMessage?.createdAt || 0).getTime()
  );

  const isUnreadMessage = (lastMessage: Ticket["lastMessage"]) => {
    return lastMessage && !lastMessage.fromMe && lastMessage.read === false;
  };

  const handleFilterTickets = (value: string) => {
    setSelectedKanbanStep(value);

    if (value === "all") {
    } else {
      setShowMyTickets(false);
    }
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      <div className="flex flex-col">
        <div className="p-4 border-b flex items-center">
          <h1 className="text-xl font-semibold">Atendimento</h1>
          {(user?.userRole != "ADVISOR" && tab != "PENDING") && (
            <div className="ml-auto flex items-center gap-2">
              <Switch
                id="myTicketsSwitch"
                checked={showMyTickets}
                onCheckedChange={(checked: boolean) => setShowMyTickets(checked)}
              />
              <label htmlFor="myTicketsSwitch" className="text-sm">
                Meus Tickets
              </label>
            </div>
          )}
        </div>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              className="pl-9 bg-gray-50"
              placeholder="Pesquisar ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {tab === "OPEN" && (
            <div className="pt-4">
              <Select onValueChange={handleFilterTickets} value={selectedKanbanStep}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrar por Etapa" className="w-1/2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Etapas</SelectItem>
                  <SelectItem value="active">Apenas Leads Ativos</SelectItem>
                  {kanbanSteps
                    .filter(step => step.name !== "Sem Contato")
                    .map((step) => (
                      <SelectItem
                        key={step.id}
                        value={step.id.toString()}>
                        <p className="font-bold" style={{ color: step.color }}>
                          {step.name}
                        </p>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as TicketStatusEnum)}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="OPEN" className="gap-2">
              ATENDENDO {
                (() => {
                  const unreadCount = sortedOpenTickets.filter(ticket =>
                    isUnreadMessage(ticket.lastMessage)
                  ).length;
                  return unreadCount > 0 ? <Badge variant={"destructive"}>{unreadCount}</Badge> : null;
                })()
              }
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="gap-2">
              AGUARDANDO
              {sortedPendingTickets.length > 0 && (
                <Badge variant={"destructive"}>{sortedPendingTickets.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "PENDING" ? (
          <TicketList
            tickets={filteredPending}
            selectedChat={selectedChat}
            onSelectChat={selectChat}
            onAcceptTicket={async t => {
              await acceptTicket(t.id);
              toast({ description: "Ticket aceito com sucesso" });
              fetchTickets();
              setTab("OPEN");
            }}
            loading={isLoading}
            showAcceptButton={user?.userRole !== "ADVISOR"}
            type="PENDING"
          />
        ) : (
          <TicketList
            tickets={filteredOpen}
            selectedChat={selectedChat}
            onSelectChat={selectChat}
            loading={isLoading}
            type="OPEN"
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;