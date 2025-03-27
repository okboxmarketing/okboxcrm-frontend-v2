import { apiHelper } from "@/lib/apiHelper";
import { Message, Ticket } from "@/lib/types";

export const getTickets = async () => {
  return apiHelper.get<Ticket[]>(`/tickets`);
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

export const createTicket = async (remoteJid: string) => {
  return apiHelper.post(`/tickets`, { remoteJid });
}