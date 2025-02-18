import { apiHelper } from "@/lib/apiHelper";
import { Ticket, TicketStatusEnum } from "@/lib/types";


export const getTickets = async (status: TicketStatusEnum) => {
  return apiHelper.get<Ticket[]>(`/tickets/${status}`);
};