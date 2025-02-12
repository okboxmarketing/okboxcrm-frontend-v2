"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isConnected, connect } from '@/service/whaInstanceService';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const ConectarPage: React.FC = () => {
  const [base64, setBase64] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [connectedLoading, setConnectedLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      setConnectedLoading(true);
      try {
        const status = await isConnected();
        setConnected(status);
      } catch (err) {
        console.log(err)
      } finally {
        setConnectedLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleConnect = async () => {

    setShowDialog(true);
    setCreating(true);
    try {
      const response = await connect();
      setBase64(response);
      setCheckingStatus(true);

      const interval = setInterval(async () => {
        const status = await isConnected();
        if (status) {
          clearInterval(interval);
          setCheckingStatus(false);
          setShowDialog(false);
          setConnected(true);
          toast({
            title: 'Conexão estabelecida',
            description: 'Você está conectado ao WhatsApp',
          });
        }
      }, 10000);
    } catch (err) {
      console.log(err)
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 overflow-y-hidden">
      <div
        className={`flex items-center justify-between mb-4 border-t-2 rounded-md p-4 transition-all relative overflow-hidden
          ${connectedLoading ? 'shadow-none bg-transparent' : connected
            ? 'border-green-500 bg-gradient-to-b from-green-100 to-transparent'
            : 'border-red-500 bg-gradient-to-b from-red-100 to-transparent'
          }`}
      >
        <h1 className="text-2xl font-bold">Conexão</h1>
        {!connected ? (
          <h1>Você ainda não está conectado!</h1>
        ) : (
          <h1>Você está conectado! Agora pode utilizar todas as funcionalidades do CRM.</h1>
        )}
        {!connected && <Button onClick={handleConnect} disabled={creating}>Conectar</Button>}
      </div>

      {!connected && (
        <div className="relative w-full h-screen flex items-center justify-center">
          <div className="absolute flex flex-col items-center text-center px-4">
            <Image
              src={'/qrcode.svg'}
              width={350}
              height={350}
              className="max-w-full h-auto mt-6"
              alt="QR Code"
            />
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Escaneie o QR Code</DialogTitle>
          </DialogHeader>
          {base64 ? (
            <Image src={base64} width={350} height={350} alt="QR Code de Conexão" />
          ) : (
            <p className="text-gray-600">Aguardando QR Code...</p>
          )}
          {checkingStatus && <p className="text-blue-500 mt-4">Verificando conexão...</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConectarPage;
