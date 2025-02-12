import { apiHelper } from "@/lib/apiHelper";
import { CompanySchemaType } from "@/schema/companySchema";

export const createCompany = async (company: CompanySchemaType) => {
  return apiHelper.post("/company", company);
};

export const findCompanyById = async (companyId: string) => {
  return apiHelper.get(`/company/${companyId}`);
};

export const findAllCompanies = async () => {
  return apiHelper.get("/company");
};

export const findMyCompany = async () => {
  return apiHelper.get("/company/my-company");
};

export const assignAccessorToCompany = async (accessorEmail: string, companyId: string) => {
  return apiHelper.post("/company/assign-accessor", { accessorEmail, companyId });
}
