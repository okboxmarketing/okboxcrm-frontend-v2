import { apiHelper } from "@/lib/apiHelper";
import { Contact } from "@/lib/types";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

export const getContacts = async (page = 1) => {
  return apiHelper.get<{ data: Contact[]; totalPages: number; total: number }>(`/contacts?page=${page}`);
};
