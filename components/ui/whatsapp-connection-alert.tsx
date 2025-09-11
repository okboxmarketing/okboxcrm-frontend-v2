"use client";

import { useWhatsAppConnection } from "@/hooks/use-whatsapp-connection";
import { WifiOff, X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/authStore";

interface WhatsAppConnectionAlertProps {
    className?: string;
    showWhenConnected?: boolean;
}

export function WhatsAppConnectionAlert({
    className = "",
}: WhatsAppConnectionAlertProps) {
    const { isConnected, isConnecting, whatsappConnection, isNotStarted } = useWhatsAppConnection();
    const [isVisible, setIsVisible] = useState(true);
    const [previousStatus, setPreviousStatus] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuthStore();

    useEffect(() => {
        if (previousStatus && previousStatus !== whatsappConnection) {
            if (whatsappConnection === 'open') {
                toast({
                    title: "WhatsApp Conectado",
                    description: "Sua conexão com o WhatsApp foi restaurada!",
                    duration: 3000,
                });
                setIsVisible(false);
            } else if (whatsappConnection === 'close' && previousStatus === 'open') {
                toast({
                    title: "WhatsApp Desconectado",
                    description: "Sua conexão com o WhatsApp foi perdida. Verifique a conexão.",
                    variant: "destructive",
                    duration: 5000,
                });
                setIsVisible(true);
            }
        }
        setPreviousStatus(whatsappConnection);
    }, [whatsappConnection, previousStatus, toast]);

    if (!isVisible || (isConnected && !isNotStarted) || user?.userRole === "ADVISOR" || user?.userRole === "MASTER") return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
            <div className={`
                rounded-lg shadow-lg border p-4 
                ${isConnecting
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : isNotStarted
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }
            `}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {isConnecting ? (
                            <RefreshCw className="h-5 w-5 text-orange-600 animate-spin" />
                        ) : isNotStarted ? (
                            <WifiOff className="h-5 w-5 text-blue-600" />
                        ) : (
                            <WifiOff className="h-5 w-5 text-red-600" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium mb-1">
                            {isConnecting
                                ? 'Conectando WhatsApp'
                                : isNotStarted
                                    ? 'WhatsApp Não Conectado'
                                    : 'WhatsApp Desconectado'
                            }
                        </h4>
                        <p className="text-sm text-opacity-80 mb-3">
                            {isConnecting
                                ? 'Aguardando conexão com o WhatsApp...'
                                : isNotStarted
                                    ? 'Você ainda não conectou seu WhatsApp. Inicie para liberar o atendimento e todas as funcionalidades do CRM.'
                                    : 'Sua conexão com o WhatsApp foi perdida. Conecte novamente para continuar usando o atendimento.'
                            }
                        </p>

                        {!isConnecting && (
                            <div className="flex gap-2">
                                {user?.userRole === 'ADMIN' && (
                                    <Button asChild size="sm" variant="outline" className="text-xs">
                                        <Link href="/home/conectar">
                                            {isNotStarted ? 'Conectar WhatsApp' : 'Reconectar WhatsApp'}
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`text-xs ${isNotStarted
                                        ? 'text-blue-600 hover:text-blue-700'
                                        : 'text-red-600 hover:text-red-700'
                                        }`}
                                    onClick={() => setIsVisible(false)}
                                >
                                    Ignorar
                                </Button>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-opacity-60 hover:text-opacity-80 p-1 h-auto"
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 