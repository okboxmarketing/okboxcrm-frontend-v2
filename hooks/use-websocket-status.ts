import { useChatStore } from '@/store/chatStore';

export function useWebSocketStatus() {
    const { socket, isInitialized } = useChatStore();

    return {
        isConnected: socket?.connected || false,
        isInitialized,
        socket
    };
} 