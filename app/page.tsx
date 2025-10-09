import Image from "next/image"
import { AlertCircle } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              src="/logo.png"
              alt="Logo"
              width={200}
              height={40}
              priority
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-amber-100 p-3">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <h1 className="text-2xl font-bold text-amber-900">
                    Aviso aos clientes Okbox
                  </h1>
                  <div className="space-y-3 text-amber-900">
                    <p>
                      Nosso CRM está passando por atualizações importantes. O WhatsApp realizou grandes mudanças recentes, e isso impactou diretamente nossas integrações.
                    </p>
                    <p>
                      Estamos realizando ajustes técnicos e melhorias para garantir a melhor experiência e estabilidade no uso da plataforma.
                    </p>
                    <p>
                      Durante esse período, recomendamos o uso temporário do <strong>WhatsApp Business comum</strong> para manter o atendimento aos clientes.
                    </p>
                    <div className="rounded-md bg-amber-100 p-4">
                      <p className="font-medium">
                        Dúvidas? Entre em contato com o seu assessor no seu grupo da Okbox
                      </p>
                    </div>
                    <p>
                      Agradecemos a sua compreensão e parceria. Em breve, tudo voltará ao normal ainda melhor do que antes!
                    </p>
                    <p className="pt-2 font-semibold">
                      Atenciosamente,<br />
                      João Vila Nova
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/loginPlaceholder.png"
          alt="Image"
          layout="fill"
          objectFit="cover"
          className="dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
