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
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthCredentialsType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: AuthCredentialsType) => {
    setLoading(async () => {
      setError(null);
      try {
        await loginUser(data.email, data.password);
        console.log("Login efetuado com sucesso!");
        router.push("/home");
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
          {errors.email && <p className="text-red-500">{String(errors.email.message)}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
          </div>
          <Input id="password" type="password" {...register("password")} placeholder="********" required />
          {error && <p className="text-red-500">{error}</p>}
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </div>
      <div className="text-center text-sm">
        Ainda não tem conta?{" "}
        <a href="#" className="underline underline-offset-4">
          Entre em contato conosco!
        </a>
      </div>
    </form>
  )
}
