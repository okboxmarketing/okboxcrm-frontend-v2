import { apiHelper } from "@/lib/apiHelper";
import { Message, Ticket, TicketStatusEnum } from "@/lib/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

interface ListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const getTickets = async (
  status: TicketStatusEnum,
  cursor?: string,
  limit?: number,
  kanbanStepId?: number,
  onlyActive?: boolean
) => {
  const params = new URLSearchParams();
  params.append('status', status);
  if (cursor) params.append('cursor', cursor);
  if (limit) params.append('limit', limit.toString());
  if (kanbanStepId) params.append('kanbanStepId', kanbanStepId.toString());
  if (onlyActive) params.append('onlyActive', 'true');

  return apiHelper.get<PaginatedResponse<Ticket>>(`/tickets?${params.toString()}`);
};

export const listTickets = async (
  page: number = 1,
  limit: number = 20,
  kanbanStepId?: number,
  status?: TicketStatusEnum
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (kanbanStepId) params.append('kanbanStepId', kanbanStepId.toString());
  if (status) params.append('status', status);

  return apiHelper.get<ListResponse<Ticket>>(`/tickets/list?${params.toString()}`);
};

interface PaginationMeta {
  total: number;
  page: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const getMessagesByContactId = async (
  contactId: string,
  page: number = 1
): Promise<{ data: Message[]; meta: PaginationMeta }> => {
  return apiHelper.get<{ data: Message[]; meta: PaginationMeta }>(
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

interface TicketCounts {
  pending: number;
  unread: number;
}

export const getTicketCounts = async () => {
  return apiHelper.get<TicketCounts>('/tickets/counts');
};