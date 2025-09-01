"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error("Erro da aplicação:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <Image src="/logo.png" alt="OKBox CRM" width={500} height={500} />
        <div className="mb-8">
          <div className="flex items-center text-red-400 justify-center mx-auto mb-6">
            <AlertTriangle className="h-20 w-20" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">Algo deu errado</h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Ops! Ocorreu um erro inesperado. Tente novamente mais tarde!
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à página anterior
          </Button>
        </div>
      </div>
    </div>
  )
}