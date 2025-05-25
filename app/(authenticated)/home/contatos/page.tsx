'use client'

import React, { Fragment, useEffect, useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Trash } from "lucide-react";
import { syncContacts, createContact, findContact, deleteContact } from "@/service/contactService";
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

const ContatosPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isFetched, setIsFetched] = useState(false);
  const [syncLoading, setTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [phone, setPhone] = useState("");
  const [creatingContact, setCreatingContact] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<Contact[] | null>(null);
  const dynamicLimit = useDynamicLimit();

  const { contacts, totalPages, total, loading, mutate } = useContacts(page, dynamicLimit);

  useEffect(() => {
    if (!loading) setIsFetched(true);
  }, [loading]);

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

  const findContacts = async (name: string) => {
    if (name.length === 0) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await findContact(name);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(() => {
      findContacts(searchTerm);
    }, 500);

    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

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

  const displayedContacts = searchResults ?? contacts;

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Meus Contatos</h1>
          <Badge className="bg-black text-white px-3 py-1 text-sm">{total}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Pesquisar contato"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-r-none"
          />
          <Button className="rounded-l-none">
            <Search />
          </Button>
        </div>
        <div className="flex items-center gap-4">
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

          <Button disabled={syncLoading} onClick={handleSyncContacts}>
            {syncLoading ? "Sincronizando..." : "Sincronizar Contatos"}
          </Button>
        </div>
      </div>

      {loading ? (
        <ContactListSkeleton />
      ) : displayedContacts.length > 0 ? (
        <Fragment>
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
                {displayedContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-100">
                    <TableCell>
                      <UserAvatar name={contact.name} pictureUrl={contact.pictureUrl} />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{formatPhone(contact.phone)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {/* <button>
                        <MessageCircle onClick={() => handleCreateTicket(contact.remoteJid)} />
                      </button> */}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
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
        </Fragment>
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
  );
};

export default ContatosPage;
