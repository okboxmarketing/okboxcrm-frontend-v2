import useAuthStore from '@/store/authStore';

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

function handleLogout() {
  useAuthStore.getState().logout();
  window.location.href = '/';
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleResponse(response: Response, responseData: any) {
  if (response.status === 401) {
    // Verificar se é erro de token expirado/inválido
    const errorData = (responseData as ErrorResponse)?.error;
    let errorMessage = "";

    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const errorObj = errorData as ErrorObject;
      errorMessage = errorObj.message || errorObj.error || "";
    }

    // Só faz logout se for especificamente token expirado/inválido
    if (errorMessage === 'TOKEN_EXPIRED_OR_INVALID') {
      console.log('Token expirado ou inválido. Fazendo logout automático...');
      handleLogout();
      return;
    }

    // Para outros erros 401 (não autorizado para recurso), apenas lança o erro
    console.log('Usuário não autorizado para este recurso:', errorMessage);
  }

  if (response.status === 403) {
    // Verificar se é erro de permissões insuficientes
    const errorData = (responseData as ErrorResponse)?.error;
    let errorMessage = "";

    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const errorObj = errorData as ErrorObject;
      errorMessage = errorObj.message || errorObj.error || "";
    }

    if (errorMessage === 'INSUFFICIENT_PERMISSIONS') {
      console.log('Usuário não tem permissões suficientes para este recurso');
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

    throw new Error(errorMessage);
  }
}

export const apiHelper = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");
      const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const text = await response.text();

      let responseData: T;
      try {
        responseData = JSON.parse(text) as T;
      } catch {
        responseData = text as T;
      }

      handleResponse(response, responseData);

      return responseData;
    } catch (error) {
      console.error(`Erro [GET ${url}]:`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: data ? JSON.stringify(data) : null,
      });

      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      handleResponse(response, responseData);

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      handleResponse(response, responseData);

      return responseData;
    } catch (error) {
      console.error(`Erro [DELETE ${url}]:`, error);
      throw error;
    }
  },
  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: data ? JSON.stringify(data) : null,
      });

      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      handleResponse(response, responseData);

      return responseData;
    } catch (error) {
      console.error(`Erro [PATCH ${url}]:`, error);
      throw error;
    }
  },
};
