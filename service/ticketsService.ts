import { apiHelper } from "@/lib/apiHelper";
import { Message, Ticket, TicketStatusEnum } from "@/lib/types";

export const getTickets = async (status: TicketStatusEnum) => {
  return apiHelper.get<Ticket[]>(`/tickets/${status}`);
};

export const getMessagesByContactId = async (contactId: string) => {
  return apiHelper.get<Message[]>(`/tickets/messages/${contactId}`);
};

export const acceptTicket = async (ticketId: number) => {
  return apiHelper.post(`/tickets/accept/${ticketId}`);
}

export const moveTicket = async (stepId: number, ticketId: string) => {
  return apiHelper.post(`/tickets/${stepId}/${ticketId}`);
}