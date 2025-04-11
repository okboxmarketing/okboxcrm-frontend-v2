"use client";
import { Ticket } from "@/lib/types";
import { TicketItem } from "./ticket-item";
import { TicketItemSkeleton } from "@/components/skeleton/ticket-item-skeleton";

interface TicketListProps {
    tickets: Ticket[];
    selectedChat: Ticket | null;
    onSelectChat: (ticket: Ticket) => void;
    onAcceptTicket?: (ticket: Ticket) => void;
    showAcceptButton?: boolean;
    type: "OPEN" | "PENDING";
    loading?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({
    tickets,
    selectedChat,
    onSelectChat,
    onAcceptTicket,
    showAcceptButton = false,
    type,
    loading = false
}) => {
    if (loading) {
        return (
            <div>
                {[...Array(6)].map((_, index) => (
                    <TicketItemSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div>
            {tickets.map((ticket) => (
                <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={selectedChat?.id === ticket.id}
                    onClick={() => onSelectChat(ticket)}
                    onAccept={() => onAcceptTicket?.(ticket)}
                    showAcceptButton={showAcceptButton}
                    type={type}
                />
            ))}
        </div>
    );
};
