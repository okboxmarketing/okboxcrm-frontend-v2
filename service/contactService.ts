import { apiHelper } from "@/lib/apiHelper";
import { Contact } from "@/lib/types";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

export const getContacts = async (page = 1) => {
  return apiHelper.get<{ data: Contact[]; totalPages: number; total: number }>(`/contacts?page=${page}`);
};

export const createContact = async (number: string, name: string) => {
  return apiHelper.post("/contacts/new", { number, name });
}

export const findContact = async (name: string) => {
  return apiHelper.get<Contact[]>(`/contacts/find?param=${name}`);
}

export const deleteContact = async (remoteJid: string) => {
  return apiHelper.delete(`/contacts/${remoteJid}`);
}