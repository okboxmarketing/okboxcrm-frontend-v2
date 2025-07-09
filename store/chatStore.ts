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

// Variáveis globais para controle de debounce
let fetchTicketCountsTimeout: NodeJS.Timeout | null = null;
let isFetchingCounts = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 segundos

// Controle global para evitar múltiplas inicializações
let globalSocket: Socket | null = null;
let isInitializing = false;

// Função debounced para fetchTicketCounts
const debouncedFetchTicketCounts = async () => {
    const now = Date.now();

    // Se já está buscando, não faz nada
    if (isFetchingCounts) {
        console.log('Fetch de contagens já em andamento, ignorando...');
        return;
    }

    // Se o cache ainda é válido, não busca novamente
    if (now - lastFetchTime < CACHE_DURATION) {
        console.log('Cache ainda válido, pulando fetchTicketCounts');
        return;
    }

    // Limpa timeout anterior
    if (fetchTicketCountsTimeout) {
        clearTimeout(fetchTicketCountsTimeout);
    }

    // Cria novo timeout
    fetchTicketCountsTimeout = setTimeout(async () => {
        try {
            console.log('Executando fetchTicketCounts...');
            isFetchingCounts = true;
            lastFetchTime = Date.now();

            const counts = await getTicketCounts();
            useChatStore.setState({ ticketCounts: counts });

            console.log('FetchTicketCounts concluído:', counts);
        } catch (err) {
            console.error('Erro ao buscar contagens de tickets:', err);
        } finally {
            isFetchingCounts = false;
        }
    }, 1000);
};

interface ChatState {
    tickets: Ticket[];
    messages: NewMessagePayload[];
    selectedChat: Ticket | null;
    tab: TicketStatusEnum;
    socket: Socket | null;
    isInitialized: boolean;
    isFetchingTickets: boolean;
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
    isFetchingTickets: false,

    fetchTicketCounts: debouncedFetchTicketCounts,

    fetchTickets: async (
        status: TicketStatusEnum,
        cursor?: string,
        kanbanStepId?: number,
        responsibleId?: string,
        onlyActive?: boolean
    ) => {
        // Evita múltiplas chamadas simultâneas
        if (get().isFetchingTickets && !cursor) {
            console.log('Fetch de tickets já em andamento, ignorando...');
            return;
        }

        set({ isFetchingTickets: true });
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
                currentOnlyActive: onlyActive,
                isFetchingTickets: false
            });
            // Só atualiza contagens se não for paginação
            if (!cursor) {
                debouncedFetchTicketCounts();
            }
        } catch (err) {
            console.error('Erro ao buscar tickets:', err);
            set({ isFetchingTickets: false });
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
            console.log("Messages", data)
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
                            id: msg.evolutionMessageId || msg.id.toString(),
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
                    caption: msg.caption,
                    quotedMessageEvolutionId: msg.quotedMessageEvolutionId,
                    audioDuration: msg.audioDuration,
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
        // Evita re-fetch se já está na mesma tab
        if (get().tab === tab) return;

        set({ tab, tickets: [], ticketsCursor: null, hasMoreTickets: false });
        get().fetchTickets(tab);
    },

    selectChat: (ticket) => {
        // Se o ticket não tem KanbanStep, loga um aviso mas permite a seleção
        if (ticket && !ticket.KanbanStep) {
            console.warn('Ticket selecionado sem KanbanStep:', ticket);
        }

        set((state) => ({
            selectedChat: ticket,
            messages: [],
            // Se o ticket for PENDING, define a tab como PENDING
            tab: ticket?.status === "PENDING" ? "PENDING" : state.tab,
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

        // Controle global para evitar múltiplas inicializações
        if (isInitializing) {
            console.log('Inicialização já em andamento, ignorando...');
            return;
        }

        // Se já está inicializado ou não tem socket, não inicializa novamente
        if (get().isInitialized || get().socket || globalSocket) {
            console.log('Socket já inicializado, ignorando...');
            return;
        }

        // Se não estiver autenticado, não inicializa
        if (!isAuthenticated || !user) {
            console.log('Usuário não autenticado, aguardando para inicializar chat');
            return;
        }

        isInitializing = true;

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
            // Usa debounce para evitar múltiplas chamadas
            if (!get().isFetchingTickets) {
                await get().fetchTickets(get().tab);
            }
        });

        socket.on('newMessage', (payload: NewMessagePayload) => {
            console.log('WebSocket payload received:', payload);
            let ts = payload.data.messageTimestamp;
            if (ts < 1e12) ts *= 1000;        // normaliza
            payload.data.messageTimestamp = ts;

            // Processa o payload para garantir que todos os campos estejam corretos
            let contentUrl = payload.contentUrl;
            let caption = payload.caption;
            let audioDuration = payload.audioDuration;

            console.log('Processing message - mediaType:', payload.mediaType, 'audioDuration:', payload.audioDuration);

            // Se for imagem, pega o imageUrl do payload
            if (payload.mediaType === MediaEnum.IMAGE && payload.imageUrl) {
                contentUrl = payload.imageUrl;
            }

            if (payload.mediaType === MediaEnum.VIDEO && payload.videoUrl) {
                contentUrl = payload.videoUrl;
            }
            // Se for áudio, pega o audioDuration do payload
            if (payload.mediaType === MediaEnum.AUDIO && payload.audioDuration) {
                audioDuration = payload.audioDuration;
                console.log('Audio duration from WebSocket:', payload.audioDuration);
            }

            const processedPayload: NewMessagePayload = {
                ...payload,
                data: {
                    ...payload.data,
                    key: {
                        ...payload.data.key,
                        id: payload.data.key.id || payload.data.instanceId,
                    },
                },
                quotedMessageEvolutionId: payload.quotedMessageEvolutionId,
                caption: caption,
                contentUrl: contentUrl,
                audioDuration: audioDuration,
            };

            console.log('Processed payload audioDuration:', processedPayload.audioDuration);

            set((state) => {
                // evita duplicar
                const exists = state.messages.some(
                    (m) => m.data.key.id === processedPayload.data.key.id ||
                        (m.data.key.fromMe && m.data.message.conversation === processedPayload.data.message.conversation)
                );

                const messages = !exists ? [...state.messages, processedPayload] : state.messages;

                const tickets = state.tickets.map((t) =>
                    t.Contact?.remoteJid === processedPayload.contactId
                        ? {
                            ...t,
                            lastMessage: {
                                content: processedPayload.data.message.conversation || processedPayload.caption || '',
                                fromMe: processedPayload.data.key.fromMe,
                                createdAt: new Date(ts).toISOString(),
                                mediaType: processedPayload.mediaType,
                                read: state.selectedChat?.Contact.remoteJid === processedPayload.contactId,
                            },
                        }
                        : t
                );

                const selectedChat =
                    state.selectedChat?.Contact.remoteJid === processedPayload.contactId
                        ? {
                            ...state.selectedChat,
                            lastMessage: tickets.find((t) => t.Contact.remoteJid === processedPayload.contactId)?.lastMessage || {
                                content: processedPayload.data.message.conversation || processedPayload.caption || '',
                                fromMe: processedPayload.data.key.fromMe,
                                createdAt: new Date(ts).toISOString(),
                                mediaType: processedPayload.mediaType,
                                read: true
                            }
                        }
                        : state.selectedChat;

                return { messages, tickets, selectedChat };
            });

            // Recalcula contagens apenas se a mensagem não for do chat atual e não for uma mensagem enviada pelo usuário
            const currentState = get();
            if (currentState.selectedChat?.Contact.remoteJid !== processedPayload.contactId && !processedPayload.data.key.fromMe) {
                debouncedFetchTicketCounts();
            }
        });

        // Novo listener para atualizações de contadores em tempo real
        socket.on('ticketCountsUpdate', (counts: { pending: number; unread: number }) => {
            set({ ticketCounts: counts });
        });

        // Listener para mudanças de status de ticket
        socket.on('ticketStatusChanged', (data: { ticketId: number; oldStatus: string; newStatus: string }) => {
            // Atualiza o ticket localmente se necessário
            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t.id === data.ticketId
                        ? { ...t, status: data.newStatus as TicketStatusEnum }
                        : t
                ),
                selectedChat: state.selectedChat?.id === data.ticketId
                    ? { ...state.selectedChat, status: data.newStatus as TicketStatusEnum }
                    : state.selectedChat
            }));
        });

        // Limpa o socket global quando desconectar
        socket.on('disconnect', () => {
            globalSocket = null;
            isInitializing = false;
        });

        globalSocket = socket;
        set({ socket });
        get().fetchTickets(get().tab);
        // fetchTicketCounts será chamado automaticamente pelo fetchTickets
        set({ isInitialized: true });
        isInitializing = false;
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