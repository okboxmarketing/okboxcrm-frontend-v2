import { apiHelper } from "@/lib/apiHelper";
import { Company, User } from "@/lib/types";

export interface CreateAdvisorData {
    name: string;
    email: string;
    password: string;
}

export const createAdvisor = async (data: CreateAdvisorData) => {
    await apiHelper.post("/users/advisor", data);
};

export const getMyCompanies = async (): Promise<Company[]> => {
    return await apiHelper.get<Company[]>("/company");
};

export const getAdvisors = async (): Promise<User[]> => {
    return await apiHelper.get<User[]>("/users/advisors");
}

export const getAdvisorById = async (id: string): Promise<User> => {
    return await apiHelper.get<User>(`/users/advisor/${id}`);
}

export const updateAdvisor = async (id: string, data: CreateAdvisorData) => {
    await apiHelper.patch(`/users/advisor/${id}`, data);
}

export const deleteAdvisor = async (id: string) => {
    await apiHelper.delete(`/users/advisor/${id}`);
}