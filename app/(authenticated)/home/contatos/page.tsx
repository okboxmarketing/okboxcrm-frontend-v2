'use client'

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Trash, MessageCircle } from "lucide-react";
import { syncContacts, createContact, deleteContact } from "@/service/contactService";
import { Contact } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IMaskInput } from "react-imask";
import { ContactListSkeleton } from "@/components/skeleton/contact-list-skeleton";
import { useContacts } from "@/hooks/swr/use-contacts-swr";
import { formatPhone } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDynamicLimit } from "@/hooks/use-dynamic-limit";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { getTicketByContactId, createTicketFromCRM } from "@/service/ticketsService";

const ContatosPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [syncLoading, setTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [phone, setPhone] = useState("");
  const [creatingContact, setCreatingContact] = useState(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const dynamicLimit = useDynamicLimit();
  const router = useRouter();
  const chatStore = useChatStore();

  const { contacts, totalPages, total, loading, mutate } = useContacts(page, dynamicLimit, activeSearchTerm || undefined);

  const handleCreateContact = async () => {
    setCreatingContact(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      await createContact(cleanedPhone, name);
      toast({ description: "Contato criado com sucesso!" });
      mutate();
      setOpen(false);
      setName("");
      setPhone("");
    } catch (err) {
      if (err instanceof Error) {
        toast({ description: err.message, variant: "destructive" });
      }
    } finally {
      setCreatingContact(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      mutate();
      toast({ description: "Contato deletado com sucesso!" });
    } catch (err) {
      if (err instanceof Error) {
        toast({ description: err.message, variant: "destructive" });
      }
    }
  };

  const handleSyncContacts = async () => {
    setTransition(async () => {
      try {
        await syncContacts();
        mutate();
        toast({ description: "Contatos sincronizados com sucesso!" });
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          toast({ description: error.message, variant: "destructive" });
        }
      }
    });
  };

  const handleCreateTicket = async (contact: Contact) => {
    try {
      // Primeiro, verifica se já existe um ticket para este contato
      const existingTicket = await getTicketByContactId(contact.id);

      if (existingTicket) {
        // Se existe ticket, seleciona e navega
        chatStore.selectChat(existingTicket);
        router.push('/home/atendimento');
      } else {
        // Se não existe ticket, cria um novo com origem CRM
        await createTicketFromCRM(contact.id);

        // Busca o ticket completo para selecionar
        const fullTicket = await getTicketByContactId(contact.id);
        if (fullTicket) {
          chatStore.selectChat(fullTicket);
          router.push('/home/atendimento');
        } else {
          toast({ description: "Erro ao carregar informações do ticket.", variant: "destructive" });
        }
      }
    } catch (err) {
      console.error("Erro ao criar ou encontrar ticket:", err);
      toast({ description: "Erro ao criar ou encontrar ticket.", variant: "destructive" });
    }
  };



  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Meus Contatos</h1>
          <p className="text-black/40">Gerencie todos os seus contatos</p>
        </div>
        <Badge className="bg-black text-white px-3 py-1 text-sm">
          {total}
        </Badge>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>
        </div>

        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Pesquisar
        </Button>

        {activeSearchTerm && (
          <Button variant="outline" onClick={handleClearSearch}>
            Limpar Filtros
          </Button>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Contato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Contato</DialogTitle>
              <DialogDescription>Insira o nome e telefone</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <IMaskInput
                mask="+55 (00) 00000-0000"
                value={phone}
                onAccept={(value: string) => setPhone(value)}
                unmask={false}
                placeholder="(__) _____-____"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateContact} isLoading={creatingContact}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" disabled={syncLoading} onClick={handleSyncContacts}>
          {syncLoading ? "Sincronizando..." : "Sincronizar Contatos"}
        </Button>
      </div>

      {loading ? (
        <ContactListSkeleton />
      ) : contacts.length > 0 ? (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-100">
                    <TableCell>
                      <UserAvatar name={contact.name} pictureUrl={contact.pictureUrl} />
                    </TableCell>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{formatPhone(contact.phone)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCreateTicket(contact)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  {activeSearchTerm
                    ? "Nenhum contato encontrado com os filtros aplicados"
                    : "Nenhum contato encontrado"
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ContatosPage;
