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
    console.log("Base64", responseData.base64);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido");
    }

    return responseData.base64;
  } catch (error) {
    console.error("Erro ao buscar instância do WhatsApp:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};

export const isConnected = async () => {
  try {
    const status = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wha-instance/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    const statusData = await status.json();

    if (!status.ok) {
      return false
    }

    console.log("Response status isConnected:", status.status);
    console.log("Response body isConnected:", statusData);
    return statusData
  } catch (error) {
    console.error("Erro ao buscar instância do WhatsApp:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
}


