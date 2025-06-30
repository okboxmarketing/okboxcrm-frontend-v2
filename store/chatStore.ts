import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { getTickets, getMessagesByContactId, getTicketCounts } from '@/service/ticketsService';
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

// Função de debounce
const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]): Promise<void> => {
        return new Promise((resolve) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
                resolve();
            }, wait);
        });
    };
};

interface ChatState {
    tickets: Ticket[];
    messages: NewMessagePayload[];
    selectedChat: Ticket | null;
    tab: TicketStatusEnum;
    socket: Socket | null;
    isInitialized: boolean;
    fetchTickets: (
        status: TicketStatusEnum,
        cursor?: string,
        kanbanStepId?: number,
        responsibleId?: string,
        onlyActive?: boolean
    ) => Promise<void>;
    setTab: (tab: TicketStatusEnum) => void;
    selectChat: (ticket: Ticket | null) => void;
    sendMessage: (text: string) => Promise<void>;
    initialize: () => void;
    removeTicket: (id: number) => void;
    updateChat: (ticket: Ticket) => void;

    // Contagens de tickets
    ticketCounts: {
        pending: number;
        unread: number;
    };
    fetchTicketCounts: () => Promise<void>;

    // Paginação de tickets
    ticketsCursor: string | null;
    hasMoreTickets: boolean;
    isLoadingMoreTickets: boolean;
    fetchMoreTickets: () => Promise<void>;
    currentKanbanStepId?: number;
    currentResponsibleId?: string;
    currentOnlyActive?: boolean;

    // Paginação de mensagens
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
    ticketsCursor: null,
    hasMoreTickets: false,
    isLoadingMoreTickets: false,
    ticketCounts: {
        pending: 0,
        unread: 0
    },
    currentKanbanStepId: undefined,
    currentResponsibleId: undefined,
    currentOnlyActive: undefined,
    isInitialized: false,

    fetchTicketCounts: debounce(async () => {
        try {
            const counts = await getTicketCounts();
            set({ ticketCounts: counts });
        } catch (err) {
            console.error('Erro ao buscar contagens de tickets:', err);
        }
    }, 1000), // 1 segundo de debounce

    fetchTickets: async (
        status: TicketStatusEnum,
        cursor?: string,
        kanbanStepId?: number,
        responsibleId?: string,
        onlyActive?: boolean
    ) => {
        try {
            const { data, meta } = await getTickets(
                status,
                cursor,
                undefined,
                kanbanStepId,
                onlyActive
            );
            set({
                tickets: cursor ? [...get().tickets, ...data] : data,
                ticketsCursor: meta.nextCursor,
                hasMoreTickets: meta.hasNextPage,
                currentKanbanStepId: kanbanStepId,
                currentResponsibleId: responsibleId,
                currentOnlyActive: onlyActive
            });
            get().fetchTicketCounts();
        } catch (err) {
            console.error('Erro ao buscar tickets:', err);
        }
    },

    fetchMoreTickets: async () => {
        const {
            ticketsCursor,
            hasMoreTickets,
            isLoadingMoreTickets,
            tab,
            currentKanbanStepId,
            currentResponsibleId,
            currentOnlyActive
        } = get();

        if (!hasMoreTickets || isLoadingMoreTickets) return;

        set({ isLoadingMoreTickets: true });
        try {
            await get().fetchTickets(
                tab,
                ticketsCursor || undefined,
                currentKanbanStepId,
                currentResponsibleId,
                currentOnlyActive
            );
        } finally {
            set({ isLoadingMoreTickets: false });
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
                set((state) => ({
                    messages: [...formatted, ...state.messages],
                    hasNextPage: meta.hasNext,
                    page,
                }));
            }
        } finally {
            set({ isLoadingMore: false, isLoadingMessages: false });
        }
    },

    setTab: (tab) => {
        set({ tab, tickets: [], ticketsCursor: null, hasMoreTickets: false });
        get().fetchTickets(tab);
    },

    selectChat: (ticket) => {
        set((state) => ({
            selectedChat: ticket,
            messages: [],
            tickets: state.tickets.map((t) =>
                t.id === ticket?.id
                    ? {
                        ...t,
                        lastMessage: t.lastMessage
                            ? { ...t.lastMessage, read: true }
                            : t.lastMessage,
                    }
                    : t
            ),
        }));
        if (ticket) {
            get().fetchMessages();
        }
    },

    fetchMoreMessages: async () => {
        const { page, hasNextPage } = get();
        if (!hasNextPage) return;
        await get().fetchMessages(page + 1);
    },

    removeTicket: (id: number) =>
        set((state) => ({
            tickets: state.tickets.filter((t) => t.id !== id),
            selectedChat:
                state.selectedChat?.id === id ? null : state.selectedChat,
        })),

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
        };

        set((state) => {
            const updatedMessages = state.messages.some(m => m.data.key.id === tempId)
                ? state.messages
                : [...state.messages, newMsg];

            return {
                messages: updatedMessages,
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
            };
        });

        try {
            await sendTextMessage(chat.Contact.remoteJid, text);
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            toast({ description: 'Erro ao enviar mensagem', variant: 'destructive' });
        }
    },

    initialize: () => {
        const user = useAuthStore.getState().user;
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        // Se já está inicializado ou não tem socket, não inicializa novamente
        if (get().isInitialized || get().socket) return;

        // Se não estiver autenticado, não inicializa
        if (!isAuthenticated || !user) {
            console.log('Usuário não autenticado, aguardando para inicializar chat');
            return;
        }

        const socket = io(
            process.env.NEXT_PUBLIC_BACKEND_URL || '',
            { transports: ['websocket'] }
        );

        socket.on('connect', () => {
            if (user?.companyId) {
                socket.emit('join', user.companyId);
            }
        });

        socket.on('newTicket', async () => {
            await get().fetchTickets(get().tab);
        });

        socket.on('newMessage', (payload: NewMessagePayload) => {
            let ts = payload.data.messageTimestamp;
            if (ts < 1e12) ts *= 1000;        // normaliza
            payload.data.messageTimestamp = ts;

            set((state) => {
                // evita duplicar
                const exists = state.messages.some(
                    (m) => m.data.key.id === payload.data.key.id ||
                        (m.data.key.fromMe && m.data.message.conversation === payload.data.message.conversation)
                );

                const messages = !exists ? [...state.messages, payload] : state.messages;

                const tickets = state.tickets.map((t) =>
                    t.Contact?.remoteJid === payload.contactId
                        ? {
                            ...t,
                            lastMessage: {
                                content: payload.data.message.conversation || '',
                                fromMe: payload.data.key.fromMe,
                                createdAt: new Date(ts).toISOString(),
                                mediaType: payload.mediaType,
                                read: state.selectedChat?.Contact.remoteJid === payload.contactId,
                            },
                        }
                        : t
                );

                const selectedChat =
                    state.selectedChat?.Contact.remoteJid === payload.contactId
                        ? {
                            ...state.selectedChat,
                            lastMessage: tickets.find((t) => t.Contact.remoteJid === payload.contactId)?.lastMessage || {
                                content: payload.data.message.conversation || '',
                                fromMe: payload.data.key.fromMe,
                                createdAt: new Date(ts).toISOString(),
                                mediaType: payload.mediaType,
                                read: true
                            }
                        }
                        : state.selectedChat;

                return { messages, tickets, selectedChat };
            });

            // Recalcula contagens, se necessário
            get().fetchTicketCounts();
        });

        set({ socket });
        get().fetchTickets(get().tab);
        get().fetchTicketCounts();
        set({ isInitialized: true });
    },

    updateChat: (ticket) => {
        set((state) => {
            const updatedTickets = state.tickets.map((t) =>
                t.id === ticket.id ? ticket : t
            );
            return {
                selectedChat: ticket,
                tickets: updatedTickets,
                messages: state.messages,
                ticketCounts: state.ticketCounts
            };
        });
    },
}));