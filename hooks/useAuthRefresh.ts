import { useCallback } from 'react';
import { getCookie } from '@/lib/cookieUtils';
import useAuthStore from '@/store/authStore';

export const useAuthRefresh = () => {
  const setToken = useAuthStore((state) => state.setToken);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const sessionToken = getCookie('session_token');

      if (!sessionToken) {
        console.log('Session token não encontrado');
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;

        if (newToken) {
          setToken(newToken);
          localStorage.setItem('authToken', newToken);
          console.log('Token renovado com sucesso');
          return newToken;
        }
      } else {
        console.error('Erro ao renovar token:', response.status);
      }
    } catch (error) {
      console.error('Erro ao fazer refresh do token:', error);
    }

    return null;
  }, [setToken]);

  return { refreshToken };
}; 