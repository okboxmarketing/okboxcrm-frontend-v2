import { apiHelper } from "@/lib/apiHelper";
import { Company } from "@/lib/types";
import { CompanySchemaType } from "@/schema/companySchema";

export const createCompany = async (company: CompanySchemaType) => {
  return apiHelper.post("/company", company);
};

export const findCompanyById = async (companyId: string) => {
  return apiHelper.get<Company>(`/company/${companyId}`);
};

export const findAllCompanies = async () => {
  return apiHelper.get<Company[]>("/company");
};

export const findMyCompany = async () => {
  return apiHelper.get<Company>("/company/my-company");
};

export const assignAccessorToCompany = async (accessorEmail: string, companyId: string) => {
  return apiHelper.post("/company/assign-accessor", { accessorEmail, companyId });
}
