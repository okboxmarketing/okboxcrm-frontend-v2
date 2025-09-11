"use client"
import { Button } from "@/components/ui/button"
import { connect, getInstance, getStatus, logoutInstance, InstanceData } from "@/service/whaInstanceService"
import { useEffect, useState, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { io } from "socket.io-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatDate, formatPhone } from "@/lib/utils"
import { AlertCircle, CheckCircle2, CircleCheckBig, Loader2, LogOut, MessageSquare, RefreshCw, Smartphone, Users, WifiOff, Calendar, Settings, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useAuthStore from "@/store/authStore"

function ConectarPage() {
  const [base64, setBase64] = useState<string>()
  const [generatingQRCode, setGeneratingQRCode] = useTransition()
  const [disconnecting, setDisconnecting] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [instanceData, setInstanceData] = useState<InstanceData | null>(null)
  const [loadingInstanceData, setLoadingInstanceData] = useState(false)
  const { user, setCompanyImage } = useAuthStore()
  const { toast } = useToast()

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      const newStatus = await getStatus()
      if (newStatus === "close") {
        try {
          await getInstance()
          setStatus("Conectando")
        } catch {
          setStatus("Desconectado")
        }
      }
      if (newStatus === "open") {
        setStatus("Conectado")
        fetchInstanceData()
      }
      if (newStatus === "connecting") setStatus("Conectando")
    } catch (error) {
      console.error("Erro ao buscar status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInstanceData = async () => {
    setLoadingInstanceData(true)
    try {
      const data = await getInstance()
      setInstanceData(data)
      setCompanyImage(data.profilePicUrl)
    } catch (error) {
      console.error("Erro ao buscar dados da instância:", error)
    } finally {
      setLoadingInstanceData(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  useEffect(() => {
    if (!user?.companyId) {
      console.error("companyId não está disponível")
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', { transports: ["websocket"] })

    socket.on("connect", () => {
      socket.emit("join", user.companyId)
    })

    socket.on("qrCode", (qrcode: string) => setBase64(qrcode))

    socket.on("connectionStatus", (status: string) => {
      if (status === "close") {
        setStatus("Desconectado")
        setInstanceData(null)
      }
      if (status === "open") {
        setStatus("Conectado")
        setBase64(undefined)
        fetchInstanceData()
      }
      if (status === "connecting") setStatus("Conectando")
    })

    return () => {
      socket.disconnect()
    }
  }, [user?.companyId, toast])

  const handleConnect = async () => {
    setGeneratingQRCode(async () => {
      try {
        const response = await connect()

        if (response) {
          setBase64(response)
          setStatus("Conectando")
        }

        checkStatus()
      } catch (error) {
        toast({
          title: "Erro",
          description: `Não foi possível gerar o QR Code. ${error}`,
          variant: "destructive",
        })
      }
    })
  }

  const handleDisconnect = async () => {
    setDisconnecting(async () => {
      try {
        await logoutInstance()
        setStatus("Desconectado")
        setInstanceData(null)
      } catch (error) {
        console.log(error)
        toast({
          title: "Erro",
          description: "Não foi possível desconectar o WhatsApp.",
          variant: "destructive",
        })
      }
    })
  }

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="animate-spin w-6 h-6 text-gray-400" />

    switch (status) {
      case "Desconectado":
        return <WifiOff className="w-6 h-6 text-red-500" />
      case "Conectando":
        return <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
      case "Conectado":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    if (isLoading)
      return (
        <Badge variant="outline" className="animate-pulse">
          Carregando...
        </Badge>
      )

    switch (status) {
      case "Desconectado":
        return <Badge variant="destructive">Desconectado</Badge>
      case "Conectando":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Conectando
          </Badge>
        )
      case "Conectado":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Conectado
          </Badge>
        )
      default:
        return <Badge variant="outline">Não inicializado</Badge>
    }
  }

  const getStatusDescription = () => {
    if (isLoading) return "Verificando o status da conexão..."

    switch (status) {
      case "Desconectado":
        return "Sua conexão com o WhatsApp está desativada. Gere um QR Code para conectar."
      case "Conectando":
        return "Escaneie o QR Code com seu WhatsApp para finalizar a conexão."
      case "Conectado":
        return "Sua conexão com o WhatsApp está ativa. Você pode enviar e receber mensagens."
      default:
        return "Gere um QR Code para Conectar o WhatsApp."
    }
  }

  const formatNumber = (num: number): string => {
    return num > 999 ? `${(num / 1000).toFixed(1)}k` : num.toString()
  }

  return (
    <div className="flex flex-col container mx-auto p-6 w-full min-h-[80vh] gap-6">
      <div className="">
        <h1 className="text-2xl font-bold tracking-tight">Conexão WhatsApp</h1>
        <p className="text-muted-foreground">Conecte seu WhatsApp para aproveitar todas as funcionalidades do CRM</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Status da Conexão</CardTitle>
              <CardDescription>{getStatusDescription()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-4 w-full">
                <div
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-300",
                    status === "Desconectado" && "border-red-200 bg-red-50",
                    status === "Conectando" && "border-orange-200 bg-orange-50",
                    status === "Conectado" && "border-green-200 bg-green-50",
                    !status && "border-gray-200 bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone
                      className={cn(
                        "w-5 h-5",
                        status === "Desconectado" && "text-red-500",
                        status === "Conectando" && "text-orange-500",
                        status === "Conectado" && "text-green-500",
                        !status && "text-gray-500",
                      )}
                    />
                    <h3 className="font-medium">Dispositivo WhatsApp</h3>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {status === "Conectado" ? (
                      loadingInstanceData ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          <span>Carregando informações do perfil...</span>
                        </div>
                      ) : instanceData ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-16 w-16 border-2 border-green-100">
                              <AvatarImage src={instanceData.profilePicUrl || "/placeholder.svg"} alt={instanceData.profileName} />
                              <AvatarFallback className="bg-green-100 text-green-800">
                                {instanceData.profileName
                                  ? instanceData.profileName.substring(0, 2).toUpperCase()
                                  : "??"
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-base text-gray-900">{instanceData.profileName}</h4>
                              <h2 className="text-xs text-muted-foreground">{formatPhone(instanceData.phoneNumber)}</h2>
                              <p className="text-xs text-muted-foreground">Conectado e pronto para uso</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                            <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>Mensagens</span>
                              </div>
                              <span className="font-medium text-sm">{formatNumber(instanceData.messagesCount)}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>Conversas</span>
                              </div>
                              <span className="font-medium text-sm">{formatNumber(instanceData.chatsCount)}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <Users className="w-3 h-3" />
                                <span>Contatos</span>
                              </div>
                              <span className="font-medium text-sm">{formatNumber(instanceData.contactsCount)}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Conectado em:</span>
                                <span className="font-medium text-gray-700">{formatDate(instanceData.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Última atualização:</span>
                                <span className="font-medium text-gray-700">{formatDate(instanceData.updatedAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Settings className="w-3 h-3" />
                              <span>Configuração padrão:</span>
                              <p className={cn(
                                "text-xs",
                                instanceData.groupIgnore ? "text-red-500" : "text-green-500"
                              )}>
                                {instanceData.groupIgnore ? "Ignorar grupos" : "Aceitar grupos"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>Seu WhatsApp está conectado e pronto para uso.</p>
                      )
                    ) : status === "Conectando" ? (
                      <p>Aguardando confirmação do dispositivo...</p>
                    ) : status === "Desconectado" ? (
                      <p>Nenhum dispositivo conectado no momento.</p>
                    ) : (
                      <p>Gere um QR Code para vincular seu WhatsApp.</p>
                    )}
                  </div>
                </div>

                {status !== "Conectado" && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium">Instruções:</h3>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 pl-2">
                      <li>Clique em &quot;Gerar QR Code&quot; para exibir o código</li>
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Acesse Configurações &gt; Dispositivos Conectados</li>
                      <li>Escaneie o QR Code exibido na tela</li>
                      <li>Aguarde a confirmação da conexão</li>
                    </ol>
                  </div>
                )}

                {status === "Conectado" && user?.userRole === "ADMIN" && (
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                  >
                    {disconnecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Desconectar WhatsApp
                  </Button>
                )}
              </div>

              <div className="relative w-full md:w-[350px] h-[350px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <Loader2 className="animate-spin text-gray-400 w-12 h-12" />
                    </motion.div>
                  ) : base64 ? (
                    <motion.div
                      key="qrcode"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg -m-4 z-0"></div>
                      <div className="relative z-10 p-4 bg-white rounded-lg shadow-lg">
                        <img
                          src={base64 || "/placeholder.svg"}
                          width={300}
                          height={300}
                          alt="QR Code de Conexão"
                          className="rounded-md"
                        />
                        <p className="text-center text-sm mt-2 text-muted-foreground">
                          Escaneie este QR Code com seu WhatsApp
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img
                        src="/qrcode-zap.svg"
                        alt="QR Code Placeholder"
                        width={350}
                        height={350}
                        className="absolute top-0 left-0 w-full h-full opacity-10"
                      />
                      {status === "Conectado" ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <CircleCheckBig className="text-green-500" size={120} />
                          <p className="text-green-600 font-medium text-center">WhatsApp conectado com sucesso!</p>
                        </motion.div>
                      ) : (
                        <Button size="lg" className="relative z-10" onClick={handleConnect} disabled={generatingQRCode}>
                          {generatingQRCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Gerar QR-Code
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ConectarPage;