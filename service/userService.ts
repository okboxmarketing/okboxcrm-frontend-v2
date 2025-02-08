import { UserSchemaType } from "@/schema/userSchema";

export const createUser = async (user: UserSchemaType) => {
  console.log("Service createUser: ", user);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const responseData = await response.json();

    console.log("Response status:", response.status);
    console.log("Response body:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido ao cadastrar usuário");
    }

    return responseData;

  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};
