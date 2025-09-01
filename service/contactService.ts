import { apiHelper } from "@/lib/apiHelper";
import { Contact } from "@/lib/types";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

export const getContacts = async (page = 1, limit = 8, search?: string) => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return apiHelper.get<{ data: Contact[]; totalPages: number; total: number }>(`/contacts?page=${page}&limit=${limit}${searchParam}`);
};

export const createContact = async (number: string, name: string,) => {
  return apiHelper.post("/contacts/new", { number, name, origin: "CRM" });
}

export const createContactFromCRM = async (number: string, name: string) => {
  return apiHelper.post("/contacts/crm", { number, name });
}

export const deleteContact = async (remoteJid: string) => {
  return apiHelper.delete(`/contacts/${remoteJid}`);
}