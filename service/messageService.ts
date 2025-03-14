import { apiHelper } from "@/lib/apiHelper";

export const sendTextMessage = async (remoteJId: string, text: string) => {
  await apiHelper.post('/message/text', { remoteJId, text });
}

export interface SendMediaParams {
  remoteJId: string;
  mediaType: "image" | "video" | "document";
  mimeType: string;
  caption?: string;
  media: string; // base64
  fileName: string;
}

export const sendMediaMessage = async (params: SendMediaParams) => {
  console.log("Sending Media: ", params)
  await apiHelper.post('/message/media', params);
}