"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/schema/userSchema"
import { loginUser } from "@/service/userService"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import FormError from "./ui/form-error";
import Link from "next/link";

type AuthCredentialsType = {
  email: string
  password: string
}
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [loading, setLoading] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
  } = useForm<AuthCredentialsType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: AuthCredentialsType) => {
    setLoading(async () => {
      setError(null);
      try {
        const response = await loginUser(data.email.toLowerCase(), data.password);
        if (response?.access_token) {
          await login(response.access_token, response.whatsappConnection);
        }
        switch (useAuthStore.getState().user?.userRole) {
          case "MASTER":
            router.push("/home/empresas");
            break;
          case "ADMIN":
            router.push("/home/atendimento");
            break;
          case "ADVISOR":
            router.push("/home/empresas");
            break;
          default:
            router.push("/home/atendimento");
            break;
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    })
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)}{...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Entre na sua conta!</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Entre na sua conta para usar o CRM!
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
          </div>
          <Input id="password" type="password" {...register("password")} placeholder="********" required />
        </div>
        {error && <FormError message={error} />}
        <Button type="submit" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </div>
      <div className="text-center text-sm">
        <Link href="/esqueci-a-senha">
          Esqueceu sua senha?
        </Link>
      </div>
    </form>
  )
}
