import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { AuthUser } from '@/lib/types';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (userData: AuthUser | null) => void;
    setToken: (newToken: string | null) => void;
    clearAuth: () => void;
    login: (token: string) => void;
    logout: () => void;
    initializeAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (userData) => set({ user: userData, isAuthenticated: !!userData, isLoading: false }),
    setToken: (newToken) => set({ token: newToken }),
    clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),

    login: (token) => {
        try {
            const decodedToken = jwtDecode<AuthUser>(token);
            console.log("USER NO LOGIN STORE:", decodedToken)

            set({ user: decodedToken, token: token, isAuthenticated: true, isLoading: false });
            localStorage.setItem('authToken', token);
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('authToken');
    },

    initializeAuth: () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode<AuthUser>(storedToken);
                console.log("USER NO INITIALIZE:", decodedToken)

                set({ user: decodedToken, token: storedToken, isAuthenticated: true, isLoading: false });
            } catch (error) {
                console.error('Erro ao inicializar autenticação do armazenamento:', error);
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                localStorage.removeItem('authToken');
            }
        } else {
            set({ isLoading: false });
        }
    },
}));

export default useAuthStore;