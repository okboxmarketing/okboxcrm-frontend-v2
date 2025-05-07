import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { getMessagesByContactId, getTicketsByStatus } from '@/service/ticketsService';
import { sendTextMessage } from '@/service/messageService';
import {
    NewMessagePayload,
    Ticket,
    Message,
    MediaEnum,
} from '@/lib/types';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

interface ChatState {
    openTickets: Ticket[];
    openPage: number;
    openHasNext: boolean;
    openLoading: boolean;
    openCount: number
    fetchOpen: (page?: number) => Promise<void>;
    fetchMoreOpen: () => Promise<void>;

    pendingTickets: Ticket[];
    pendingPage: number;
    pendingHasNext: boolean;
    pendingLoading: boolean;
    pendingCount: number
    fetchPending: (page?: number) => Promise<void>;
    fetchMorePending: () => Promise<void>;

    messages: NewMessagePayload[];
    msgPage: number;
    msgHasNext: boolean;
    msgLoading: boolean;
    msgLoadingMore: boolean;
    fetchMessages: (page?: number) => Promise<void>;
    fetchMoreMessages: () => Promise<void>;

    selectedChat: Ticket | null;
    tab: "OPEN" | "PENDING";
    setTab: (tab: "OPEN" | "PENDING") => void;
    socket: Socket | null;
    initialize: () => void;
    selectChat: (ticket: Ticket | null) => void;
    sendMessage: (text: string) => Promise<void>;
    removeTicket: (id: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    openTickets: [],
    openPage: 1,
    openHasNext: false,
    openLoading: false,
    openCount: 0,
    fetchOpen: async (page = 1) => {
        set({ openLoading: page > 1 });
        try {
            const { data, meta } = await getTicketsByStatus('OPEN', page);
            if (page === 1) {
                set({ openTickets: data, openPage: 1, openHasNext: meta.hasNext, openCount: meta.total });
            } else {
                set(state => ({
                    openTickets: [...state.openTickets, ...data],
                    openPage: page,
                    openHasNext: meta.hasNext,
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar open tickets:', err);
        } finally {
            set({ openLoading: false });
        }
    },
    fetchMoreOpen: async () => {
        const { openPage, openHasNext, openLoading } = get();
        if (!openHasNext || openLoading) return;
        await get().fetchOpen(openPage + 1);
    },

    pendingTickets: [],
    pendingPage: 1,
    pendingHasNext: false,
    pendingLoading: false,
    pendingCount: 0,
    fetchPending: async (page = 1) => {
        set({ pendingLoading: page > 1 });
        try {
            const { data, meta } = await getTicketsByStatus('PENDING', page);
            if (page === 1) {
                set({ pendingTickets: data, pendingPage: 1, pendingHasNext: meta.hasNext, pendingCount: meta.total });
            } else {
                set(state => ({
                    pendingTickets: [...state.pendingTickets, ...data],
                    pendingPage: page,
                    pendingHasNext: meta.hasNext,
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar pending tickets:', err);
        } finally {
            set({ pendingLoading: false });
        }
    },
    fetchMorePending: async () => {
        const { pendingPage, pendingHasNext, pendingLoading } = get();
        if (!pendingHasNext || pendingLoading) return;
        await get().fetchPending(pendingPage + 1);
    },

    messages: [],
    msgPage: 1,
    msgHasNext: false,
    msgLoading: false,
    msgLoadingMore: false,
    fetchMessages: async (page = 1) => {
        const chat = get().selectedChat;
        if (!chat) return;
        set({ msgLoadingMore: page > 1, msgLoading: page === 1 });
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
                }
                return {
                    contactId: msg.contactId,
                    data: {
                        key: { fromMe: msg.fromMe, id: msg.id.toString(), remoteJid: msg.contactId },
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
                set({ messages: formatted, msgPage: 1, msgHasNext: meta.hasNext });
            } else {
                set(state => ({
                    messages: [...formatted, ...state.messages],
                    msgPage: page,
                    msgHasNext: meta.hasNext,
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
        } finally {
            set({ msgLoading: false, msgLoadingMore: false });
        }
    },
    fetchMoreMessages: async () => {
        const { msgPage, msgHasNext, msgLoading } = get();
        if (!msgHasNext || msgLoading) return;
        await get().fetchMessages(msgPage + 1);
    },

    selectedChat: null,
    tab: 'OPEN',
    setTab: (newTab: "OPEN" | "PENDING") => {
        set(state => ({
            tab: newTab,
            page: 1,
            openTickets: [],
            pendingTickets: [],
            hasNextPage: false,
        }));

        if (newTab === "OPEN") {
            get().fetchOpen(1);
        } else {
            get().fetchPending(1);
        }
    },
    socket: null,
    initialize: () => {
        const user = useAuthStore.getState().user;
        if (get().socket) return;
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || '', { transports: ['websocket'] });
        socket.on('connect', () => {
            if (user?.companyId) socket.emit('join', user.companyId);
        });
        socket.on('newMessage', (payload: NewMessagePayload) => {
            let ts = payload.data.messageTimestamp;
            if (ts < 1e12) ts = ts * 1000;
            payload.data.messageTimestamp = ts;
            if (payload.data.key.fromMe) {
                set(state => ({
                    openTickets: state.openTickets.map(t =>
                        t.Contact.remoteJid === payload.contactId
                            ? { ...t, lastMessage: { content: payload.data.message.conversation || '', fromMe: true, createdAt: new Date(ts).toISOString(), mediaType: payload.mediaType, read: true } }
                            : t
                    ),
                    pendingTickets: state.pendingTickets.map(t =>
                        t.Contact.remoteJid === payload.contactId
                            ? { ...t, lastMessage: { content: payload.data.message.conversation || '', fromMe: true, createdAt: new Date(ts).toISOString(), mediaType: payload.mediaType, read: true } }
                            : t
                    ),
                }));
                return;
            }
            set(state => {
                const exists = state.messages.some(m => m.data.key.id === payload.data.key.id);
                const messages = exists ? state.messages : [...state.messages, payload];
                const updateTickets = (list: Ticket[]) =>
                    list.map(t =>
                        t.Contact.remoteJid === payload.contactId
                            ? { ...t, lastMessage: { content: payload.data.message.conversation || '', fromMe: false, createdAt: new Date(ts).toISOString(), mediaType: payload.mediaType, read: false } }
                            : t
                    );
                return { messages, openTickets: updateTickets(state.openTickets), pendingTickets: updateTickets(state.pendingTickets) };
            });
        });
        set({ socket });
        get().fetchOpen(1);
        get().fetchPending(1);
    },

    selectChat: (ticket) => {
        set({ selectedChat: ticket, messages: [], msgPage: 1, msgHasNext: false });
        if (ticket) get().fetchMessages(1);
    },
    sendMessage: async (text) => {
        const chat = get().selectedChat;
        if (!chat) return;
        const now = Date.now();
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
        };;
        set(state => ({
            messages: [...state.messages, newMsg],
        }));
        try {
            await sendTextMessage(chat.Contact.remoteJid, text);
        } catch (err) {
            toast({ description: 'Erro ao enviar mensagem', variant: 'destructive' });
        }
    },

    removeTicket: (id: number) => {
        set(state => ({
            openTickets: state.openTickets.filter(t => t.id !== id),
            pendingTickets: state.pendingTickets.filter(t => t.id !== id),
            selectedChat: state.selectedChat?.id === id ? null : state.selectedChat,
        }));
    },
}));
