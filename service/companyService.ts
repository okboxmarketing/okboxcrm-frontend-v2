import { apiHelper } from "@/lib/apiHelper";
import { Company } from "@/lib/types";

export const createCompany = async (company: any) => {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(company),
    });

    const text = await response.text();


    if (!text.startsWith("{") && !text.startsWith("[")) {
      return text;
    }

    const responseData = JSON.parse(text);

    return responseData;
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    throw error;
  }
};

export const findCompanyById = async (companyId: string) => {
  return apiHelper.get<Company>(`/company/${companyId}`);
};

export const findAllCompanies = async () => {
  return await apiHelper.get<Company[]>("/company");
};

export const findMyCompany = async () => {
  return apiHelper.get<Company>("/company/my-company");
};

export const assignAccessorToCompany = async (advisorEmail: string, companyId: string) => {
  return apiHelper.post("/company/assign-advisor", { advisorEmail, companyId });
}

export const deleteCompany = async (companyId: string) => {
  return apiHelper.delete(`/company/${companyId}`);
}

export const getCompaniesByAdvisor = async () => {
  return apiHelper.get<Company[]>("/company/advisor");
};

export const setActiveCompany = async (companyId: string) => {
  return await apiHelper.post<{ access_token: string, user: any }>('/company/set-active', { companyId });
}

export const getIntegrationToken = async () => {
  return await apiHelper.get<string>("/company/integration-token");
}

export const generateIntegrationToken = async () => {
  return await apiHelper.get<string>("/company/generate-integration-token");
}