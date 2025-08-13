"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useChatStore } from '@/store/chatStore';
import useAuthStore from '@/store/authStore';

interface WebSocketContextType {
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const { initialize, socket, isInitialized } = useChatStore();

    useEffect(() => {
        if (isAuthenticated && user?.companyId && !isInitialized && !socket) {
            initialize();
        }
    }, [isAuthenticated, user?.companyId, isInitialized, socket, initialize]);

    const contextValue: WebSocketContextType = {
        isConnected: !!socket?.connected
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket deve ser usado dentro de um WebSocketProvider');
    }
    return context;
} 