"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { FileText, Download } from "lucide-react";
import { MediaEnum, NewMessagePayload } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { isLink } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { PuffLoader, PulseLoader } from "react-spinners";
import MessageTimestamp from "./message/message-timestamp";

interface ChatBodyProps {
  onSelectImage: (url: string) => void;
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
          <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />
        </div>
      );
    case MediaEnum.AUDIO:
      return (
        <div className="relative max-w-full">
          <audio controls className="max-w-full w-64">
            <source src={msg.contentUrl} type="audio/ogg" />
            Seu navegador não suporta áudio.
          </audio>
          <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />
        </div>
      );
    case MediaEnum.VIDEO:
      return (
        <div className="relative max-w-full">
          <video controls className="max-w-full w-64 h-64 object-cover rounded-lg cursor-pointer">
            <source src={msg.contentUrl} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />
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
            <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />
          </div>
        </div>
      );

    default:
      const messageText = msg.data.message.conversation;
      const isLinkMessage = isLink(messageText);
      return (
        <div className="relative max-w-full">
          <p
            className={`px-4 py-2 whitespace-pre-wrap break-all ${fromMe
              ? "bg-black text-white rounded-l-xl rounded-t-xl"
              : "bg-white rounded-r-xl rounded-t-xl"
              }`}
          >
            {isLinkMessage ? (
              <a
                href={messageText}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all whitespace-pre-wrap"
              >
                {messageText}
              </a>
            ) : (
              messageText
            )}
            <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />
          </p>
        </div>
      );

  }
};

const ChatBody: React.FC<ChatBodyProps> = ({
  onSelectImage,
}) => {
  const {
    messages,
    selectedChat,
    fetchMoreMessages,
    page,
    hasNextPage,
    isLoadingMore,
    isLoadingMessages,
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      setTimeout(scrollToBottom, 0)
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const orderedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => a.data.messageTimestamp - b.data.messageTimestamp
    );
  }, [messages]);

  useEffect(() => {
    if (!isLoadingMore && page === 1) {
      setTimeout(scrollToBottom, 0)
    }
  }, [messages, isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop < 50 && hasNextPage && !isLoadingMore) {
      const previousHeight = el.scrollHeight;
      fetchMoreMessages().then(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - previousHeight + el.scrollTop;
      });
    }
  };

  if (!selectedChat) return null;

  if (page === 1 && isLoadingMessages) {
    return (
      <div
        ref={scrollRef}
        className="flex-1 flex items-center justify-center"
        style={{ minHeight: "200px" }}
      >
        <PuffLoader
          color="black"
          size={50}
          speedMultiplier={1.5}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-4" ref={scrollRef} onScroll={handleScroll}>
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <PulseLoader
            color="black"
            size={10}
            speedMultiplier={1.5}
          />
        </div>
      )}
      {orderedMessages.map((msg) => {
        const fromMe = msg.data.key.fromMe;
        return (
          <div
            key={msg.data.key.id}
            className={`flex ${fromMe ? "justify-end" : "justify-start"
              } w-full mb-2`}
          >
            <div
              className={`max-w-[70%] ${fromMe ? "ml-auto" : "mr-auto"
                }`}
            >
              {renderMessageContent(msg, onSelectImage, fromMe)}
            </div>
          </div>
        );
      })}
      <div id="messages-end" />
    </div>
  );
};

export default ChatBody;