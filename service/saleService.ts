import { apiHelper } from "@/lib/apiHelper";
import { Sale } from "@/lib/types";

interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface SaleCreateData {
  ticketId: number;
  items: SaleItem[];
}

export const getSales = async () => {
  try {
    return await apiHelper.get<Sale[]>("/sales");
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

export const getSaleById = async (id: string) => {
  try {
    return await apiHelper.get<Sale>(`/sales/${id}`);
  } catch (error) {
    console.error("Error fetching sale:", error);
    throw error;
  }
};

export const createSale = async (saleData: SaleCreateData) => {
  try {
    return await apiHelper.post<Sale>("/sales", saleData);
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
};

export const getSalesByTicketId = async (ticketId: number) => {
  try {
    return await apiHelper.get<Sale[]>(`/sales/ticket/${ticketId}`);
  } catch (error) {
    console.error("Error fetching sales by ticket:", error);
    throw error;
  }
};
