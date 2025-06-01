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

export const deleteUser = async (userId: string, companyId?: string) => {
  return apiHelper.delete(
    `/users/${userId}`,
    companyId ? { companyId } : undefined
  );
};



export const deleteUserMaster = async (userId: string) => {
  return apiHelper.delete(`/users/master/${userId}`);
}

export const getUsers = async () => {
  return apiHelper.get("/users");
}