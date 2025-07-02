import { apiHelper } from "@/lib/apiHelper";
import { Response } from "@/lib/types";
import { UserSchemaType } from "@/schema/userSchema";
import { Invite } from "@/types/invites";


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

export const inviteUser = async (user: UserSchemaType | { email: string; name: string; role: "USER" | "ADMIN"; companyId?: string }) => {
  return apiHelper.post("/user-invites/invite", user);
};
export const getInviteByToken = async (token: string) => {
  return apiHelper.get<Invite>(`/user-invites/token/${token}`);
}

export const acceptInvite = async (token: string, password: string) => {
  return apiHelper.post("/user-invites/accept", { token, password });
}

export const getPendingInvites = async (companyId?: string) => {
  return apiHelper.get<Invite[]>("/user-invites/pending", companyId ? { companyId } : undefined);
}

export const deleteInvite = async (inviteId: string, companyId?: string) => {
  return apiHelper.delete(`/user-invites/${inviteId}`, companyId ? { companyId } : undefined);
}

export const deleteUserMaster = async (userId: string) => {
  return apiHelper.delete(`/users/master/${userId}`);
}

export const getUsers = async () => {
  return apiHelper.get("/users");
}
