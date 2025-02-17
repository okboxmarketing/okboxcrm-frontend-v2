export const apiHelper = {
  get: async (url: string, params?: Record<string, any>) => {
    try {
      const token = localStorage.getItem("token");
      const queryString = params ? "?" + new URLSearchParams(params).toString() : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const responseData = await response.json();
      console.log(`Response [GET ${url} JSON]:`, responseData);

      if (!response.ok) throw new Error(responseData.message || "Erro desconhecido");

      return responseData;
    } catch (error) {
      console.error(`Erro [GET ${url}]:`, error);
      throw error;
    }
  },

  post: async (url: string, data?: any) => {
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

      const responseData = await response.json();
      console.log(`Response [POST ${url}]:`, responseData);

      if (!response.ok) throw new Error(responseData.message || "Erro desconhecido");

      return responseData;
    } catch (error) {
      console.error(`Erro [POST ${url}]:`, error);
      throw error;
    }
  },
};
