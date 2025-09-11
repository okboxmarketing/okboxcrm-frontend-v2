import useAuthStore from '@/store/authStore';

export function useWhatsAppConnection() {
    const { whatsappConnection, setWhatsappConnection } = useAuthStore();

    return {
        whatsappConnection,
        setWhatsappConnection,
        isConnected: whatsappConnection === 'open',
        isConnecting: whatsappConnection === 'connecting',
        isDisconnected: whatsappConnection === 'close' || whatsappConnection === null,
        isNotStarted: whatsappConnection === 'not_started',
    };
} 