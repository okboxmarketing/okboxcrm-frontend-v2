"use client";
import { getInstance, createInstance } from '@/service/whaInstanceService';
import React, { useEffect, useState } from 'react';

const ConectarPage: React.FC = () => {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchInstance = async () => {
    try {
      setLoading(true);
      const data = await getInstance();
      setInstance(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstance();
  }, []);

  const handleCreateInstance = async () => {
    try {
      setCreating(true);
      await createInstance();
      await fetchInstance(); // Atualiza a instância após criar
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Minha Conexão do WhatsApp</h1>

        {loading && <p className="text-center text-gray-600">Carregando...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {instance ? (
          <div className="space-y-4">
            <div className="border p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700">Instância do WhatsApp</h2>
              <p className="text-gray-600"><strong>Company ID:</strong> {instance.companyId}</p>
              <p className="text-gray-600"><strong>Session:</strong> {instance.session}</p>
              <p className={`font-semibold ${instance.status === 'CONNECTED' ? 'text-green-600' : 'text-red-600'}`}>
                <strong>Status:</strong> {instance.status || 'Desconhecido'}
              </p>
            </div>

            {instance.qrcode ? (
              <div className="flex flex-col items-center mt-6">
                <h3 className="text-lg font-semibold text-gray-700">Escaneie o QR Code</h3>
                <img src={instance.qrcode} alt="QR Code de Conexão" className="mt-2 w-40 h-40" />
              </div>
            ) : (
              <div className="border-2 border-red-500 p-4 rounded-lg text-center mt-4">
                <p className="text-red-500 font-semibold">Conecte-se para gerar o QR-Code</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Nenhuma instância encontrada.</p>
            <button
              onClick={handleCreateInstance}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4 transition ${creating ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={creating}
            >
              {creating ? "Criando Instância..." : "Criar Nova Instância"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConectarPage;
