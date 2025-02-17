import { apiHelper } from "@/lib/apiHelper";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

export const getContacts = async () => {
  return apiHelper.get("/contacts");
}