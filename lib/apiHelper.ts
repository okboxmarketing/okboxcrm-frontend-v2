export const apiHelper = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const token = localStorage.getItem("token");
      const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const text = await response.text();
      const responseData = text ? JSON.parse(text) as T : {} as T;
      console.log(`Response [GET ${url} JSON]:`, responseData);

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
      const token = localStorage.getItem("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: data ? JSON.stringify(data) : null,
      });

      const text = await response.text();
      const responseData = text ? JSON.parse(text) as T : {} as T;
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
};
