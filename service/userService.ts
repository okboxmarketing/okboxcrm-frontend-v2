import { apiHelper } from "@/lib/apiHelper";
import { AuthUser, Response } from "@/lib/types";
import { UserSchemaType } from "@/schema/userSchema";

export const createUser = async (user: UserSchemaType) => {
  return apiHelper.post("/auth/signup", user);
};

export const loginUser = async (email: string, password: string) => {
  const response: Response = await apiHelper.post("/auth/signin", { email, password });

  if (response.access_token) {
    localStorage.setItem("token", response.access_token);
  }

  return response;
};

export const verifyUser = async () => {
  const user = await apiHelper.get<AuthUser>("/auth/me");

  if (!user || !user.userId) {
    throw new Error("Resposta inválida da API.");
  }

  localStorage.setItem("userId", user.userId);
  localStorage.setItem("companyId", user.companyId);
  localStorage.setItem("role", user.userRole);
  localStorage.setItem("userName", user.userName);
  localStorage.setItem("userEmail", user.userEmail);

  return user;
};