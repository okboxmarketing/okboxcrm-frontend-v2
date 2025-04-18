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
        console.log(`Response [GET ${url} JSON]:`, responseData);
      } catch {
        responseData = text as T;
      }

      if (!response.ok) {
        throw new Error((responseData as Error).message || "Erro desconhecido");
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
      console.log(`Response [POST ${url}]:`, responseData);

      if (!response.ok) {
        throw new Error((responseData as Error).message || "Erro desconhecido");
      }

      return responseData;
    } catch (error) {
      console.error(`Erro [POST ${url}]:`, error);
      throw error;
    }
  },
  delete: async <T>(url: string): Promise<T> => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const text = await response.text();
      const responseData = text ? (JSON.parse(text) as T) : ({} as T);
      console.log(`Response [DELETE ${url}]:`, responseData);

      if (!response.ok) {
        throw new Error((responseData as Error).message || "Erro desconhecido");
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
      console.log(`Response [PATCH ${url}]:`, responseData);

      if (!response.ok) {
        throw new Error((responseData as Error).message || "Erro desconhecido");
      }

      return responseData;
    } catch (error) {
      console.error(`Erro [PATCH ${url}]:`, error);
      throw error;
    }
  },
};
