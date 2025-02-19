import { apiHelper } from "@/lib/apiHelper";

export const getInstance = async () => {
  return apiHelper.get("/wha-instance");
};

export const connect = async () => {
  const response: { base64: string } = await apiHelper.get("/wha-instance/connect");
  return response.base64;
};

export const getStatus = async () => {
  try {
    const status = await apiHelper.get("/wha-instance/status");
    console.log(status)
    return status
  } catch {
    return false;
  }
};

export const createInstance = async () => {
  return apiHelper.post("/wha-instance");
}