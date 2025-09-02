"use client";

import React, { useRef, useEffect, useState } from "react";
import { FileText, Download, Pause, Play, User, Phone, UserPlus, MessageSquare } from "lucide-react";
import { MediaEnum, NewMessagePayload, Ticket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatPhone, isLink } from "@/lib/utils";
import { createContact } from "@/service/contactService";
import { createTicketFromContact } from "@/service/ticketsService";
import { toast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chatStore";
import { PuffLoader, PulseLoader } from "react-spinners";
import MessageTimestamp from "./message/message-timestamp";
import { UserAvatar } from "@/components/ui/user-avatar";
import useAuthStore from "@/store/authStore";
import QuotedMessage from "./message/quoted-message";
import MessageOptions from "./message/message-options";

interface ChatBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replyingTo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReplyingTo?: (message: any) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ setReplyingTo }) => {
  const {
    messages,
    selectedChat,
    fetchMoreMessages,
    page,
    hasNextPage,
    isLoadingMore,
    isLoadingMessages,
    selectChat,
  } = useChatStore();
  const { user } = useAuthStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleQuoteClick = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
    }
  };

  const handleReply = (message: NewMessagePayload) => {
    if (setReplyingTo) {
      setReplyingTo(message);
    }
  };

  const renderReactions = (messageId: string) => {
    const messageReactions = reactions[messageId];
    if (!messageReactions || messageReactions.length === 0) return null;

    return (
      <div className="absolute -bottom-1 -right-1 flex z-10">
        {messageReactions.map((reaction, index) => (
          <div
            key={`${reaction.data.key.id}-${index}`}
            className="bg-white border border-gray-200 rounded-full px-1 py-1 shadow-sm text-sm"
            style={{ transform: 'translateY(50%)' }}
          >
            {reaction.data.message.conversation || reaction.content || "👍"}
          </div>
        ))}
      </div>
    );
  };

  const renderMessageContent = (
    msg: NewMessagePayload,
    fromMe: boolean,
    showTimestamp: boolean
  ) => {
    const quotedMessage = (msg.mediaType !== MediaEnum.REACTION && msg.quotedMessageEvolutionId)
      ? regularMessages.find(m => m.data.key.id === msg.quotedMessageEvolutionId)
      : null;
    switch (msg.mediaType) {
      case MediaEnum.IMAGE:
        return (
          <div className="relative max-w-full group">
            <div className={`p-2 shadow-sm flex flex-col gap-2 ${fromMe ? "bg-black text-white rounded-l-xl rounded-t-xl" : "bg-white border border-gray-100 rounded-r-xl rounded-t-xl"
              } w-64 relative`}>
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <img
                src={msg.contentUrl}
                alt={fromMe ? "Imagem enviada" : "Imagem recebida"}
                className="max-w-full w-64 h-64 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  if (msg.contentUrl) {
                    setPreviewUrl(msg.contentUrl);
                  }
                }}
              />
              {msg.caption && <p className={`${fromMe ? "text-white" : "text-black"}`}> {msg.caption}</p>}
              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div >
        );
      case MediaEnum.AUDIO:
        return (
          <div className="relative max-w-full group">
            <div
              className={`p-4 shadow-sm relative ${fromMe ? "bg-black text-white rounded-l-xl rounded-t-xl" : "bg-white border border-gray-100 rounded-r-xl rounded-t-xl"
                } w-64`}
            >
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`rounded-full  w-10 h-10 p-0 flex-shrink-0 ${fromMe ? " text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  onClick={() => {
                    const audio = document.getElementById(`audio-${msg.data.key.id}`) as HTMLAudioElement
                    if (playingAudio === msg.data.key.id) {
                      audio.pause()
                      setPlayingAudio(null)
                    } else {
                      if (playingAudio) {
                        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement
                        currentAudio?.pause()
                      }
                      audio.play()
                      setPlayingAudio(msg.data.key.id)
                    }
                  }}
                >
                  {playingAudio === msg.data.key.id ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-0.5 rounded-full transition-all duration-200 ${fromMe ? "bg-gray-600" : "bg-gray-300"
                            }`}
                          style={{
                            height: `${Math.random() * 16 + 8}px`,
                            opacity: playingAudio === msg.data.key.id && i < 8 ? 1 : 0.6,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
                      {playingAudio === msg.data.key.id ? "Reproduzindo..." : "Áudio"}
                    </span>
                    <span className={`text-xs ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
                      {msg.audioDuration ? `${Math.floor(msg.audioDuration / 60)}:${(msg.audioDuration % 60).toString().padStart(2, "0")}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <audio
                id={`audio-${msg.data.key.id}`}
                src={msg.contentUrl}
                onEnded={() => setPlayingAudio(null)}
                onLoadedMetadata={(e) => {
                  const audio = e.target as HTMLAudioElement
                  const duration = Math.floor(audio.duration)
                  const minutes = Math.floor(duration / 60)
                  const seconds = duration % 60
                  const timeElement = document.querySelector(`#time-${msg.data.key.id}`)
                  if (timeElement) {
                    timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
                  }
                }}
                className="hidden"
              />
              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div>
        )
      case MediaEnum.VIDEO:
        return (
          <div className="relative max-w-full group">
            <div className={`p-2 shadow-sm flex flex-col gap-2 relative ${fromMe ? "bg-black text-white rounded-l-xl rounded-t-xl" : "bg-white border border-gray-100 rounded-r-xl rounded-t-xl"
              } w-64`}>
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <video controls className="max-w-full w-64 h-64 object-cover rounded-lg cursor-pointer">
                <source src={msg.contentUrl} type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
              {msg.caption && <p className={`${fromMe ? "text-white" : "text-black"}`}> {msg.caption}</p>}
              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div>
        );
      case MediaEnum.DOCUMENT:
        const fileName = msg.contentUrl?.split('/').pop() || "documento";
        return (
          <div className="relative max-w-full group">
            <div className={`p-4 rounded-lg relative ${fromMe ? "bg-black text-white" : "bg-white"} w-full`}>
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-6 w-6 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{fileName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`w-full flex items-center gap-2 ${fromMe ? "bg-gray-800  text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => {
                  if (msg.contentUrl) {
                    window.open(msg.contentUrl, '_blank');
                  }
                }}
              >
                <Download className="h-4 w-4 flex-shrink-0" />
                <span>Baixar</span>
              </Button>
              {msg.caption && <p className={`${fromMe ? "text-white" : "text-black"} mt-2`}> {msg.caption}</p>}
              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div>
        );

      case MediaEnum.CONTACT:
        let contactData;
        try {
          contactData = JSON.parse(msg.content || '{}');
        } catch {
          contactData = { displayName: 'Contato', phone: '' };
        }
        return (
          <div className="relative max-w-full group">
            <div className={`p-4 rounded-lg relative ${fromMe ? "bg-black text-white" : "bg-white border border-gray-100"} w-full max-w-sm`}>
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${fromMe ? "bg-gray-700" : "bg-gray-100"}`}>
                  <User className={`w-6 h-6 ${fromMe ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${fromMe ? "text-white" : "text-gray-900"}`}>
                    {contactData.displayName || 'Contato'}
                  </h3>
                  {contactData.phone && (
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className={`w-3 h-3 ${fromMe ? "text-gray-300" : "text-gray-500"}`} />
                      <span className={`text-sm ${fromMe ? "text-gray-300" : "text-gray-500"}`}>
                        {formatPhone(contactData.phone)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full flex items-center gap-2 ${fromMe ? "bg-gray-800 text-white border-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}
                  onClick={async () => {
                    if (contactData.phone && contactData.displayName) {
                      try {
                        const cleanPhone = contactData.phone.replace(/\D/g, '');
                        await createContact(cleanPhone, contactData.displayName);
                        toast({ description: "Contato salvo com sucesso!" });
                      } catch (error) {
                        console.error("Erro ao salvar contato:", error);
                        toast({
                          description: "Erro ao salvar contato",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        description: "Informações do contato incompletas",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <UserPlus className="h-4 w-4 flex-shrink-0" />
                  <span>Salvar Contato</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full flex items-center gap-2 ${fromMe ? "bg-gray-800 text-white border-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}
                  onClick={async () => {
                    if (contactData.phone && contactData.displayName) {
                      try {
                        const cleanPhone = contactData.phone.replace(/\D/g, '');

                        const newTicket = await createTicketFromContact(cleanPhone, contactData.displayName);

                        if (newTicket) {
                          selectChat(newTicket as Ticket);
                        } else {
                          toast({
                            description: "Erro ao criar conversa",
                            variant: "destructive"
                          });
                        }

                      } catch (error) {
                        console.error("Erro ao iniciar conversa:", error);
                        toast({
                          description: "Erro ao iniciar conversa",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        description: "Informações do contato incompletas",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span>Iniciar Conversa</span>
                </Button>
              </div>

              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div>
        );

      case MediaEnum.REACTION:
        return null;

      default:
        const messageText = msg.data.message.conversation;
        const isLinkMessage = isLink(messageText);
        return (
          <div className="relative max-w-full group">
            <div className={`px-4 py-2 whitespace-pre-wrap break-all relative ${fromMe
              ? "bg-black text-white rounded-l-xl rounded-t-xl"
              : "bg-white rounded-r-xl rounded-t-xl"
              }`}>
              {quotedMessage && (
                <QuotedMessage quotedMessage={quotedMessage} fromMe={fromMe} onQuoteClick={handleQuoteClick} />
              )}
              <p>
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
              </p>
              {renderReactions(msg.data.key.id)}
            </div>
            <div className="absolute top-2 right-2 z-20">
              <MessageOptions message={msg} onReply={handleReply} fromMe={fromMe} />
            </div>
            {showTimestamp && <MessageTimestamp timestamp={msg.data.messageTimestamp} fromMe={fromMe} />}
          </div>
        );
    }
  };

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

  const filteredMessages = React.useMemo(() => {
    if (!selectedChat) return [];
    return messages.filter(
      (m) => m.contactId === selectedChat.Contact.remoteJid
    );
  }, [messages, selectedChat]);

  const { regularMessages, reactions } = React.useMemo(() => {
    const regular: NewMessagePayload[] = [];
    const reactionMap: { [messageId: string]: NewMessagePayload[] } = {};

    filteredMessages.forEach(msg => {
      if (msg.mediaType === MediaEnum.REACTION) {
        if (msg.quotedMessageEvolutionId) {
          if (!reactionMap[msg.quotedMessageEvolutionId]) {
            reactionMap[msg.quotedMessageEvolutionId] = [];
          }
          reactionMap[msg.quotedMessageEvolutionId].push(msg);
        }
      } else {
        regular.push(msg);
      }
    });

    return {
      regularMessages: regular,
      reactions: reactionMap
    };
  }, [filteredMessages]);

  const orderedMessages = React.useMemo(() => {
    return [...regularMessages].sort(
      (a, b) => a.data.messageTimestamp - b.data.messageTimestamp
    );
  }, [regularMessages]);

  useEffect(() => {
    if (!isLoadingMore && page === 1) {
      setTimeout(scrollToBottom, 0)
    }
  }, [orderedMessages, isLoadingMore]);

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

  const groupedMessages = React.useMemo(() => {
    if (!orderedMessages.length) return [];

    const groups: NewMessagePayload[][] = [];
    let currentGroup: NewMessagePayload[] = [];
    let currentSender = orderedMessages[0].data.key.fromMe;

    orderedMessages.forEach((msg, index) => {
      const isFromMe = msg.data.key.fromMe;

      if (isFromMe !== currentSender) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [msg];
        currentSender = isFromMe;
      } else {
        currentGroup.push(msg);
      }

      if (index === orderedMessages.length - 1) {
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [orderedMessages]);

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
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-4 pt-4" ref={scrollRef} onScroll={handleScroll}>
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <PulseLoader
            color="black"
            size={10}
            speedMultiplier={1.5}
          />
        </div>
      )}
      {groupedMessages.map((group, groupIndex) => {
        const fromMe = group[0].data.key.fromMe;
        return (
          <div
            key={`${group[0].data.key.id}-${groupIndex}`}
            className={`flex ${fromMe ? "justify-end" : "justify-start"} w-full mb-2`}
          >
            <div className={`max-w-[70%] ${fromMe ? "ml-auto" : "mr-auto"} flex items-start gap-2 ${fromMe ? "flex-row-reverse" : ""}`}>
              {!fromMe ? (
                <UserAvatar
                  name={selectedChat.Contact.name}
                  pictureUrl={selectedChat.Contact.pictureUrl}
                  className="w-8 h-8 flex-shrink-0 mt-1"
                />
              ) : (
                <UserAvatar
                  name={user?.userName || ""}
                  pictureUrl={user?.companyImage}
                  className="w-8 h-8 flex-shrink-0 mt-1"
                />
              )}
              <div className={`flex flex-col ${fromMe ? "items-end" : "items-start"}`}>
                {group.map((msg, msgIndex) => {
                  const isLastMessage = msgIndex === group.length - 1;
                  return (
                    <div
                      key={msg.data.key.id}
                      className="mb-1"
                      ref={(el) => {
                        messageRefs.current[msg.data.key.id] = el;
                      }}
                    >
                      {renderMessageContent(msg, fromMe, isLastMessage)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Preview da imagem"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}

      <div id="messages-end" />
    </div>
  );
};

export default ChatBody;