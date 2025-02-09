import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Email inválido").nonempty("O email é obrigatório"),
  name: z.string().nonempty("O nome é obrigatório"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve ter pelo menos 1 letra maiúscula")
    .regex(/[a-z]/, "A senha deve ter pelo menos 1 letra minúscula")
    .regex(/[0-9]/, "A senha deve ter pelo menos 1 número"),
  companyId: z.string().nonempty("A empresa é obrigatória"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido").nonempty("O email é obrigatório"),
  password: z.string().nonempty("A senha é obrigatória"),
})

export type UserSchemaType = z.infer<typeof userSchema>;
