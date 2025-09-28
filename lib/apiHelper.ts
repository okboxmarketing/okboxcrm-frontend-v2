import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

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

// Tipos de erro para melhor categorização
enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Interface para erros estruturados
interface StructuredError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: unknown;
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

let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return null;
        const { access_token } = await res.json();
        if (access_token) {
          useAuthStore.getState().updateToken(access_token);
          localStorage.setItem('authToken', access_token);
          return access_token;
        }
      } catch (e) {
        console.error('Erro ao fazer refresh do token:', e);
      }
      return null;
    })();
    refreshPromise.finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Função para categorizar erros baseado no status code
function categorizeError(statusCode: number): ErrorType {
  if (statusCode >= 500) return ErrorType.SERVER;
  if (statusCode === 401) return ErrorType.AUTHENTICATION;
  if (statusCode === 403) return ErrorType.AUTHORIZATION;
  if (statusCode >= 400 && statusCode < 500) return ErrorType.VALIDATION;
  return ErrorType.UNKNOWN;
}

// Função para gerar mensagens amigáveis ao usuário
function getUserFriendlyMessage(errorType: ErrorType, originalMessage: string, statusCode?: number): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "Problema de conexão. Verifique sua internet e tente novamente.";
    case ErrorType.AUTHENTICATION:
      return "Sua sessão expirou. Faça login novamente.";
    case ErrorType.AUTHORIZATION:
      return "Você não tem permissão para realizar esta ação.";
    case ErrorType.VALIDATION:
      return originalMessage || "Dados inválidos. Verifique as informações e tente novamente.";
    case ErrorType.SERVER:
      return "Erro interno do servidor. Tente novamente em alguns minutos.";
    case ErrorType.UNKNOWN:
    default:
      return originalMessage || "Ocorreu um erro inesperado. Tente novamente.";
  }
}

// Função para mostrar toast baseado no tipo de erro
function showErrorToast(errorType: ErrorType, userMessage: string, statusCode?: number) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Em desenvolvimento, mostra mais detalhes
  const title = isDevelopment 
    ? `Erro ${statusCode ? `(${statusCode})` : ''} - ${errorType}`
    : 'Erro';

  toast({
    title,
    description: userMessage,
    variant: "destructive",
    duration: errorType === ErrorType.AUTHENTICATION ? 5000 : 4000,
  });
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractErrorMessage(response: Response, responseData: any): string {
  let errorMessage = "Erro desconhecido";

  // Caso API retorne string simples
  if (typeof responseData === "string") {
    errorMessage = responseData;
  }

  // Caso API retorne no formato do ErrorResponse
  else if (responseData && typeof responseData === "object") {
    const errorObj = responseData as Partial<ErrorResponse> & Partial<ErrorObject>;
    errorMessage =
      errorObj.message ||
      errorObj.error?.toString() ||
      JSON.stringify(errorObj);
  }

  // Garantir fallback
  if (!errorMessage || errorMessage === "null" || errorMessage === "undefined") {
    errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
  }

  return errorMessage;
}

// Função para processar e estruturar erros
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function processError(response: Response, responseData: any, originalError?: unknown): StructuredError {
  const statusCode = response.status;
  const errorType = categorizeError(statusCode);
  const originalMessage = extractErrorMessage(response, responseData);
  const userMessage = getUserFriendlyMessage(errorType, originalMessage, statusCode);

  // Log detalhado em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Erro ${errorType} (${statusCode})`);
    console.error('Status:', statusCode);
    console.error('Response Data:', responseData);
    console.error('Original Error:', originalError);
    console.error('User Message:', userMessage);
    console.groupEnd();
  }

  return {
    type: errorType,
    message: originalMessage,
    userMessage,
    statusCode,
    originalError
  };
}


//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleResponse(response: Response, responseData: any, originalRequest?: () => Promise<Response>, showToast: boolean = true) {
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken && originalRequest) {
      const newResponse = await originalRequest();
      const newText = await newResponse.text();
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      let newResponseData: any;
      try { newResponseData = JSON.parse(newText); } catch { newResponseData = newText; }
     if(!newResponseData) {
      const err = typeof newResponseData?.error === 'string'
      ? newResponseData.error
      : newResponse.statusText || 'Erro após renovar a sessão';
      throw new Error(err);
     }

      return newResponseData;
    }
    await handleLogout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (response.status === 403) {
    const errorMessage = extractErrorMessage(response, responseData);

    if (errorMessage === "INSUFFICIENT_PERMISSIONS") {
      if (showToast) {
        showErrorToast(ErrorType.AUTHORIZATION, "Você não tem permissões suficientes para acessar este recurso.", 403);
      }
      throw new Error("Você não tem permissões suficientes para acessar este recurso.");
    }

    if (showToast) {
      showErrorToast(ErrorType.AUTHORIZATION, errorMessage, 403);
    }
    throw new Error(errorMessage);
  }

  if (!response.ok) {
    const structuredError = processError(response, responseData);
    if (showToast) {
      showErrorToast(structuredError.type, structuredError.userMessage, structuredError.statusCode);
    }
    throw new Error(structuredError.userMessage);
  }
}

export const apiHelper = {
  get: async <T>(url: string, params?: Record<string, unknown>, showToast: boolean = true): Promise<T> => {
    try {
      const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";

      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
          credentials: 'include',
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

      const result = await handleResponse(response, responseData, makeRequest, showToast);
      if (result) return result;

      return responseData;
    } catch (error) {
      // Tratamento de erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const structuredError = {
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: getUserFriendlyMessage(ErrorType.NETWORK, error.message),
          originalError: error
        };
        
        if (showToast) {
          showErrorToast(structuredError.type, structuredError.userMessage);
        }
        
        console.error(`Erro de rede [GET ${url}]:`, error);
        throw new Error(structuredError.userMessage);
      }

      // Tratamento de outros erros
      if (error instanceof Error) {
        if (showToast) {
          showErrorToast(ErrorType.UNKNOWN, error.message);
        }
        console.error(`Erro [GET ${url}]:`, error);
      }
      
      throw error;
    }
  },

  post: async <T>(url: string, data?: unknown, showToast: boolean = true): Promise<T> => {
    try {
      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
          body: data ? JSON.stringify(data) : null,
          credentials: 'include',
        });
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest, showToast);
      if (result) return result;

      return responseData;
    } catch (error) {
      // Tratamento de erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const structuredError = {
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: getUserFriendlyMessage(ErrorType.NETWORK, error.message),
          originalError: error
        };
        
        if (showToast) {
          showErrorToast(structuredError.type, structuredError.userMessage);
        }
        
        console.error(`Erro de rede [POST ${url}]:`, error);
        throw new Error(structuredError.userMessage);
      }

      // Tratamento de outros erros
      if (error instanceof Error) {
        if (showToast) {
          showErrorToast(ErrorType.UNKNOWN, error.message);
        }
        console.error(`Erro [POST ${url}]:`, error);
      }
      
      throw error;
    }
  },
  delete: async <T>(
    url: string,
    params?: Record<string, unknown>,
    showToast: boolean = true
  ): Promise<T> => {
    try {
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
            credentials: 'include',
          }
        );
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest, showToast);
      if (result) return result;

      return responseData;
    } catch (error) {
      // Tratamento de erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const structuredError = {
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: getUserFriendlyMessage(ErrorType.NETWORK, error.message),
          originalError: error
        };
        
        if (showToast) {
          showErrorToast(structuredError.type, structuredError.userMessage);
        }
        
        console.error(`Erro de rede [DELETE ${url}]:`, error);
        throw new Error(structuredError.userMessage);
      }

      // Tratamento de outros erros
      if (error instanceof Error) {
        if (showToast) {
          showErrorToast(ErrorType.UNKNOWN, error.message);
        }
        console.error(`Erro [DELETE ${url}]:`, error);
      }
      
      throw error;
    }
  },
  patch: async <T>(url: string, data?: unknown, showToast: boolean = true): Promise<T> => {
    try {
      const makeRequest = async () => {
        const currentToken = useAuthStore.getState().token || localStorage.getItem("authToken");
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: currentToken ? `Bearer ${currentToken}` : "",
          },
          body: data ? JSON.stringify(data) : null,
          credentials: 'include',
        });
      };

      const response = await makeRequest();
      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);

      const result = await handleResponse(response, responseData, makeRequest, showToast);
      if (result) return result;

      return responseData;
    } catch (error) {
      // Tratamento de erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const structuredError = {
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: getUserFriendlyMessage(ErrorType.NETWORK, error.message),
          originalError: error
        };
        
        if (showToast) {
          showErrorToast(structuredError.type, structuredError.userMessage);
        }
        
        console.error(`Erro de rede [PATCH ${url}]:`, error);
        throw new Error(structuredError.userMessage);
      }

      // Tratamento de outros erros
      if (error instanceof Error) {
        if (showToast) {
          showErrorToast(ErrorType.UNKNOWN, error.message);
        }
        console.error(`Erro [PATCH ${url}]:`, error);
      }
      
      throw error;
    }
  },
};
