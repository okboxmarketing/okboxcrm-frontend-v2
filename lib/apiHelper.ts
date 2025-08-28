import useAuthStore from '@/store/authStore';
import { getCookie } from './cookieUtils';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string | ErrorObject;
}

interface ErrorObject {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

async function handleLogout() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error);
  } finally {
    useAuthStore.getState().clearAuth();
    window.location.href = '/';
  }
}

async function refreshToken(): Promise<string | null> {
  try {
    const sessionToken = getCookie('session_token');

    if (!sessionToken) {
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
        // Atualiza o token no store
        useAuthStore.getState().setToken(newToken);
        localStorage.setItem('authToken', newToken);
        return newToken;
      }
    } else {
      console.error('Erro ao renovar token:', response.status);
    }
  } catch (error) {
    console.error('Erro ao fazer refresh do token:', error);
  }

  return null;
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleResponse(response: Response, responseData: any, originalRequest?: () => Promise<Response>) {
  if (response.status === 401) {
    try {
      if (originalRequest) {
        const newToken = await refreshToken();
        if (newToken) {
          const newResponse = await originalRequest();
          const newText = await newResponse.text();
          let newResponseData: any;
          try {
            newResponseData = JSON.parse(newText);
          } catch {
            newResponseData = newText;
          }
          return newResponseData;
        }
      }
    } catch (refreshError) {
      console.error('Erro ao fazer refresh do token:', refreshError);
    }

    handleLogout();
    return;
  }

  if (response.status === 403) {
    const errorData = (responseData as ErrorResponse)?.error;
    let errorMessage = "";

    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const errorObj = errorData as ErrorObject;
      errorMessage = errorObj.message || errorObj.error || "";
    }

    if (errorMessage === 'INSUFFICIENT_PERMISSIONS') {
      // Usuário não tem permissões suficientes para este recurso
    }
  }

  if (!response.ok) {
    const errorData = (responseData as ErrorResponse)?.error;
    let errorMessage = "Erro desconhecido";

    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const errorObj = errorData as ErrorObject;
      errorMessage = errorObj.message || errorObj.error || JSON.stringify(errorData);
    }

    // Garantir que errorMessage nunca seja null ou undefined
    if (!errorMessage || errorMessage === 'null' || errorMessage === 'undefined') {
      errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }
}

export const apiHelper = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");
      const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";

      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
        });
      };

      const response = await makeRequest();
      const text = await response.text();

      let responseData: T;
      try {
        responseData = JSON.parse(text) as T;
      } catch {
        responseData = text as T;
      }

      const result = await handleResponse(response, responseData, makeRequest);
      if (result) return result;

      return responseData;
    } catch (error) {
      console.error(`Erro [GET ${url}]:`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");

      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
          body: data ? JSON.stringify(data) : null,
        });
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest);
      if (result) return result;

      return responseData;
    } catch (error) {
      console.error(`Erro [POST ${url}]:`, error);
      throw error;
    }
  },
  delete: async <T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");
      const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";

      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: currentToken ? `Bearer ${currentToken}` : "",
            },
          }
        );
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest);
      if (result) return result;

      return responseData;
    } catch (error) {
      console.error(`Erro [DELETE ${url}]:`, error);
      throw error;
    }
  },
  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");

      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
          body: data ? JSON.stringify(data) : null,
        });
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest);
      if (result) return result;

      return responseData;
    } catch (error) {
      console.error(`Erro [PATCH ${url}]:`, error);
      throw error;
    }
  },
};
