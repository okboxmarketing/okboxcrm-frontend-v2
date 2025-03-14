import { apiHelper } from "@/lib/apiHelper";

interface Loss {
  id: string;
  ticketId: number;
  reason: string;
  observation: string;
  createdAt: string;
  Ticket: {
    Contact: {
      name: string;
      phone: string;
    };
    Responsible: {
      name: string;
    };
  };
}

interface LossReason {
  id: string;
  description: string;
  companyId: string;
  createdAt: string;
}

// Loss endpoints
export const getLosses = async () => {
  try {
    return await apiHelper.get<Loss[]>(`/losses`);
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

export const createLoss = async (data: { ticketId: number; reason: string; description?: string }) => {
  try {
    return await apiHelper.post<Loss>(`/losses`, data);
  } catch (error) {
    console.error("Error creating loss:", error);
    throw error;
  }
};

// Loss Reason endpoints
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
    return await apiHelper.delete<void>(`/loss-reasons/${id}`);
  } catch (error) {
    console.error("Error deleting loss reason:", error);
    throw error;
  }
};