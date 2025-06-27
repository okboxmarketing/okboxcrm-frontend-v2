"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getInviteByToken, acceptInvite } from "@/service/userService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { Invite } from "@/types/invites"

function AceitarConviteContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [inviteData, setInviteData] = useState<Invite | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Password states
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Password strength
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    })

    useEffect(() => {
        if (!token) {
            setError("Token de convite não encontrado")
            setLoading(false)
            return
        }

        fetchInviteData()
    }, [token])

    useEffect(() => {
        checkPasswordStrength()
    }, [password])

    const fetchInviteData = async () => {
        try {
            const response = (await getInviteByToken(token!))
            setInviteData(response)
        } catch (error) {
            if (error instanceof Error) {
                // Captura erro de convite expirado ou não encontrado
                if (error.message === "Convite expirado") {
                    setError("Convite expirado")
                } else if (error.message) {
                    setError(error.message)
                } else {
                    setError("Erro ao carregar convite")
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const checkPasswordStrength = () => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            return
        }

        if (passwordStrength < 75) {
            setError("A senha deve atender a todos os requisitos de segurança")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            await acceptInvite(token!, password)
            setSuccess(true)
            setTimeout(() => {
                router.push("/")
            }, 3000)
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || "Erro ao aceitar convite")
            } else {
                setError("Erro ao aceitar convite")
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto"></div>
                    <p className="text-lg text-gray-900">Carregando convite...</p>
                </div>
            </div>
        )
    }

    if (error && !inviteData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <XCircle className="h-12 w-12 text-black mx-auto" />
                    <h1 className="text-2xl text-gray-900">
                        {error === "Convite expirado" ? "Convite Expirado" : "Erro no convite"}
                    </h1>
                    <p className="text-gray-600">
                        {error === "Convite expirado"
                            ? "Este convite expirou. Entre em contato com o administrador para solicitar um novo convite."
                            : error
                        }
                    </p>
                    <Button onClick={() => router.push("/")} className="w-full bg-black hover:bg-gray-800 text-white">
                        Voltar ao Login
                    </Button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <CheckCircle className="h-12 w-12 text-black mx-auto" />
                    <h1 className="text-2xl  text-gray-900">Conta criada com sucesso</h1>
                    <p className="text-gray-600">Redirecionando para o login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Invite Information */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-light text-gray-900">Aceitar Convite</h1>
                            <p className="text-lg text-gray-600 font-light">Complete seu cadastro para acessar o sistema</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-lg text-gray-900">{inviteData?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-500">Empresa</p>
                                    <p className="text-lg text-gray-900">{inviteData?.companyName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                <div>
                                    <p className="text-sm text-gray-500">Função</p>
                                    <p className="text-lg text-gray-900">{inviteData?.role === "USER" ? "Usuário" : "Administrador"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="border-red-200 bg-red-50">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription className="text-red-800">{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm text-gray-900">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Digite sua senha"
                                        className="pr-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength - Compact */}
                            {password && (
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
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirme sua senha"
                                        className="pr-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-sm text-red-600">As senhas não coincidem</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-black hover:bg-gray-800 text-white"
                                disabled={submitting || passwordStrength < 75 || password !== confirmPassword}
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Criando conta...
                                    </div>
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AceitarConvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto"></div>
                    <p className="text-lg text-gray-900">Carregando...</p>
                </div>
            </div>
        }>
            <AceitarConviteContent />
        </Suspense>
    )
}
