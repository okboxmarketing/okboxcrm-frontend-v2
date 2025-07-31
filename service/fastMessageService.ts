import { apiHelper } from '@/lib/apiHelper';

export type MediaType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';

export interface FastMessage {
    id: number;
    companyId: string;
    title: string;
    content?: string;
    shortCode?: string;
    mediaType: MediaType;
    fileUrl?: string;
    createdAt: string;
}

export interface CreateFastMessageData {
    title: string;
    content?: string;
    shortCode?: string;
}

export interface UpdateFastMessageData {
    title: string;
    content?: string;
    shortCode?: string;
}

export const getFastMessages = async (): Promise<FastMessage[]> => {
    return apiHelper.get('/fastMessage');
};

export const getFastMessageById = async (id: number): Promise<FastMessage> => {
    return apiHelper.get(`/fastMessage/${id}`);
};

export const createFastMessage = async (data: CreateFastMessageData): Promise<FastMessage> => {
    return apiHelper.post('/fastMessage', data);
};

export const updateFastMessage = async (id: number, data: UpdateFastMessageData): Promise<FastMessage> => {
    return apiHelper.patch(`/fastMessage/${id}`, data);
};

export const deleteFastMessage = async (id: number): Promise<void> => {
    return apiHelper.delete(`/fastMessage/${id}`);
};

export const getFastMessagesByMediaType = async (mediaType: string): Promise<FastMessage[]> => {
    return apiHelper.get(`/fastMessage?mediaType=${mediaType}`);
}; 