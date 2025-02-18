import { apiHelper } from "@/lib/apiHelper";
import { Contact } from "@/lib/types";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

export const getContacts = async () => {
  return apiHelper.get<Contact[]>("/contacts");
}