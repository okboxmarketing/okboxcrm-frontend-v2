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
    login: (token: string, whatsappConnection?: string) => void;
    logout: () => void;
    initializeAuth: () => void;
    setCompanyImage: (companyImage: string) => void;
    setWhatsappConnection: (connection: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    whatsappConnection: null,

    setUser: (userData) => set({ user: userData, isAuthenticated: !!userData, isLoading: false, whatsappConnection: null }),
    setToken: (newToken) => set({ token: newToken, whatsappConnection: null }),
    clearAuth: () => set({ user: null, token: null, isAuthenticated: false, whatsappConnection: null }),

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

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('whatsappConnection');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, whatsappConnection: null });
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
}));

export default useAuthStore;