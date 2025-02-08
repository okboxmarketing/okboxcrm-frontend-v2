import { CompanySchemaType } from "@/schema/companySchema";

export const createCompany = async (company: CompanySchemaType) => {
  console.log("Service createCompany: ", company);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });

    const responseData = await response.json();

    console.log("Response status: ", response.status);
    console.log("Response body: ", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Erro desconhecido");
    }

    return responseData;

  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro inesperado");
  }
};
