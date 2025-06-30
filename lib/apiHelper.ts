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

      return responseData;
    } catch (error) {
      console.error(`Erro [PATCH ${url}]:`, error);
      throw error;
    }
  },
};
