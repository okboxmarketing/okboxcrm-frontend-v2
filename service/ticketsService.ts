import { apiHelper } from "@/lib/apiHelper";
import { Message, Ticket, TicketStatusEnum } from "@/lib/types";

export const getTickets = async (status: TicketStatusEnum) => {
  return apiHelper.get<Ticket[]>(`/tickets/${status}`);
};

export const getMessagesByContactId = async (contactId: string) => {
  return apiHelper.get<Message[]>(`/tickets/messages/${contactId}`);
};