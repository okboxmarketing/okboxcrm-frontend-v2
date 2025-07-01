"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { apiHelper } from "@/lib/apiHelper"
import { Progress } from "@/components/ui/progress"

// Schema para validação do formulário
const forgotPasswordSchema = z.object({
    email: z.string().email("Digite um e-mail válido"),
})

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
            .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
            .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
            .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function EsqueciASenhaContent() {
    const [isPending, startTransition] = useTransition()
    const [step, setStep] = useState<"request" | "reset">("request")
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    })

    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    // Se tem token na URL, vai direto para o reset
    useEffect(() => {
        if (token) {
            setStep("reset")
        }
    }, [token])

    const forgotPasswordForm = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const resetPasswordForm = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const newPassword = resetPasswordForm.watch("newPassword") || ""
    const confirmPassword = resetPasswordForm.watch("confirmPassword") || ""

    useEffect(() => {
        checkPasswordStrength()
    }, [newPassword])

    const checkPasswordStrength = () => {
        const requirements = {
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /\d/.test(newPassword),
        }

        setPasswordRequirements(requirements)

        const metRequirements = Object.values(requirements).filter(Boolean).length
        const strength = (metRequirements / 4) * 100
        setPasswordStrength(strength)
    }

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return "Muito fraca"
        if (passwordStrength < 50) return "Fraca"
        if (passwordStrength < 75) return "Média"
        return "Forte"
    }

    const onSubmitForgotPassword = async (data: ForgotPasswordForm) => {
        startTransition(async () => {
            try {
                setMessage(null)
                await apiHelper.post("/auth/forgot-password", data)
                setMessage({
                    type: "success",
                    text: "Se o e-mail estiver cadastrado, você receberá um link de recuperação em alguns minutos.",
                })
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error instanceof Error ? error.message : "Erro ao enviar e-mail de recuperação",
                })
            }
        })
    }

    const onSubmitResetPassword = async (data: ResetPasswordForm) => {
        if (!token) {
            setMessage({
                type: "error",
                text: "Token de recuperação não encontrado",
            })
            return
        }

        startTransition(async () => {
            try {
                setMessage(null)
                await apiHelper.post("/auth/reset-password", {
                    token,
                    newPassword: data.newPassword,
                })
                setMessage({
                    type: "success",
                    text: "Senha alterada com sucesso! Você será redirecionado para o login.",
                })
                // Redireciona para login após 3 segundos
                setTimeout(() => {
                    window.location.href = "/"
                }, 3000)
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error instanceof Error ? error.message : "Erro ao alterar senha",
                })
            }
        })
    }

    if (message?.type === "success" && step === "reset") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <CheckCircle className="h-12 w-12 text-black mx-auto" />
                    <h1 className="text-2xl text-gray-900">Senha alterada com sucesso</h1>
                    <p className="text-gray-600">Redirecionando para o login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Information */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o login
                        </Link>

                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-light text-gray-900">
                                {step === "request" ? "Recuperar Senha" : "Nova Senha"}
                            </h1>
                            <p className="text-lg text-gray-600 font-light">
                                {step === "request"
                                    ? "Digite seu e-mail para receber um link de recuperação"
                                    : "Crie uma senha forte e segura para sua conta"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">

                        {step === "request" ? (
                            <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm text-gray-900">
                                        E-mail
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu-email@exemplo.com"
                                            {...forgotPasswordForm.register("email")}
                                            className="pl-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    {message && (
                                        <Alert
                                            className={`${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                                        >
                                            {message.type === "success" ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                                                {message.text}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {forgotPasswordForm.formState.errors.email && (
                                        <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-black hover:bg-gray-800 text-white"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Enviando link de recuperação...
                                        </div>
                                    ) : (
                                        "Enviar Link de Recuperação"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="block text-sm text-gray-900">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Digite sua nova senha"
                                            {...resetPasswordForm.register("newPassword")}
                                            className="pr-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {resetPasswordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.newPassword.message}</p>
                                    )}
                                </div>

                                {/* Password Strength */}
                                {newPassword && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Força da senha</span>
                                            <span className="text-sm text-gray-900">{getPasswordStrengthText()}</span>
                                        </div>
                                        <Progress value={passwordStrength} className="h-1 bg-gray-200" />
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center space-x-1">
                                                {passwordRequirements.length ? (
                                                    <div className="w-1 h-1 bg-black rounded-full"></div>
                                                ) : (
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                )}
                                                <span className={passwordRequirements.length ? "text-gray-900" : "text-gray-400"}>
                                                    8+ caracteres
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {passwordRequirements.uppercase ? (
                                                    <div className="w-1 h-1 bg-black rounded-full"></div>
                                                ) : (
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                )}
                                                <span className={passwordRequirements.uppercase ? "text-gray-900" : "text-gray-400"}>
                                                    Maiúscula
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {passwordRequirements.lowercase ? (
                                                    <div className="w-1 h-1 bg-black rounded-full"></div>
                                                ) : (
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                )}
                                                <span className={passwordRequirements.lowercase ? "text-gray-900" : "text-gray-400"}>
                                                    Minúscula
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {passwordRequirements.number ? (
                                                    <div className="w-1 h-1 bg-black rounded-full"></div>
                                                ) : (
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                )}
                                                <span className={passwordRequirements.number ? "text-gray-900" : "text-gray-400"}>Número</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm text-gray-900">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirme sua nova senha"
                                            {...resetPasswordForm.register("confirmPassword")}
                                            className="pr-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-sm text-red-600">As senhas não coincidem</p>
                                    )}
                                    {resetPasswordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-black hover:bg-gray-800 text-white"
                                    disabled={isPending || passwordStrength < 75 || newPassword !== confirmPassword}
                                >
                                    {isPending ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Alterando...
                                        </div>
                                    ) : (
                                        "Alterar Senha"
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Lembrou sua senha?{" "}
                                <Link href="/" className="text-black hover:underline font-medium">
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function EsqueciASenha() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        }>
            <EsqueciASenhaContent />
        </Suspense>
    )
}
