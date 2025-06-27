import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Email inválido").nonempty("O email é obrigatório"),
  name: z.string().nonempty("O nome é obrigatório"),
  companyId: z.string().optional(),
  userRole: z.enum(["USER", "ADMIN"]),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido").nonempty("O email é obrigatório"),
  password: z.string().nonempty("A senha é obrigatória"),
})

export type UserSchemaType = z.infer<typeof userSchema>;
