export const getInstance = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wha-instance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    const responseData = await response.json();

    console.log("Response status findMyWhaInstance:", response.status);
    console.log("Response body findMyWhaInstance:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido");
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao buscar instância do WhatsApp:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};

export const connect = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wha-instance/connect`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    const responseData = await response.json();

    console.log("Response status connectInstance:", response.status);
    console.log("Response body connectInstance:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido");
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao buscar instância do WhatsApp:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};

export const createInstance = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wha-instance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    const responseData = await response.json();

    console.log("Response status connectInstance:", response.status);
    console.log("Response body connectInstance:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido");
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao buscar instância do WhatsApp:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};


