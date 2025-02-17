import { apiHelper } from "@/lib/apiHelper";

export const syncContacts = async () => {
  return apiHelper.post("/contacts");
};

