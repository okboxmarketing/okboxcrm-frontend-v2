"use client";

// First, let's update the imports to add the document icon
import React, { useRef, useEffect } from "react";
import { Check, FileText, Download } from "lucide-react";
import { MediaEnum, NewMessagePayload } from "@/lib/types";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";

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
      console.log("URL DO VÍDEO: ", msg.contentUrl, msg.mediaType)
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
    case MediaEnum.DOCUMENT:
      // Get filename from URL or use a default name
      const fileName = msg.contentUrl?.split('/').pop() || "documento";

      return (
        <div className="relative">
          <div className={`p-4 rounded-lg ${fromMe ? "bg-black text-white" : "bg-white"} max-w-xs`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6" />
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
              <Download className="h-4 w-4" />
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
  // Ensure we're working with a valid timestamp
  if (!timestamp) return "Data desconhecida";

  // Convert to milliseconds if needed (check if timestamp is in seconds)
  if (timestamp < 10000000000) {
    timestamp = timestamp * 1000;
  }

  const messageDate = new Date(timestamp);
  // Check if the date is valid
  if (isNaN(messageDate.getTime())) return "Data inválida";

  // Check if date is in the future (more than 1 day ahead)
  const now = new Date();
  if (messageDate.getTime() > now.getTime() + 86400000) {
    // If date is in the future, use today's date instead
    messageDate.setTime(now.getTime());
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours to compare only dates
  const todayDate = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayDate = new Date(yesterday.setHours(0, 0, 0, 0));
  const messageDateOnly = new Date(messageDate);
  messageDateOnly.setHours(0, 0, 0, 0);

  if (messageDateOnly.getTime() === todayDate.getTime()) {
    return "Hoje";
  } else if (messageDateOnly.getTime() === yesterdayDate.getTime()) {
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

  // Ensure we have valid timestamps
  let currentTimestamp = currentMsg.data.messageTimestamp;
  let prevTimestamp = prevMsg.data.messageTimestamp;

  if (!currentTimestamp || !prevTimestamp) return true;

  // Convert to milliseconds if needed
  if (currentTimestamp < 10000000000) currentTimestamp *= 1000;
  if (prevTimestamp < 10000000000) prevTimestamp *= 1000;

  // Handle future dates
  const now = new Date().getTime();
  if (currentTimestamp > now + 86400000) currentTimestamp = now;
  if (prevTimestamp > now + 86400000) prevTimestamp = now;

  // Create date objects and reset the time to compare only the date part
  const currentDate = new Date(currentTimestamp);
  const prevDate = new Date(prevTimestamp);

  // Reset time to 00:00:00 to compare only the date part
  currentDate.setHours(0, 0, 0, 0);
  prevDate.setHours(0, 0, 0, 0);

  // Compare the dates
  return currentDate.getTime() !== prevDate.getTime();
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