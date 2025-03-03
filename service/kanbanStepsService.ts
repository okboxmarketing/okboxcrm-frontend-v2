import { apiHelper } from "@/lib/apiHelper";
import { KanbanStep } from "@/lib/types";

export const getKanbanSteps = async () => {
  return apiHelper.get<KanbanStep[]>(`/kanban-steps`);
}

export const createKanbanStep = async (name: string, color: string) => {
  return apiHelper.post(`/kanban-steps`, { name, color });
}

export const removeKanbanStep = async (stepId: number) => {
  return apiHelper.delete(`/kanban-steps/${stepId}`);
}

export const getKanbanStepByTicketId = async (ticketId: number) => {
  return apiHelper.get<KanbanStep>(`/kanban-steps/${ticketId}`);
}