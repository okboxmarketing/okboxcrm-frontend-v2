import { apiHelper } from "@/lib/apiHelper";
import { Company } from "@/lib/types";

interface CreateAdvisorData {
    name: string;
    email: string;
    password: string;
}

export const createAdvisor = async (data: CreateAdvisorData) => {
    await apiHelper.post("/users/advisor", data);
};

export const getMyCompanies = async (): Promise<Company[]> => {
    const companies = await apiHelper.get<Company[]>("/users/my-companies");
    return companies;
};