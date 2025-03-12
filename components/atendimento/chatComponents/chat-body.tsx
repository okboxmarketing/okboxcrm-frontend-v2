"use client";

import React from "react";
import { Check } from "lucide-react";
import { Ticket, NewMessagePayload, MediaEnum } from "@/lib/types";

interface ChatBodyProps {
  messages: NewMessagePayload[];
  selectedChat: Ticket;
  onSelectImage: (url: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const renderMessageContent = (
  msg: NewMessagePayload,
  onSelectImage: (url: string) => void,
  fromMe: boolean
) => {
  switch (msg.mediaType) {
    case MediaEnum.IMAGE:
      return (
        <img
          src={msg.contentUrl}
          alt={fromMe ? "Imagem enviada" : "Imagem recebida"}
          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
          onClick={() => msg.contentUrl && onSelectImage(msg.contentUrl)}
        />
      );
    case MediaEnum.AUDIO:
      return (
        <audio controls className="w-[300px]">
          <source src={msg.contentUrl} type="audio/ogg" />
          Seu navegador não suporta áudio.
        </audio>
      );
    case MediaEnum.VIDEO:
      return (
        <video controls className="w-80 h-80 object-cover rounded-lg cursor-pointer">
          <source src={msg.contentUrl} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      );
    default:
      return (
        <p
          className={`px-4 py-1 ${fromMe
            ? "bg-black text-white rounded-l-xl rounded-t-xl"
            : "bg-white rounded-r-xl rounded-t-xl"
            }`}
        >
          {msg.data.message.conversation}
        </p>
      );
  }
};

const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  selectedChat,
  onSelectImage,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-4 px-4 space-y-2">
      {messages
        .filter((msg) => msg.contactId === selectedChat.Contact.remoteJid)
        .map((msg, index) => {
          const fromMe = msg.data.key.fromMe;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${fromMe ? "justify-end" : "justify-start"
                }`}
            >
              <div className="flex items-center gap-2">
                {renderMessageContent(msg, onSelectImage, fromMe)}
                {fromMe && (
                  <div className="flex items-center">
                    {msg.data.status === "PENDING" && (
                      <Check className="text-gray-400" size={16} />
                    )}
                    {(msg.data.status === "DELIVERY_ACK" ||
                      msg.data.status === "SERVER_ACK") && (
                        <div className="flex items-center gap-1">
                          <Check className="text-gray-400" size={16} />
                          <Check className="text-gray-400" size={16} />
                        </div>
                      )}
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          );
        })}
    </div>
  );
};

export default ChatBody;
