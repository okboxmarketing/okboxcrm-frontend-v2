import { apiHelper } from "@/lib/apiHelper";

export const sendTextMessage = async (remoteJId: string, text: string) => {
  await apiHelper.post('/message/text', { remoteJId, text });
}