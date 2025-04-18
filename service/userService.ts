import { apiHelper } from "@/lib/apiHelper";
import { Response } from "@/lib/types";
import { UserSchemaType } from "@/schema/userSchema";

export const createUser = async (user: UserSchemaType) => {
  return apiHelper.post("/auth/signup", user);
};

export const loginUser = async (email: string, password: string) => {
  const response: Response = await apiHelper.post("/auth/signin", { email, password });
  return response;
};

export const deleteUser = async (userId: string) => {
  return apiHelper.delete(`/users/${userId}`);
}