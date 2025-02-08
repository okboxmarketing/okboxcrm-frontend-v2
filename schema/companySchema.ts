import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string()
    .min(3, "O nome da empresa deve ter no mínimo 3 caracteres.")
    .nonempty("O nome da empresa é obrigatório"),
});

export type CompanySchemaType = z.infer<typeof companySchema>;
