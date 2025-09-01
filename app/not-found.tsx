"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <Image src="/logo.png" alt="OKBox CRM" width={500} height={500} />
        <div className="mb-8">
          <div className="flex items-center text-gray-400 justify-center mx-auto mb-6 text-8xl font-bold">
            <span>404</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">Página não encontrada</h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Ops! A página que você está procurando não existe!
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/home">
            <Button className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base">Voltar ao Dashboard</Button>
          </Link>

          <Button variant="outline" className="w-full h-12 bg-transparent" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à página anterior
          </Button>
        </div>
      </div>
    </div>
  )
}
