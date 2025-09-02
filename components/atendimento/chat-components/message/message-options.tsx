"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Reply, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewMessagePayload, MediaEnum } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { deleteMessage } from "@/service/messageService";

interface MessageOptionsProps {
    message: NewMessagePayload;
    onReply: (message: NewMessagePayload) => void;
    fromMe: boolean;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({ message, onReply, fromMe }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { removeMessage } = useChatStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReply = () => {
        onReply(message);
        setIsOpen(false);
    };

    const handleCopy = async () => {
        try {
            let textToCopy = "";

            if (message.mediaType === MediaEnum.TEXT) {
                textToCopy = message.data.message.conversation || "";
            } else if (message.caption) {
                textToCopy = message.caption;
            }

            if (textToCopy) {
                await navigator.clipboard.writeText(textToCopy);
            }
        } catch (error) {
            console.error("Erro ao copiar mensagem:", error);
        }
        setIsOpen(false);
    };

    const handleDelete = async () => {
        try {
            removeMessage(message.data.key.id);

            await deleteMessage(message.data.key.id);

        } catch (error) {
            console.error("Erro ao deletar mensagem:", error);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative z-10" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${fromMe ? " text-white" : "hover:bg-gray-100 text-gray-600"
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChevronDown className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[160px]">
                    <div className="py-1">
                        <button
                            onClick={handleReply}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Reply className="h-4 w-4" />
                            Responder
                        </button>

                        {(message.mediaType === MediaEnum.TEXT || message.caption) && (
                            <button
                                onClick={handleCopy}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                Copiar
                            </button>
                        )}

                        {fromMe && (
                            <button
                                onClick={handleDelete}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageOptions;
