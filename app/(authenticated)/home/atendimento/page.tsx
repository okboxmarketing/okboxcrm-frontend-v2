"use client";
import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { getTickets, getMessagesByContactId } from "@/service/ticketsService";
import { MediaEnum, Message, NewMessagePayload, Ticket, TicketStatusEnum } from "@/lib/types";
import ChatSidebar from "@/components/atendimento/chat-sidebar";
import ChatMain from "@/components/atendimento/chat-main";

export default function Chat() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedChat, setSelectedChat] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<NewMessagePayload[]>([]);
  const [tab, setTab] = useState<TicketStatusEnum>("PENDING");

  const fetchTickets = useCallback(async () => {
    try {
      const response = await getTickets();
      setTickets(response);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  }, []);

  // Ao entrar, carrega os Tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const response = await getMessagesByContactId(selectedChat.Contact.remoteJid);

          const formattedMessages = response.map((msg: Message) => {
            let mediaType = MediaEnum.TEXT;
            let contentUrl = undefined;
            let messageText = msg.content;

            // Define o tipo de mídia com base no messageType
            if (msg.mediaType === MediaEnum.IMAGE) {
              mediaType = MediaEnum.IMAGE;
              contentUrl = msg.content; // URL da imagem
              messageText = ""; // Não exibe texto para imagens
            } else if (msg.mediaType === MediaEnum.AUDIO) {
              mediaType = MediaEnum.AUDIO;
              contentUrl = msg.content;
              messageText = "";
            }

            return {
              contactId: msg.contactId,
              data: {
                key: {
                  fromMe: msg.fromMe,
                  id: msg.id,
                  remoteJid: msg.contactId,
                },
                message: {
                  conversation: messageText,
                },
                messageType: mediaType,
                mediaType,
                messageTimestamp: new Date(msg.createdAt).getTime(),
                instanceId: "",
                pushName: "",
                status: msg.status,
              },
              mediaType,
              contentUrl,
            };
          });

          setMessages(formattedMessages);
        } catch (error) {
          console.error("Erro ao buscar mensagens:", error);
        }
      }
    };


    fetchMessages();
  }, [selectedChat]);

  // Socket para atualizar mensagens/tickets em tempo real
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        socket.emit("join", companyId);
      }
    });

    socket.on("newMessage", (payload: NewMessagePayload) => {
      setMessages((prev) => [...prev, payload]);
      setTimeout(() => {
        fetchTickets();
      }, 500);
    });

    socket.on("messageSent", (payload: { contactId: string; message: string; status: string, mediaType: MediaEnum }) => {
      const newPayload: NewMessagePayload = {
        contactId: payload.contactId,
        data: {
          key: {
            fromMe: true,
            id: "",
            remoteJid: payload.contactId,
          },
          message: { conversation: payload.message },
          messageTimestamp: Date.now(),
          instanceId: "",
          pushName: "",
          status: payload.status,
          messageType: ""
        },
        mediaType: payload.mediaType,
      };

      setMessages((prev) => [...prev, newPayload]);
    });


    return () => {
      socket.disconnect();
    };
  }, [fetchTickets]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        tickets={tickets}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        tab={tab}
        setTab={setTab}
      />

      <ChatMain selectedChat={selectedChat} messages={messages} />
    </div>
  );
}
