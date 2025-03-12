"use client";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, ShoppingCart, MoveDownRight, Check, X } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { MediaEnum, NewMessagePayload, Ticket } from "@/lib/types";
import { sendTextMessage } from "@/service/messageService";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface ChatMainProps {
  selectedChat: Ticket | null;
  messages: NewMessagePayload[];
}

interface FormData {
  text: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ selectedChat, messages: initialMessages }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<NewMessagePayload[]>(initialMessages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Sincroniza mensagens quando a conversa muda
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Rolagem automática para o fim das mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fechar modal de imagem com ESC
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

  // Enviar mensagem
  const onSubmit = async (data: FormData) => {
    if (!selectedChat) return;

    const tempMessageId = `temp-${Date.now()}`;

    // Criar mensagem temporária
    const tempMessage: NewMessagePayload = {
      contactId: selectedChat.Contact.remoteJid,
      data: {
        key: {
          fromMe: true,
          id: tempMessageId,
          remoteJid: selectedChat.Contact.remoteJid,
        },
        message: { conversation: data.text },
        messageType: "conversation",
        messageTimestamp: Date.now(),
        instanceId: "",
        pushName: "",
        status: "PENDING",
      },
      mediaType: MediaEnum.TEXT,
    };

    // Adicionar mensagem temporária na lista
    setMessages((prev) => [...prev, tempMessage]);

    try {
      reset();
      await sendTextMessage(selectedChat.Contact.remoteJid, data.text);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.data.key.id === tempMessageId ? { ...msg, data: { ...msg.data, status: "SENT" } } : msg
        )
      );

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Remover mensagem temporária
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
          {/* Topo do Chat */}
          <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-[#FAFAFA] z-10">
            <div className="flex items-center gap-3">
              <Avatar>
                {selectedChat.Contact.pictureUrl ? (
                  <AvatarImage src={selectedChat.Contact.pictureUrl} />
                ) : (
                  <AvatarFallback>{selectedChat.Contact.name[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="font-semibold">{selectedChat.Contact.name}</h2>
                {selectedChat.responsibleId && (
                  <p className="text-sm text-black/40">Acompanhado por: {selectedChat.Responsible?.name}</p>
                )}
              </div>
            </div>
            {selectedChat.status !== "PENDING" && (
              <div className="flex items-center gap-4">
                <MoveTicketSelect ticketId={selectedChat.id} />
                <Button>
                  <ShoppingCart />
                </Button>
                <Button>
                  <MoveDownRight />
                </Button>
              </div>
            )}
          </div>

          {/* Corpo do Chat */}
          <div className="flex-1 overflow-y-auto pt-4 pb-4 px-4 space-y-2">
            {messages
              .filter((msg) => msg.contactId === selectedChat.Contact.remoteJid)
              .map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${msg.data.key.fromMe ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.data.key.fromMe ? (
                    <div className="flex items-center gap-2">
                      {msg.mediaType === MediaEnum.IMAGE ? (
                        <img
                          src={msg.contentUrl}
                          alt="Imagem enviada"
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                          onClick={() => msg.contentUrl && setSelectedImage(msg.contentUrl)}
                        />
                      ) : msg.mediaType === MediaEnum.AUDIO ? (
                        <audio controls className="w-[300px]">
                          <source src={msg.contentUrl} type="audio/ogg" />
                          Seu navegador não suporta áudio.
                        </audio>
                      ) : msg.mediaType === MediaEnum.VIDEO ? (
                        <video
                          controls
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                        >
                          <source src={msg.contentUrl} type="video/mp4" />
                          Seu navegador não suporta vídeos.
                        </video>
                      ) : (
                        <p className="bg-black text-white px-4 py-1 rounded-l-xl rounded-t-xl">
                          {msg.data.message.conversation}
                        </p>
                      )}
                      <div className="flex items-center">
                        {msg.data.status === "PENDING" && <Check className="text-gray-400" size={16} />}
                        {(msg.data.status === "DELIVERY_ACK" || msg.data.status === "SERVER_ACK") && (
                          <div className="flex items-center gap-1">
                            <Check className="text-gray-400" size={16} />
                            <Check className="text-gray-400" size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {msg.mediaType === MediaEnum.IMAGE ? (
                        <img
                          src={msg.contentUrl}
                          alt="Imagem recebida"
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                          onClick={() => msg.contentUrl && setSelectedImage(msg.contentUrl)}
                        />
                      ) : msg.mediaType === MediaEnum.AUDIO ? (
                        <audio controls className="w-[300px]">
                          <source src={msg.contentUrl} type="audio/ogg" />
                          Seu navegador não suporta áudio.
                        </audio>
                      ) : msg.mediaType === MediaEnum.VIDEO ? (
                        <video
                          controls
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                        >
                          <source src={msg.contentUrl} type="video/mp4" />
                          Seu navegador não suporta vídeos.
                        </video>
                      ) : (
                        <p className="bg-white px-4 py-1 rounded-r-xl rounded-t-xl">
                          {msg.data.message.conversation}
                        </p>

                      )}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ))}
          </div>

          {/* Input do Chat */}
          {selectedChat.status !== "PENDING" && (
            <div className="sticky bottom-0 p-4 border-t bg-white">
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
                  <Input
                    {...register("text", { required: true })}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                    placeholder="Escreva aqui..."
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-black hover:bg-black/80">
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500">Selecione um contato para iniciar o chat</p>
        </div>
      )
      }
    </div >
  );
};

export default ChatMain;
