"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Eye,
    EyeOff,
    RefreshCw,
    Webhook,
    Copy,
    Check,
    Settings,
    Code,
    TestTube,
    AlertCircle,
    CheckCircle2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { generateIntegrationToken, getIntegrationToken } from "@/service/companyService"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function IntegracaoPage() {
    const [showToken, setShowToken] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [integrationUrl, setIntegrationUrl] = useState("")
    const [copied, setCopied] = useState(false)
    const [hasToken, setHasToken] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast()

    const fetchIntegrationUrl = async () => {
        try {
            setIsInitialLoading(true)
            const response = await getIntegrationToken()
            if (response) {
                setIntegrationUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/webhook/contact/${response}`)
                setHasToken(true)
            } else {
                setHasToken(false)
            }
        } catch (error) {
            console.error("Erro ao buscar URL de integração:", error)
            toast({
                title: "Você não tem uma empresa ativa",
                description: "Por favor, selecione uma empresa para continuar",
                variant: "destructive",
            })
        } finally {
            setIsInitialLoading(false)
        }
    }

    useEffect(() => {
        fetchIntegrationUrl()
    }, [])

    const handleRefreshToken = async () => {
        try {
            setIsLoading(true)
            const newToken = await generateIntegrationToken()
            setIntegrationUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/webhook/contact/${newToken}`)
            setHasToken(true)
            toast({
                title: "Token de integração atualizado com sucesso!",
            })
        } catch (error) {
            console.error("Erro ao atualizar token de integração:", error)
            toast({
                title: "Erro ao atualizar token de integração",
                description: "Ocorreu um erro ao atualizar o token de integração",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsDialogOpen(false)
        }
    }

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(integrationUrl)
            setCopied(true)
            toast({
                title: "URL copiada!",
                description: "A URL de integração foi copiada para a área de transferência",
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Erro ao copiar URL:", error)
            toast({
                title: "Erro ao copiar URL",
                description: "Não foi possível copiar a URL de integração",
                variant: "destructive",
            })
        }
    }

    const integrationSteps = [
        {
            icon: Settings,
            title: "Configure o Formulário",
            description: "Adicione os campos necessários ao seu formulário",
            details: ["Nome", "Telefone (com DDD)"],
        },
        {
            icon: Code,
            title: "Configure o Webhook",
            description: "Mapeie os campos do formulário para as variáveis corretas",
            details: ["Nome do Contato → name", "Telefone (com DDD) → phone", "URL → origin"],
        },
        {
            icon: TestTube,
            title: "Teste a Integração",
            description: "Envie um teste e verifique se o contato aparece no CRM",
            details: ["Preencha o formulário", "Verifique no Okbox CRM", "Confirme os dados"],
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto p-6">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Webhook className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Integração via Webhook</h1>
                            <p className="text-slate-600 mt-1">Conecte seus formulários diretamente ao Okbox CRM</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Integration URL Card */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        URL de Integração
                                        {hasToken && !isInitialLoading && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Ativo
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {isInitialLoading ? (
                                            <Skeleton className="h-4 w-[300px]" />
                                        ) : hasToken ? (
                                            "Use esta URL para integrar seu formulário com o Okbox CRM"
                                        ) : (
                                            "Gere um token de integração para começar a usar o webhook"
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isInitialLoading ? (
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 flex-1" />
                                    <Skeleton className="h-12 w-12" />
                                    <Skeleton className="h-12 w-12" />
                                    <Skeleton className="h-12 w-12" />
                                </div>
                            ) : hasToken ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <code className="block bg-slate-100 border border-slate-200 p-3 rounded-lg text-sm font-mono break-all">
                                                {showToken
                                                    ? integrationUrl
                                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/webhook/contact/••••••••••••••••`}
                                            </code>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setShowToken(!showToken)}
                                                className="h-12 w-12"
                                            >
                                                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleCopyUrl}
                                                disabled={!showToken}
                                                className="h-12 w-12"
                                            >
                                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" disabled={isLoading} className="h-12 w-12">
                                                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Gerar novo token de integração?</DialogTitle>
                                                        <DialogDescription>
                                                            Ao gerar um novo token, todos os formulários que estiverem usando o token atual serão
                                                            desconfigurados e precisarão ser atualizados com o novo token.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                            Cancelar
                                                        </Button>
                                                        <Button onClick={handleRefreshToken} disabled={isLoading}>
                                                            {isLoading ? (
                                                                <>
                                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                                    Gerando...
                                                                </>
                                                            ) : (
                                                                "Gerar novo token"
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="mb-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Webhook className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 mb-4">Nenhum token de integração encontrado</p>
                                    </div>
                                    <Button onClick={handleRefreshToken} disabled={isLoading} className="gap-2" size="lg">
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                        Gerar Token de Integração
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Como Integrar</CardTitle>
                            <CardDescription>Siga os passos abaixo para integrar seu formulário ao Okbox CRM</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {integrationSteps.map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <step.icon className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                                    Passo {index + 1}
                                                </span>
                                                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                                            </div>
                                            <p className="text-slate-600 mb-3">{step.description}</p>
                                            <div className="space-y-1">
                                                {step.details.map((detail, detailIndex) => (
                                                    <div key={detailIndex} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                        <span>{detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Exemplo de Mapeamento
                                </h3>
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                    <pre className="text-sm">
                                        {`{
  "name": "Nome do Contato",
  "phone": "11999999999",
  "origin": "Site Principal"
}`}
                                    </pre>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Important Notes */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    Observações Importantes
                                </h3>
                                <div className="grid gap-3">
                                    {[
                                        "O telefone deve ser enviado apenas com números e com o DDD (ex: 1199999999)",
                                        "O campo origem é opcional e pode ser usado para identificar de onde veio o contato",
                                        "Mantenha seu token de integração seguro e não o compartilhe",
                                        "Se necessário, você pode gerar um novo token usando o botão de refresh",
                                    ].map((note, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                                        >
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-amber-800">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
