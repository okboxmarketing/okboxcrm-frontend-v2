import { apiHelper } from "@/lib/apiHelper";

export interface InstanceData {
  profileName: string;
  profilePicUrl: string;
  phoneNumber: string;
  messagesCount: number;
  chatsCount: number;
  contactsCount: number;
  createdAt: string;
  updatedAt: string;
  groupIgnore: boolean;
}

export const getInstance = async () => {
  return apiHelper.get<InstanceData>("/wha-instance");
};

export const connect = async () => {
  return await apiHelper.post<string>("/wha-instance/connect");
};

export const getStatus = async () => {
  return await apiHelper.get("/wha-instance/status");
};

export const logoutInstance = async () => {
  return apiHelper.post("/wha-instance/logout");
};
