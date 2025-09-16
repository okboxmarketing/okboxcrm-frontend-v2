import { apiHelper } from "@/lib/apiHelper";
import { Loss, LossReason, LossesResponse } from "@/lib/types";
import { CreateLossDto } from "@/types/loss";


export const getLosses = async () => {
  try {
    return await apiHelper.get<LossesResponse>(`/losses`);
  } catch (error) {
    console.error("Error fetching losses:", error);
    throw error;
  }
};

export const getLossById = async (id: string) => {
  try {
    return await apiHelper.get<Loss>(`/losses/${id}`);
  } catch (error) {
    console.error("Error fetching loss:", error);
    throw error;
  }
};

export const createLoss = async (data: CreateLossDto) => {
  try {
    return await apiHelper.post<Loss>(`/losses`, data);
  } catch (error) {
    console.error("Error creating loss:", error);
    throw error;
  }
};

export const getLossReasons = async () => {
  try {
    return await apiHelper.get<LossReason[]>(`/loss-reasons`);
  } catch (error) {
    console.error("Error fetching loss reasons:", error);
    throw error;
  }
};

export const getLossReasonById = async (id: string) => {
  try {
    return await apiHelper.get<LossReason>(`/loss-reasons/${id}`);
  } catch (error) {
    console.error("Error fetching loss reason:", error);
    throw error;
  }
};

export const createLossReason = async (data: { description: string }) => {
  try {
    return await apiHelper.post<LossReason>(`/loss-reasons`, data);
  } catch (error) {
    console.error("Error creating loss reason:", error);
    throw error;
  }
};

export const updateLossReason = async (id: string, data: { description: string }) => {
  try {
    return await apiHelper.patch<LossReason>(`/loss-reasons/${id}`, data);
  } catch (error) {
    console.error("Error updating loss reason:", error);
    throw error;
  }
};

export const deleteLossReason = async (id: string) => {
  try {
    return await apiHelper.delete(`/loss-reasons/${id}`);
  } catch (error) {
    console.error("Error deleting loss reason:", error);
    throw error;
  }
};

export const getLossesByTicketId = async (ticketId: number) => {
  try {
    return await apiHelper.get<Loss[]>(`/losses/ticket/${ticketId}`);
  } catch (error) {
    console.error("Erro ao buscar perdas:", error);
    throw error;
  }
};