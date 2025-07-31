import { apiHelper } from "@/lib/apiHelper";
import { Loss } from "@/lib/types";

export interface Help {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHelpDto {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
}

export const getLosses = async () => {
  try {
    return await apiHelper.get<Loss[]>(`/losses`);
  } catch (error) {
    console.error("Error fetching losses:", error);
    throw error;
  }
};

export const getHelps = async () => {
  try {
    return await apiHelper.get<Help[]>(`/ajudas`);
  } catch (error) {
    console.error("Error fetching helps:", error);
    throw error;
  }
};

export const createHelp = async (data: CreateHelpDto) => {
  try {
    return await apiHelper.post<Help>(`/ajudas`, data);
  } catch (error) {
    console.error("Error creating help:", error);
    throw error;
  }
};

export const deleteHelp = async (id: number) => {
  try {
    return await apiHelper.delete(`/ajudas/${id}`);
  } catch (error) {
    console.error("Error deleting help:", error);
    throw error;
  }
};
