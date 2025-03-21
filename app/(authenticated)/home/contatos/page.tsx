"use client"

import type React from "react"
import { useEffect, useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash } from 'lucide-react'
import { getContacts, syncContacts } from "@/service/contactService"
import type { Contact } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

const ContatosPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isFetched, setIsFetched] = useState(false)
  const [syncLoading, setTransition] = useTransition()
  const [totalContacts, setTotalContacts] = useState(0)

  const fetchContacts = async (currentPage = 1) => {
    setLoading(true)
    try {
      const { data, totalPages, total } = await getContacts(currentPage)
      setTotalContacts(total)
      setContacts(data)
      setTotalPages(totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setIsFetched(true)
    }
  }

  useEffect(() => {
    fetchContacts(page)
  }, [page])

  const handleSyncContacts = async () => {
    setTransition(async () => {
      try {
        await syncContacts()
        fetchContacts(page)
        toast({ description: "Contatos sincronizados com sucesso!" })
      } catch (error) {
        console.error(error)
        toast({
          description: "Erro ao sincronizar contatos",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Meus Contatos</h1>
          <Badge className="bg-black text-white px-3 py-1 text-sm">
            {totalContacts}
          </Badge>
        </div>
        <div >
          <Button disabled={syncLoading} onClick={handleSyncContacts}>
            {syncLoading ? "Sincronizando..." : "Sincronizar Contatos"}
          </Button>
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Carregando contatos...</p>
      ) : contacts.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-100">
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={contact.pictureUrl} alt={contact.name} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => console.log("delete")}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Componente de paginação */}
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {page > 1 ? (
                    <PaginationPrevious onClick={() => setPage((prev) => Math.max(prev - 1, 1))} />
                  ) : (
                    <PaginationPrevious className="pointer-events-none opacity-50" aria-disabled="true" />
                  )}
                </PaginationItem>

                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {totalPages > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

                {totalPages > 3 && (
                  <PaginationItem>
                    {page < totalPages ? (
                      <PaginationNext onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} />
                    ) : (
                      <PaginationNext className="pointer-events-none opacity-50" aria-disabled="true" />
                    )}
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        isFetched && (
          <div className="flex items-center flex-col gap-2">
            <p className="text-center text-gray-500">Nenhum contato encontrado.</p>
            <Button disabled={syncLoading} onClick={handleSyncContacts}>
              {syncLoading ? "Sincronizando..." : "Sincronizar Contatos"}
            </Button>
          </div>
        )
      )}
    </div>
  )
}

export default ContatosPage
