import { apiHelper } from "@/lib/apiHelper";

export const sendTextMessage = async (remoteJId: string, text: string) => {
  await apiHelper.post('/message/text', { remoteJId, text });
}

export interface SendMediaParams {
  remoteJId: string;
  mediaType: "image" | "video" | "document";
  mimeType: string;
  caption?: string;
  media: string;
  fileName: string;
}

export const sendMediaMessage = async (params: SendMediaParams) => {
  await apiHelper.post('/message/media', params);
}

export const sendAudioMessage = async (remoteJId: string, media: string) => {
  await apiHelper.post('/message/audio', { remoteJId, media });
}