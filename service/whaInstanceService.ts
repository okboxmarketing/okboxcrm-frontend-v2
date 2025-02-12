import { apiHelper } from "@/lib/apiHelper";

export const getInstance = async () => {
  return apiHelper.get("/wha-instance");
};

export const connect = async () => {
  const response = await apiHelper.get("/wha-instance/connect");
  return response.base64;
};

export const isConnected = async () => {
  try {
    const response = await apiHelper.post("/wha-instance/status");
    return response;
  } catch {
    return false;
  }
};
