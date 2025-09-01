"use client";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, ChevronDown, ChevronRight, EyeOff, FileIcon, Image as ImageIcon, Mic, Video, User, MessageSquare } from "lucide-react";
import { formatMessageTime, getContrastColor } from "@/lib/utils";
import { MediaEnum, Ticket } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { hideTicket } from "@/service/ticketsService";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { UserAvatar } from "@/components/ui/user-avatar";

interface TicketItemProps {
    ticket: Ticket;
    isSelected: boolean;
    onClick: () => void;
    onAccept?: () => void;
    showAcceptButton?: boolean;
    type: "OPEN" | "PENDING";
}

export const TicketItem: React.FC<TicketItemProps> = ({
    ticket,
    isSelected,
    onClick,
    onAccept,
    showAcceptButton = false,
    type
}) => {
    const isUnreadMessage = ticket.lastMessage && !ticket.lastMessage.fromMe && !ticket.lastMessage.read;
    const [confirmHideOpen, setConfirmHideOpen] = useState(false);
    const { removeTicket, selectChat } = useChatStore()

    const renderLastMessage = () => {
        if (!ticket.lastMessage) {
            return (
                <span className="text-blue-500 italic">
                    Inicie a conversa.
                </span>
            );
        }
        const checkIcon = ticket.lastMessage.fromMe && <CheckCheck className="h-4 w-4 text-gray-400" />;
        switch (ticket.lastMessage.mediaType) {
            case MediaEnum.IMAGE:
                return (
                    <>
                        {checkIcon}
                        <ImageIcon className="h-4 w-4 text-gray-400" /> Imagem
                    </>
                );
            case MediaEnum.AUDIO:
                return (
                    <>
                        {checkIcon}
                        <Mic className="h-4 w-4 text-gray-400" /> Áudio
                    </>
                );
            case MediaEnum.VIDEO:
                return (
                    <>
                        {checkIcon}
                        <Video className="h-4 w-4 text-gray-400" /> Vídeo
                    </>
                );
            case MediaEnum.DOCUMENT:
                return (
                    <>
                        {checkIcon}
                        <FileIcon className="h-4 w-4 text-gray-400" /> Documento
                    </>
                );
            case MediaEnum.CONTACT:
                return (
                    <>
                        {checkIcon}
                        <User className="h-4 w-4 text-gray-400" /> Contato
                    </>
                );
            case MediaEnum.REACTION:
                return (
                    <>
                        {checkIcon}
                        <MessageSquare className="h-4 w-4 text-gray-400" /> Reação
                    </>
                );
            case MediaEnum.CONTACT:
                return (
                    <>
                        {checkIcon}
                        <User className="h-4 w-4 text-gray-400" /> Contato
                    </>
                );
            default:
                return (
                    <>
                        {checkIcon}
                        {ticket.lastMessage.content || ""}
                    </>
                );
        }
    };

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer p-4 hover:bg-gray-50 ${type === "OPEN" ? "flex flex-col gap-1" : "flex items-center gap-3"
                } ${isSelected ? "bg-gray-50" : ""}`}
        >
            <div className="flex items-center gap-3 w-full">
                <UserAvatar name={ticket.Contact.name} pictureUrl={ticket.Contact.pictureUrl} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <p className={`truncate ${isUnreadMessage ? "font-bold text-black" : "text-gray-500"}`}>
                            {ticket.Contact.name}
                        </p>
                        <span className="text-xs text-gray-500">
                            {ticket.lastMessage?.createdAt ? formatMessageTime(ticket.lastMessage.createdAt) : ""}
                        </span>
                        {showAcceptButton && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </button>

                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setConfirmHideOpen(true)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Ocultar Ticket
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate flex items-center gap-2 ${isUnreadMessage ? "font-bold text-black" : "text-gray-500"}`}>
                            {isUnreadMessage && <span className="h-2 w-2 bg-black rounded-full" />}
                            {renderLastMessage()}
                        </p>
                        {showAcceptButton && (
                            <button onClick={(e) => { e.stopPropagation(); onAccept?.(); }}>
                                <Badge className="bg-green-500 hover:bg-green-500/70 whitespace-nowrap">ACEITAR</Badge>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {type === "OPEN" && (
                <div className="flex mt-2 gap-2">
                    {ticket.KanbanStep ? (
                        <span
                            className="text-xs px-2 py-1 rounded inline-block"
                            style={{
                                backgroundColor: ticket.KanbanStep.color,
                                color: getContrastColor(ticket.KanbanStep.color),
                            }}
                        >
                            {ticket.KanbanStep.name}
                        </span>
                    ) : (
                        <span className="text-xs px-2 py-1 rounded inline-block border border-red-500 text-red-500">
                            Sem Etapa
                        </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded inline-block bg-black text-white">
                        {ticket.Responsible?.name}
                    </span>
                </div>
            )}
            <Dialog open={confirmHideOpen} onOpenChange={setConfirmHideOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Você tem certeza?</DialogTitle>
                    </DialogHeader>
                    <p>Tem certeza que deseja ocultar este ticket? Ele não vai mais participar de seu atendimento, métricas e kanban.</p>
                    <Link href={{
                        pathname: "/home/tickets",
                        query: { tab: "hidden" },
                    }} className="flex items-center gap-2 text-blue-500 hover:text-blue-300 text-sm">
                        <ChevronRight />
                        Ver Tickets Ocultos
                    </Link>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmHideOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    await hideTicket(ticket.id);
                                    removeTicket(ticket.id);
                                    selectChat(null);
                                    setConfirmHideOpen(false);
                                } catch (error) {
                                    console.error("Erro ao ocultar ticket:", error);
                                }
                            }}>
                            Ocultar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};
