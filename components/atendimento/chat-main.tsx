"use client";

import React, { useState, useEffect, useRef } from "react";
import { NewMessagePayload, Ticket, MediaEnum } from "@/lib/types";
import { sendTextMessage } from "@/service/messageService";
import { toast } from "@/hooks/use-toast";
import ChatHeader from "./chatComponents/chat-header";
import ChatBody from "./chatComponents/chat-body";
import ChatInput from "./chatComponents/chat-input";

interface ChatMainProps {
  selectedChat: Ticket | null;
  messages: NewMessagePayload[];
}

const ChatMain: React.FC<ChatMainProps> = ({ selectedChat, messages: initialMessages }) => {
  const [messages, setMessages] = useState<NewMessagePayload[]>(initialMessages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const onSend = async (text: string) => {
    if (!selectedChat) return;
    const tempMessageId = `temp-${Date.now()}`;

    const tempMessage: NewMessagePayload = {
      contactId: selectedChat.Contact.remoteJid,
      data: {
        key: {
          fromMe: true,
          id: tempMessageId,
          remoteJid: selectedChat.Contact.remoteJid,
        },
        message: { conversation: text },
        messageType: "conversation",
        messageTimestamp: Date.now(),
        instanceId: "",
        pushName: "",
        status: "PENDING",
      },
      mediaType: MediaEnum.TEXT,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      await sendTextMessage(selectedChat.Contact.remoteJid, text);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.data.key.id === tempMessageId
            ? { ...msg, data: { ...msg.data, status: "SENT" } }
            : msg
        )
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => prev.filter((msg) => msg.data.key.id !== tempMessageId));
      toast({
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">
      {selectedChat ? (
        <>
          <ChatHeader selectedChat={selectedChat} />
          <ChatBody
            messages={messages}
            selectedChat={selectedChat}
            onSelectImage={(url) => setSelectedImage(url)}
            messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          />
          {selectedChat.status !== "PENDING" && <ChatInput onSend={onSend} />}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500">
            Selecione um contato para iniciar o chat
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatMain;
