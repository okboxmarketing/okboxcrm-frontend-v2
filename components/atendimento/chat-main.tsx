"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, ShoppingCart, MoveDownRight, Check, X } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { NewMessagePayload, Ticket } from "@/lib/types";
import { sendTextMessage } from "@/service/messageService";
import { useForm } from "react-hook-form";
import { useRef } from "react";

interface ChatMainProps {
  selectedChat: Ticket | null;
  messages: NewMessagePayload[];
}

interface FormData {
  text: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ selectedChat, messages }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  // Rolagem para o fim do chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado para armazenar a imagem expandida
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Abrir imagem
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fechar imagem
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseImage();
      }
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const onSubmit = async (data: FormData) => {
    if (!selectedChat) return;
    try {
      await sendTextMessage(selectedChat.Contact.remoteJid, data.text);
      reset();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
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
            {selectedChat.status != "PENDING" && (
              < div className="flex items-center gap-4">
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
          <div className="flex-1 overflow-y-auto pt-4 pb-20 px-4 space-y-2">
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
                      {msg.isImage ? (
                        <img
                          src={msg.imageUrl}
                          alt="Imagem enviada"
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                          onClick={() => msg.imageUrl && handleImageClick(msg.imageUrl)}
                        />
                      ) : (
                        <p className="bg-black text-white px-4 py-1 rounded-l-xl rounded-t-xl">
                          {msg.data.message.conversation}
                        </p>
                      )}
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
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {msg.isImage ? (
                        <img
                          src={msg.imageUrl}
                          alt="Imagem recebida"
                          className="w-80 h-80 object-cover rounded-lg cursor-pointer"
                          onClick={() => msg.imageUrl && handleImageClick(msg.imageUrl)}
                        />
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
                />
                <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-black hover:bg-black/80">
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500">Selecione um contato para iniciar o chat</p>
        </div>
      )
      }
      {/* Modal de Imagem Expandida */}
      {
        selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={handleCloseImage}
          >
            <div className="relative max-w-screen-lg max-h-screen-lg" onClick={(e) => e.stopPropagation()}>
              {/* Botão de Fechar */}
              <button
                onClick={handleCloseImage}
                className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Imagem Expandida */}
              <img
                src={selectedImage}
                alt="Imagem expandida"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ChatMain;
