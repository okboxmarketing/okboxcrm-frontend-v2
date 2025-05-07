import { apiHelper } from "@/lib/apiHelper";
import { Message, Ticket } from "@/lib/types";

export const getTickets = async () => {
  return apiHelper.get<Ticket[]>(`/tickets`);
};

interface MessagePaginadas {
  data: Message[];
  meta: PaginationMeta
}

interface PaginationMeta {
  total: number;
  page: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface TicketsPaginados {
  data: Ticket[];
  meta: PaginationMeta
}

export const getMessagesByContactId = async (
  contactId: string,
  page: number = 1
): Promise<MessagePaginadas> => {
  return apiHelper.get<MessagePaginadas>(
    `/tickets/messages/${contactId}?page=${page}`,
  );
};

export const acceptTicket = async (ticketId: number) => {
  return apiHelper.post(`/tickets/accept/${ticketId}`);
}

export const moveTicket = async (stepId: number, ticketId: string) => {
  return apiHelper.post(`/tickets/move/${stepId}/${ticketId}`);
}

export const createTicket = async (remoteJid: string) => {
  return apiHelper.post(`/tickets`, { remoteJid });
}

export const deleteTicket = async (ticketId: number) => {
  return apiHelper.delete(`/tickets/${ticketId}`);
}

export const refreshTicket = async (ticketId: number) => {
  return apiHelper.get<Ticket>(`/tickets/id/${ticketId}`);
}

export const hideTicket = async (ticketId: number) => {
  console.log("Hiding ticket", ticketId);
  return apiHelper.post(`/tickets/hide/${ticketId}`);
}

export const getHiddenTickets = async () => {
  return apiHelper.get<Ticket[]>(`/tickets/hidden`);
}

export const unhideTicket = async (ticketId: number) => {
  return apiHelper.post(`/tickets/unhide/${ticketId}`);
}

export const getTicketsByStatus = async (status: string, page: number = 1) => {
  return apiHelper.get<TicketsPaginados>(`/tickets/status/${status}?page=${page}`);
}