import { apiHelper } from "@/lib/apiHelper";
import { KanbanStep, Ticket } from "@/lib/types";

export const getKanbanBoard = async () => {
    return apiHelper.get<KanbanStep[]>(`/kanban-steps/board`);
}

export const getTicketsByStepId = async (stepId: number, page: number) => {
    return apiHelper.get<Ticket[]>(`/kanban-steps/steps/tickets/${stepId}?page=${page}`);
}