import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { getTickets, getMessagesByContactId } from '@/service/ticketsService';
import { sendTextMessage } from '@/service/messageService';
import {
    NewMessagePayload,
    Ticket,
    TicketStatusEnum,
    Message,
    MediaEnum,
} from '@/lib/types';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

interface ChatState {
    tickets: Ticket[];
    messages: NewMessagePayload[];
    selectedChat: Ticket | null;
    tab: TicketStatusEnum;
    socket: Socket | null;
    fetchTickets: () => Promise<void>;
    setTab: (tab: TicketStatusEnum) => void;
    selectChat: (ticket: Ticket | null) => void;
    sendMessage: (text: string) => Promise<void>;
    initialize: () => void;
    removeTicket: (id: number) => void;

    page: number;
    hasNextPage: boolean;
    isLoadingMore: boolean;
    fetchMessages: (page?: number) => Promise<void>;
    fetchMoreMessages: () => Promise<void>;
    isLoadingMessages: boolean;
}

export const useChatStore = create<ChatState>((set, get) => ({
    tickets: [],
    messages: [],
    page: 1,
    hasNextPage: false,
    isLoadingMore: false,
    selectedChat: null,
    tab: "OPEN",
    socket: null,
    isLoadingMessages: false,

    fetchTickets: async () => {
        try {
            const data = await getTickets();
            set({ tickets: data });
        } catch (err) {
            console.error('Erro ao buscar tickets:', err);
        }
    },

    fetchMessages: async (page = 1) => {
        const chat = get().selectedChat;
        if (!chat) return;
        set({ isLoadingMore: page > 1, isLoadingMessages: page === 1 });
        try {
            const { data, meta } = await getMessagesByContactId(
                chat.Contact.remoteJid,
                page
            );
            const formatted: NewMessagePayload[] = data.map((msg: Message) => {
                let mediaType = MediaEnum.TEXT;
                let contentUrl: string | undefined;
                let conversation = msg.content;

                switch (msg.mediaType) {
                    case MediaEnum.IMAGE:
                        mediaType = MediaEnum.IMAGE;
                        contentUrl = msg.content;
                        conversation = '';
                        break;

                    case MediaEnum.AUDIO:
                        mediaType = MediaEnum.AUDIO;
                        contentUrl = msg.content;
                        conversation = '';
                        break;

                    case MediaEnum.VIDEO:
                        mediaType = MediaEnum.VIDEO;
                        contentUrl = msg.content;
                        conversation = '';
                        break;

                    case MediaEnum.DOCUMENT:
                        mediaType = MediaEnum.DOCUMENT;
                        contentUrl = msg.content;
                        conversation = '';
                        break;

                    default:
                        mediaType = MediaEnum.TEXT;
                        break;
                }

                return {
                    contactId: msg.contactId,
                    data: {
                        key: {
                            fromMe: msg.fromMe,
                            id: msg.id.toString(),
                            remoteJid: msg.contactId,
                        },
                        message: { conversation },
                        messageType: msg.mediaType,
                        messageTimestamp: new Date(msg.createdAt).getTime(),
                        instanceId: msg.id.toString(),
                        status: msg.status ?? undefined,
                    },
                    mediaType,
                    contentUrl,
                    content: msg.content,
                };
            });

            if (page === 1) {
                set({
                    messages: formatted,
                    page: 1,
                    hasNextPage: meta.hasNext,
                });
            } else {
                set(state => ({
                    messages: [...formatted, ...state.messages],
                    hasNextPage: meta.hasNext,
                    page,
                }));
            }
        } finally {
            set({ isLoadingMore: false, isLoadingMessages: false });
        }
    },

    setTab: (tab) => set({ tab }),

    selectChat: (ticket) => {
        set({ selectedChat: ticket, messages: [] });
        if (ticket) {
            get().fetchMessages();
        }
    },

    fetchMoreMessages: async () => {
        const { page, hasNextPage } = get();
        if (!hasNextPage) return;
        await get().fetchMessages(page + 1);
    },

    removeTicket: (id: number) => set(state => ({
        tickets: state.tickets.filter(t => t.id !== id),
        selectedChat: state.selectedChat?.id === id ? null : state.selectedChat,
    })),

    sendMessage: async (text) => {
        const chat = get().selectedChat;
        if (!chat) return;
        const now = Date.now();
        const user = useAuthStore.getState().user;
        const tempId = `tmp-${now}`;
        const newMsg: NewMessagePayload = {
            contactId: chat.Contact.remoteJid,
            data: {
                key: { fromMe: true, id: tempId, remoteJid: chat.Contact.remoteJid },
                message: { conversation: text },
                messageType: MediaEnum.TEXT,
                messageTimestamp: now,
                instanceId: tempId,
                status: 'sent',
            },
            mediaType: MediaEnum.TEXT,
            contentUrl: undefined,
            content: text,
        };
        set((state) => ({
            messages: [...state.messages, newMsg],
            tickets: state.tickets.map((t) =>
                t.id === chat.id
                    ? {
                        ...t,
                        lastMessage: {
                            content: text,
                            fromMe: true,
                            createdAt: new Date(now).toISOString(),
                            mediaType: MediaEnum.TEXT,
                            read: true,
                        },
                    }
                    : t
            ),
            selectedChat:
                state.selectedChat?.id === chat.id
                    ? {
                        ...state.selectedChat,
                        lastMessage: {
                            content: text,
                            fromMe: true,
                            createdAt: new Date(now).toISOString(),
                            mediaType: MediaEnum.TEXT,
                            read: true,
                        },
                    }
                    : state.selectedChat,
        }));

        try {
            await sendTextMessage(chat.Contact.remoteJid, text);
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            toast({ description: 'Erro ao enviar mensagem', variant: 'destructive' });
        }
    },

    initialize: () => {
        const user = useAuthStore.getState().user;
        if (get().socket) return;
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || '', { transports: ['websocket'] });

        socket.on('connect', () => {
            if (user?.companyId) {
                socket.emit('join', user.companyId);
            }
        });

        socket.on('newMessage', (payload: NewMessagePayload) => {
            let ts = payload.data.messageTimestamp;
            if (ts < 1e12) ts = ts * 1000;
            payload.data.messageTimestamp = ts;

            // se for nossa própria mensagem, atualiza apenas o ticket
            if (payload.data.key.fromMe) {
                set((state) => ({
                    tickets: state.tickets.map((t) =>
                        t.Contact.remoteJid === payload.contactId
                            ? {
                                ...t,
                                lastMessage: {
                                    content: payload.data.message.conversation || '',
                                    fromMe: true,
                                    createdAt: new Date(ts).toISOString(),
                                    mediaType: payload.mediaType,
                                    read: true,
                                },
                            }
                            : t
                    ),
                }));
                return;
            }

            // mensagens recebidas de terceiros
            set((state) => {
                const exists = state.messages.some((m) => m.data.key.id === payload.data.key.id);
                const messages = exists ? state.messages : [...state.messages, payload];
                const tickets = state.tickets.map((t) =>
                    t.Contact.remoteJid === payload.contactId
                        ? {
                            ...t,
                            lastMessage: {
                                content: payload.data.message.conversation || '',
                                fromMe: payload.data.key.fromMe,
                                createdAt: new Date(ts).toISOString(),
                                mediaType: payload.mediaType,
                                read: false,
                            },
                        }
                        : t
                );
                return { messages, tickets };
            });
        });

        set({ socket });
        get().fetchTickets();
    },
}));
