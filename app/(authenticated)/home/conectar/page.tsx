"use client";
import { Button } from '@/components/ui/button';
import { connect, createInstance, getStatus } from '@/service/whaInstanceService';
import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { syncContacts } from '@/service/contactService';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CircleCheckBig, Loader2 } from 'lucide-react';

const ConectarPage: React.FC = () => {
  const [base64, setBase64] = useState<string>();
  const [generatingQRCode, setGeneratingQRCode] = useTransition();
  const [creatingInstance, setCreatingInstanceTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const newStatus = await getStatus();
      if (newStatus === "close") setStatus("Desconectado");
      if (newStatus === "open") setStatus("Conectado");
      if (newStatus === "connecting") setStatus("Conectando");
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        socket.emit("join", companyId);
      }
    });

    socket.on("qrCode", (qrcode: string) => setBase64(qrcode));

    socket.on("connectionStatus", (status: string) => {
      if (status === "close") setStatus("Desconectado");
      if (status === "open") {
        setStatus("Conectado");
        setBase64(undefined);
        handleSyncContacts();
      }
      if (status === "connecting") setStatus("Conectando");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSyncContacts = async () => {
    try {
      await syncContacts();
      toast({ title: "Contatos sincronizados", description: "Os contatos foram sincronizados com sucesso!" });
    } catch (err) {
      console.log(err);
      toast({
        title: "Erro ao sincronizar contatos",
        description: "Ocorreu um erro ao sincronizar os contatos. Tente novamente mais tarde.",
        variant: "destructive",
      })
    };
  }

  const handleConnect = async () => {
    setGeneratingQRCode(async () => {
      await connect();
      checkStatus();
    });
  };

  const handleCreateInstance = async () => {
    setCreatingInstanceTransition(async () => {
      try {
        await createInstance();
        toast({ title: "Conexão criada", description: "A conexão foi criada com sucesso!" });
        checkStatus();
      } catch (err) {
        console.log(err);
      }
    })
  };

  return (
    <div className="flex flex-col container mx-auto p-6 w-full h-full gap-6">
      <div>
        <h1 className="text-2xl font-bold">Conexão</h1>
        <p className="text-black/40">Conecte-se para aproveitar todas as funcionalidades de nosso CRM!</p>
      </div>

      <Card
        className={cn(
          "flex justify-between p-6 border transition-shadow duration-200",
          status === "Desconectado" && "border-red-500 shadow-red-300 shadow-sm",
          status === "Conectando" && "border-orange-500 shadow-orange-300 shadow-sm",
          status === "Conectado" && "border-green-500 shadow-green-300 shadow-sm"
        )}
      >
        <div>
          <div className="flex gap-2 items-center">
            {isLoading ? (
              <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
            ) : (
              <span
                className={cn(
                  "w-4 h-4 transition-shadow duration-200 rounded-full",
                  status === "Desconectado" && "bg-red-500 shadow-red-300 shadow-sm",
                  status === "Conectando" && "bg-orange-500 shadow-orange-300 shadow-sm",
                  status === "Conectado" && "bg-green-500 shadow-green-300 shadow-sm"
                )}
              />
            )}
            <p
              className={cn(
                "font-medium transition-colors duration-200",
                status === "Desconectado" && "text-red-500",
                status === "Conectando" && "text-orange-500",
                status === "Conectado" && "text-green-500"
              )}
            >
              {isLoading ? "Carregando..." : status}
            </p>
          </div>
          <p>Nome</p>
          <p>Foto do User</p>
        </div>

        {isLoading ? (
          <div className="relative w-[350px] h-[350px] flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400 w-12 h-12" />
          </div>
        ) : base64 ? (
          <Image src={base64} width={350} height={350} alt="QR Code de Conexão" />
        ) : (
          <div className="relative w-[350px] h-[350px] flex items-center justify-center">
            <Image
              src="/qrcode-zap.svg"
              alt="QR Code Placeholder"
              layout="fill"
              objectFit="cover"
              className="absolute top-0 left-0 w-full h-full opacity-10"
            />
            {status === "Conectado" ? (
              <CircleCheckBig className="text-green-500" size={150} />
            ) : (
              !status ? (
                <Button className="relative z-10" onClick={handleCreateInstance} isLoading={creatingInstance}>
                  Criar Conexão
                </Button>
              ) : (
                <Button className="relative z-10" onClick={handleConnect} isLoading={generatingQRCode}>
                  Gerar QR-Code
                </Button>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConectarPage;
