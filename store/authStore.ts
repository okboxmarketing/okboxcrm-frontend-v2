import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { AuthUser } from '@/lib/types';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    whatsappConnection: string | null;
    setUser: (userData: AuthUser | null) => void;
    setToken: (newToken: string | null) => void;
    clearAuth: () => void;
    login: (token: string, sessionToken: string, whatsappConnection?: string) => void;
    logout: () => Promise<void>;
    initializeAuth: () => void;
    setCompanyImage: (companyImage: string) => void;
    setWhatsappConnection: (connection: string | null) => void;
    updateToken: (newToken: string) => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    whatsappConnection: null,

    setUser: (userData) => set({ user: userData, isAuthenticated: !!userData, isLoading: false, whatsappConnection: null }),
    setToken: (newToken) => set({ token: newToken, whatsappConnection: null }),
    clearAuth: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false, whatsappConnection: null }),

    login: (token, whatsappConnection) => {
        try {
            const decodedToken = jwtDecode<AuthUser>(token);

            set({
                user: decodedToken,
                token: token,
                isAuthenticated: true,
                isLoading: false,
                whatsappConnection: whatsappConnection || null
            });
            localStorage.setItem('authToken', token);
            if (whatsappConnection) {
                localStorage.setItem('whatsappConnection', whatsappConnection);
            }
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            set({ user: null, token: null, isAuthenticated: false, isLoading: false, whatsappConnection: null });
        }
    },

    logout: async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Erro ao fazer logout no backend:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('whatsappConnection');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false, whatsappConnection: null });
        }
    },

    initializeAuth: () => {
        const storedToken = localStorage.getItem('authToken');
        const storedWhatsappConnection = localStorage.getItem('whatsappConnection');

        if (storedToken) {
            try {
                const decodedToken = jwtDecode<AuthUser>(storedToken);
                set((state) => ({
                    user: decodedToken,
                    token: storedToken,
                    isAuthenticated: true,
                    isLoading: false,
                    whatsappConnection: state.whatsappConnection || storedWhatsappConnection
                }));
            } catch (error) {
                set({ user: null, token: null, isAuthenticated: false, isLoading: false, whatsappConnection: null });
                localStorage.removeItem('authToken');
                localStorage.removeItem('whatsappConnection');
            }
        } else {
            set({ isLoading: false, whatsappConnection: null });
        }
    },

    setCompanyImage: (companyImage: string) => set((state) => ({
        user: state.user ? { ...state.user, companyImage } : null,
    })),

    setWhatsappConnection: (connection: string | null) => set({ whatsappConnection: connection }),

    updateToken: (newToken: string) => {
        try {
            const decodedToken = jwtDecode<AuthUser>(newToken);

            set({
                user: decodedToken,
                token: newToken,
                isAuthenticated: true,
                isLoading: false,
            });

            localStorage.setItem('authToken', newToken);
            console.log('Store atualizado com sucesso (apenas token)');
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
        }
    },
}));

export default useAuthStore;