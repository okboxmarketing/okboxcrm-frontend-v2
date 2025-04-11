"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Image as ImageIcon, Mic, Video } from "lucide-react";
import { formatMessageTime, getContrastColor } from "@/lib/utils";
import { MediaEnum, Ticket } from "@/lib/types";

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

    const renderLastMessage = () => {
        if (!ticket.lastMessage) return null;
        const checkIcon = ticket.lastMessage.fromMe && <Check className="h-4 w-4 text-gray-400" />;
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
                <Avatar>
                    {ticket.Contact.pictureUrl ? (
                        <AvatarImage src={ticket.Contact.pictureUrl} />
                    ) : (
                        <AvatarFallback>{ticket.Contact.name[0]}</AvatarFallback>
                    )}
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <p className={`truncate ${isUnreadMessage ? "font-bold text-black" : "text-gray-500"}`}>
                            {ticket.Contact.name}
                        </p>
                        <span className="text-xs text-gray-500">
                            {ticket.lastMessage?.createdAt ? formatMessageTime(ticket.lastMessage.createdAt) : ""}
                        </span>
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
        </div>
    );
};
