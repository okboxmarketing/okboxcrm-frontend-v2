import { UserSchemaType } from "@/schema/userSchema";

export const createUser = async (user: UserSchemaType) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido ao cadastrar usuário");
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || "Erro ao fazer login");

    localStorage.setItem("token", responseData.access_token);
  } catch (error) {
    console.error("Erro ao logar usuário:", error);
    throw error;
  }
};

export const verifyUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado. Faça login novamente.");

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha na verificação do usuário.");
    }

    const user = await response.json();

    if (!user || !user.userId) {
      throw new Error("Resposta inválida da API.");
    }

    localStorage.setItem("userId", user.userId);
    localStorage.setItem("companyId", user.companyId);
    localStorage.setItem("role", user.userRole);
    localStorage.setItem("userName", user.userName);
    localStorage.setItem("userEmail", user.userEmail);

    return user;
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    throw error;
  }
};

export const logout = () => {
  ["token", "userId", "companyId", "role", "userName", "userEmail"].forEach((key) =>
    localStorage.removeItem(key)
  );
};
