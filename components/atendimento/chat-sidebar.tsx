"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Search } from "lucide-react";
import { Ticket, TicketStatusEnum } from "@/lib/types";
import { formatMessageTime, getContrastColor } from "@/lib/utils";
import { acceptTicket } from "@/service/ticketsService";
import { toast } from "@/hooks/use-toast";
import { Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ChatSidebarProps {
  tickets: Ticket[];
  selectedChat: Ticket | null;
  onSelectChat: (ticket: Ticket) => void;
  tab: TicketStatusEnum;
  setTab: (tab: TicketStatusEnum) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ tickets, selectedChat, onSelectChat, tab, setTab }) => {
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);


  const handleAcceptTicket = async () => {
    if (!selectedChat) return;
    try {
      await acceptTicket(selectedChat.id);
      toast({ description: "Ticket aceito com sucesso" });
      setTab("OPEN");
    } catch (error) {
      console.error("Erro ao aceitar ticket:", error);
    }
  };

  const openTickets = tickets.filter(ticket => ticket.status === "OPEN");
  const pendingTickets = tickets.filter(ticket => ticket.status === "PENDING");

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  const filteredOpenTickets = showMyTickets
    ? openTickets.filter(ticket => ticket.responsibleId === userId)
    : openTickets;

  return (
    <div className="w-80 bg-white border-r flex flex-col overflow-y-auto">
      <div className="p-4 border-b flex items-center">
        <h1 className="text-xl font-semibold">Atendimento</h1>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="myTicketsSwitch"
            checked={showMyTickets}
            onCheckedChange={(checked: boolean | ((prevState: boolean) => boolean)) => setShowMyTickets(checked)}
          />
          <label htmlFor="myTicketsSwitch" className="text-sm">
            Meus Tickets
          </label>
        </div>
      </div>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input className="pl-9 bg-gray-50" placeholder="Pesquisar..." />
        </div>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TicketStatusEnum)}
        className="flex-1"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="OPEN">
            ATENDENDO ({filteredOpenTickets.length})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            AGUARDANDO ({pendingTickets.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="PENDING">
          <div className="overflow-y-auto">
            {pendingTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectChat(ticket)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === ticket.id ? "bg-gray-50" : ""
                  }`}
              >
                <div className="relative">
                  <Avatar>
                    {ticket.Contact.pictureUrl ? (
                      <AvatarImage src={ticket.Contact.pictureUrl} />
                    ) : (
                      <AvatarFallback>{ticket.Contact.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{ticket.Contact.name}</p>
                    <span className="text-xs text-gray-500">
                      {ticket.lastMessage?.createdAt ? formatMessageTime(ticket.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-2">
                    {ticket.lastMessage?.isImage ? (
                      <>
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                        Imagem
                      </>
                    ) : (
                      ticket.lastMessage?.content || ""
                    )}
                  </p>
                </div>
                <Button className="rounded" onClick={handleAcceptTicket}>
                  <Check />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="OPEN">
          <div className="overflow-y-auto">
            {filteredOpenTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectChat(ticket)}
                className={`flex flex-col gap-1 p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === ticket.id ? "bg-gray-50" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      {ticket.Contact.pictureUrl ? (
                        <AvatarImage src={ticket.Contact.pictureUrl} />
                      ) : (
                        <AvatarFallback>{ticket.Contact.name[0]}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{ticket.Contact.name}</p>
                      <span className="text-xs text-gray-500">
                        {ticket.lastMessage?.createdAt ? formatMessageTime(ticket.lastMessage.createdAt) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {ticket.lastMessage?.content || ""}
                    </p>
                  </div>
                </div>
                <div className="flex mt-2 gap-2">
                  {ticket.KanbanStep ? (
                    <span
                      className="text-xs px-2 py-1 rounded inline-block"
                      style={{
                        backgroundColor: ticket.KanbanStep?.color,
                        color: getContrastColor(ticket.KanbanStep?.color),
                      }}
                    >
                      {ticket.KanbanStep.name}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded inline-block border border-red-500 text-red-500">
                      Sem Etapa
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded inline-block bg-black text-white">
                    {ticket.Responsible?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatSidebar;
