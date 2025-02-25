"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Search } from "lucide-react";
import { Ticket, TicketStatusEnum } from "@/lib/types";
import { formatMessageTime } from "@/lib/utils";
import { acceptTicket } from "@/service/ticketsService";
import { toast } from "@/hooks/use-toast";

interface ChatSidebarProps {
  tickets: Ticket[];
  selectedChat: Ticket | null;
  onSelectChat: (ticket: Ticket) => void;
  tab: TicketStatusEnum;
  setTab: (tab: TicketStatusEnum) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ tickets, selectedChat, onSelectChat, tab, setTab }) => {

  const handleAcceptTicket = async () => {
    if (!selectedChat) return;
    try {
      await acceptTicket(selectedChat.id);
      toast({
        description: "Ticket aceito com sucesso",
      });
      setTab("OPEN")
    } catch (error) {
      console.error("Erro ao aceitar ticket:", error);
    }
  }

  return (
    <div className="w-80 bg-white border-r flex flex-col overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex gap-4 items-center mb-4">
          <h1 className="text-xl font-semibold">Atendimento</h1>
          <span className="flex items-center justify-center w-6 h-6 bg-black text-white text-sm font-medium rounded-full">
            {tickets.length}
          </span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input className="pl-9 bg-gray-50" placeholder="Pesquisar..." />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as TicketStatusEnum)} className="flex-1">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="OPEN">ATENDENDO</TabsTrigger>
          <TabsTrigger value="PENDING">AGUARDANDO</TabsTrigger>
        </TabsList>

        <TabsContent value="PENDING">
          <div className="overflow-y-auto">
            {tickets.map((ticket) => (
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
                  <p className="text-sm text-gray-500 truncate">
                    {ticket.lastMessage?.content || ""}
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
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectChat(ticket)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === ticket.id ? "bg-gray-50" : ""
                  }`}
              >
                {/* Layout similar para o tab "OPEN" */}
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatSidebar;
