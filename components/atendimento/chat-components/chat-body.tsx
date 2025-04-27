"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { FileText, Download } from "lucide-react";
import { MediaEnum, NewMessagePayload } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { isLink } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";

interface ChatBodyProps {
  onSelectImage: (url: string) => void;
}

const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function groupByDay(msgs: NewMessagePayload[]) {
  type Group = { label: string; items: NewMessagePayload[] };
  const groups: Group[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const normalize = (ts: number) => {
    const ms = ts < 1e11 ? ts * 1000 : ts;
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const labelOf = (d: number) => {
    const t0 = normalize(today.getTime());
    const y0 = normalize(yesterday.getTime());
    if (d === t0) return "Hoje";
    if (d === y0) return "Ontem";
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit"
    });
  };

  msgs.forEach(m => {
    const dayKey = normalize(m.data.messageTimestamp);
    const lbl = labelOf(dayKey);
    let grp = groups.find(g => g.label === lbl);
    if (!grp) {
      grp = { label: lbl, items: [] };
      groups.push(grp);
    }
    grp.items.push(m);
  });

  return groups;
}

const renderMessageContent = (
  msg: NewMessagePayload,
  onSelectImage: (url: string) => void,
  fromMe: boolean
) => {
  switch (msg.mediaType) {
    case MediaEnum.IMAGE:
      return (
        <div className="relative max-w-full">
          <img
            src={msg.contentUrl}
            alt={fromMe ? "Imagem enviada" : "Imagem recebida"}
            className="max-w-full w-64 h-64 object-cover rounded-lg cursor-pointer"
            onClick={() => msg.contentUrl && onSelectImage(msg.contentUrl)}
          />
          <span className={`absolute bottom-1 right-2 text-xs ${fromMe ? "text-white" : "text-gray-500"}`}>
            {formatMessageTime(msg.data.messageTimestamp)}
          </span>
        </div>
      );
    case MediaEnum.AUDIO:
      return (
        <div className="relative max-w-full">
          <audio controls className="max-w-full w-64">
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
        <div className="relative max-w-full">
          <video controls className="max-w-full w-64 h-64 object-cover rounded-lg cursor-pointer">
            <source src={msg.contentUrl} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <span className={`absolute bottom-1 right-2 text-xs ${fromMe ? "text-white" : "text-gray-500"}`}>
            {formatMessageTime(msg.data.messageTimestamp)}
          </span>
        </div>
      );
    case MediaEnum.DOCUMENT:
      const fileName = msg.contentUrl?.split('/').pop() || "documento";

      return (
        <div className="relative max-w-full">
          <div className={`p-4 rounded-lg ${fromMe ? "bg-black text-white" : "bg-white"} w-full`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{fileName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`w-full flex items-center gap-2 ${fromMe ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => {
                if (msg.contentUrl) {
                  window.open(msg.contentUrl, '_blank');
                }
              }}
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span>Baixar</span>
            </Button>
            <span className={`block mt-2 text-right text-xs ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
              {formatMessageTime(msg.data.messageTimestamp)}
            </span>
          </div>
        </div>
      );

    default:
      const messageText = msg.data.message.conversation;
      const isLinkMessage = isLink(messageText);
      return (
        <div className="relative max-w-full">
          <p
            className={`px-4 py-2 break-words ${fromMe
              ? "bg-black text-white rounded-l-xl rounded-t-xl"
              : "bg-white rounded-r-xl rounded-t-xl"
              }`}
          >
            {isLinkMessage ? (
              <a
                href={messageText}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline break-words ${fromMe ? "text-blue-200" : "text-blue-600"}`}
              >
                {messageText}
              </a>
            ) : (
              messageText
            )}
            <span className={`inline-block ml-2 text-xs ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
              {formatMessageTime(msg.data.messageTimestamp)}
            </span>
          </p>
        </div>
      );

  }
};

const ChatBody: React.FC<ChatBodyProps> = ({
  onSelectImage,
}) => {
  const { messages, selectedChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!selectedChat) return [];
    return messages.filter(m => m.contactId === selectedChat.Contact.remoteJid);
  }, [messages, selectedChat]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  if (!selectedChat) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-4">
      {groups.map(group => (
        <div key={group.label}>
          <div className="flex justify-center my-2">
            <span className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
              {group.label}
            </span>
          </div>
          {group.items.map(msg => {
            const fromMe = msg.data.key.fromMe;
            return (
              <div
                key={msg.data.key.id}
                className={`flex ${fromMe ? "justify-end" : "justify-start"} w-full mb-2`}
              >
                <div className={`max-w-[70%] ${fromMe ? "ml-auto" : "mr-auto"}`}>
                  {renderMessageContent(msg, onSelectImage, fromMe)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBody;