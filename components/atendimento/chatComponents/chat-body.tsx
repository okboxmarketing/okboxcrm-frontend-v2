"use client";

import React, { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { MediaEnum, NewMessagePayload } from "@/lib/types";
import { useChatContext } from "@/contexts/ChatContext";

interface ChatBodyProps {
  onSelectImage: (url: string) => void;
}

const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const renderMessageContent = (
  msg: NewMessagePayload,
  onSelectImage: (url: string) => void,
  fromMe: boolean
) => {
  switch (msg.mediaType) {
    case MediaEnum.IMAGE:
      return (
        <div className="relative">
          <img
            src={msg.contentUrl}
            alt={fromMe ? "Imagem enviada" : "Imagem recebida"}
            className="w-80 h-80 object-cover rounded-lg cursor-pointer"
            onClick={() => msg.contentUrl && onSelectImage(msg.contentUrl)}
          />
          <span className={`absolute bottom-1 right-2 text-xs ${fromMe ? "text-white" : "text-gray-500"}`}>
            {formatMessageTime(msg.data.messageTimestamp)}
          </span>
        </div>
      );
    case MediaEnum.AUDIO:
      return (
        <div className="relative">
          <audio controls className="w-[300px]">
            <source src={msg.contentUrl} type="audio/ogg" />
            Seu navegador não suporta áudio.
          </audio>
          <span className={`absolute bottom-1 right-2 text-xs ${fromMe ? "text-white" : "text-gray-500"}`}>
            {formatMessageTime(msg.data.messageTimestamp)}
          </span>
        </div>
      );
    case MediaEnum.VIDEO:
      return (
        <div className="relative">
          <video controls className="w-80 h-80 object-cover rounded-lg cursor-pointer">
            <source src={msg.contentUrl} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <span className={`absolute bottom-1 right-2 text-xs ${fromMe ? "text-white" : "text-gray-500"}`}>
            {formatMessageTime(msg.data.messageTimestamp)}
          </span>
        </div>
      );
    default:
      const messageText = msg.data.message.conversation;
      return (
        <div className="relative">
          <p
            className={`px-4 py-2 ${fromMe
              ? "bg-black text-white rounded-l-xl rounded-t-xl"
              : "bg-white rounded-r-xl rounded-t-xl"}`}
          >
            {messageText}
            <span className={`inline-block ml-2 text-xs ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
              {formatMessageTime(msg.data.messageTimestamp)}
            </span>
          </p>
        </div>
      );
  }
};


const formatMessageDate = (timestamp: number) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Hoje";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Ontem";
  } else {
    return messageDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
};

const shouldShowDateDivider = (currentMsg: NewMessagePayload, prevMsg: NewMessagePayload | null) => {
  if (!prevMsg) return true;

  const currentDate = new Date(currentMsg.data.messageTimestamp).toDateString();
  const prevDate = new Date(prevMsg.data.messageTimestamp).toDateString();

  return currentDate !== prevDate;
};

const ChatBody: React.FC<ChatBodyProps> = ({
  onSelectImage,
}) => {
  const { messages, selectedChat } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedChat) return null;

  const filteredMessages = messages
    .filter((msg) => msg.contactId === selectedChat.Contact.remoteJid);

  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-4 px-4 space-y-2">
      {filteredMessages.map((msg, index) => {
        const fromMe = msg.data.key.fromMe;
        const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
        const showDateDivider = shouldShowDateDivider(msg, prevMsg);

        return (
          <React.Fragment key={index}>
            {showDateDivider && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                  {formatMessageDate(msg.data.messageTimestamp)}
                </div>
              </div>
            )}
            <div
              className={`flex items-start gap-3 ${fromMe ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-center gap-2">
                {renderMessageContent(msg, onSelectImage, fromMe)}
                {fromMe && (
                  <div className="flex items-center">
                    {msg.data.status === "PENDING" && (
                      <Check className="text-gray-400" size={16} />
                    )}
                    {(msg.data.status === "DELIVERY_ACK" ||
                      msg.data.status === "SERVER_ACK" ||
                      msg.data.status === "SENT") && (
                        <div className="flex items-center gap-1">
                          <Check className="text-gray-400" size={16} />
                          <Check className="text-gray-400" size={16} />
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBody;