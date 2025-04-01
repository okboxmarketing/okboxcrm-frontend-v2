import { apiHelper } from "@/lib/apiHelper";
import { KanbanStep } from "@/lib/types";

export const getKanbanSteps = async () => {
  return apiHelper.get<KanbanStep[]>(`/kanban-steps`);
}

export const createKanbanStep = async (name: string, color: string, position: number) => {
  return apiHelper.post(`/kanban-steps`, { name, color, position });
}

export const removeKanbanStep = async (stepId: number) => {
  return apiHelper.delete(`/kanban-steps/${stepId}`);
}

export const getKanbanStepByTicketId = async (ticketId: number) => {
  return apiHelper.get<KanbanStep>(`/kanban-steps/${ticketId}`);
}

export const updateKanbanStep = async (stepId: number, name: string, color: string) => {
  return apiHelper.patch(`/kanban-steps/${stepId}`, { name, color });
}