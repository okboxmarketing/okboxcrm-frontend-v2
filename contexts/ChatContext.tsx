"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import io from "socket.io-client";
import { getTickets, getMessagesByContactId } from "@/service/ticketsService";
import { sendTextMessage } from "@/service/messageService";
import { MediaEnum, Message, NewMessagePayload, Ticket, TicketStatusEnum } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface ChatContextType {
  tickets: Ticket[];
  selectedChat: Ticket | null;
  messages: NewMessagePayload[];
  tab: TicketStatusEnum;
  setTab: (tab: TicketStatusEnum) => void;
  setSelectedChat: (ticket: Ticket | null) => void;
  fetchTickets: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedChat, setSelectedChat] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<NewMessagePayload[]>([]);
  const [tab, setTab] = useState<TicketStatusEnum>("OPEN");

  const fetchTickets = useCallback(async () => {
    try {
      const response = await getTickets();
      setTickets(response);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        socket.emit("join", companyId);
      }
    });

    socket.on("newMessage", (payload: NewMessagePayload) => {
      // Verificar se a mensagem já existe para evitar duplicação
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) => msg.data.key.id === payload.data.key.id
        );
        if (messageExists) return prev;
        return [...prev, payload];
      });

      setTimeout(() => {
        fetchTickets();
      }, 500);
    });

    socket.on("messageSent", (payload: { contactId: string; message: string; status: string, mediaType: MediaEnum }) => {
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchTickets]);

  const sendMessage = async (text: string) => {
    if (!selectedChat) return;

    try {
      await sendTextMessage(selectedChat.Contact.remoteJid, text);

      // Update ticket information as before
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          if (ticket.id === selectedChat.id) {
            return {
              ...ticket,
              lastMessage: {
                ...ticket.lastMessage,
                content: text,
                fromMe: true,
                createdAt: new Date().toISOString(),
                mediaType: MediaEnum.TEXT
              }
            };
          }
          return ticket;
        })
      );

      // Também atualizar o selectedChat para refletir a mudança
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lastMessage: {
            ...prev.lastMessage,
            content: text,
            fromMe: true,
            createdAt: new Date().toISOString(),
            mediaType: MediaEnum.TEXT
          }
        };
      });

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  // Make sure to expose this function in the context value
  const value = {
    tickets,
    selectedChat,
    messages,
    tab,
    setTab,
    setSelectedChat,
    fetchTickets,
    sendMessage,
    // Add the new function if you implement it at the context level
    // sendMediaMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};