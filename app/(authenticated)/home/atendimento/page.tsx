"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ticket, TicketStatusEnum } from "@/lib/types";
import { formatMessageTime } from "@/lib/utils";
import { getMessagesByContactId, getTickets } from "@/service/ticketsService";
import { Calendar, Globe, Info, Music, Paperclip, Search, Send, Settings, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

interface NewMessagePayload {
  contactId: string;
  data: {
    key: {
      fromMe: boolean;
      id: string;
      remoteJid: string;
    };
    message: {
      conversation: string;
    };
    messageType: string;
    messageTimestamp: number;
    instanceId: string;
    pushName?: string;
    status?: string;
  };
}


export default function Chat() {
  const [messages, setMessages] = useState<NewMessagePayload[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedChat, setSelectedChat] = useState<Ticket | null>(null);
  const [tab, setTab] = useState<TicketStatusEnum>("PENDING");

  const fetchTickets = useCallback(async () => {
    try {
      const response = await getTickets(tab);
      console.log("Tickets recebidos:", response);
      setTickets(response);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  }, [tab]);

  useEffect(() => {
    fetchTickets();
  }, [tab]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const response = await getMessagesByContactId(selectedChat.Contact.remoteJid);

          const formattedMessages = response.map((msg) => ({
            contactId: msg.contactId,
            data: {
              key: {
                fromMe: msg.fromMe,
                id: msg.id,
                remoteJid: msg.contactId,
              },
              message: {
                conversation: msg.content,
              },
              messageType: "conversation",
              messageTimestamp: new Date(msg.createdAt).getTime(),
              instanceId: "",
              pushName: "",
              status: "",
            },
          }));

          console.log("Mensagens carregadas:", formattedMessages);
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Erro ao buscar mensagens:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedChat]);


  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Conectado ao WebSocket com ID:", socket.id);
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        console.log("Entrando na sala:", companyId);
        socket.emit("join", companyId);
      } else {
        console.warn("companyId não encontrado no localStorage");
      }
    });

    socket.on("newMessage", (payload: NewMessagePayload) => {
      console.log("Nova mensagem recebida:", payload);
      setMessages((prev) => [...prev, payload]);

      setTimeout(() => {
        fetchTickets();
      }, 500);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-white border-t">
      {/* Sidebar */}
      <div className="mt-1 bg-white rounded-tl-xl w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-4">Atendimento</h1>
          <p></p>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input className="pl-9 bg-gray-50" placeholder="Pesquisar..." />
          </div>
        </div>

        <Tabs defaultValue="PENDING" onValueChange={(value) => setTab(value as TicketStatusEnum)} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="PENDING">AGUARDANDO</TabsTrigger>
            <TabsTrigger value="OPEN">ATENDENDO</TabsTrigger>
          </TabsList>

          <TabsContent value="PENDING">
            <div className="flex-1 overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === ticket.id ? "bg-gray-50" : ""
                    }`}
                  onClick={() => setSelectedChat(ticket)}
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
                        {ticket.lastMessage?.createdAt
                          ? formatMessageTime(ticket.lastMessage.createdAt)
                          : ""}
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

          <TabsContent value="OPEN">
            <div className="flex-1 overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === ticket.id ? "bg-gray-50" : ""
                    }`}
                  onClick={() => setSelectedChat(ticket)}
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
                        {ticket.lastMessage?.createdAt
                          ? formatMessageTime(ticket.lastMessage.createdAt)
                          : ""}
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

      {/* Chat principal */}
      <div className="flex-1 flex flex-col bg-[#FAFAFA]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              {selectedChat && selectedChat.Contact.pictureUrl ? (
                <AvatarImage src={selectedChat.Contact.pictureUrl} />
              ) : (
                <AvatarFallback>{selectedChat && selectedChat.Contact.name[0]}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="font-semibold">{selectedChat?.Contact.name || "Selecione um contato"}</h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter((msg) => msg.contactId === selectedChat?.Contact.remoteJid)
            .map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.data.key.fromMe ? "justify-end" : "justify-start"
                  }`}
              >
                {!msg.data.key.fromMe && (
                  <div className="flex items-center gap-2">
                    <p className="bg-white px-4 py-1 rounded-r-xl rounded-t-xl">{msg.data.message.conversation}</p>
                  </div>
                )}

                {msg.data.key.fromMe && (
                  <div className="flex items-center gap-2">
                    <p className="bg-black text-white px-4 py-1 rounded-l-xl rounded-t-xl">{msg.data.message.conversation}</p>
                  </div>
                )}
              </div>
            ))}
        </div>


        {/* Input para mensagens */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Input className="flex-1 border-0 bg-transparent focus-visible:ring-0" placeholder="Escreva aqui..." />
            <Button size="icon" className="h-10 w-10 rounded-full bg-black hover:bg-black/80">
              <Send className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
