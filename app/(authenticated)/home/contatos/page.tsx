"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";
import { getContacts } from "@/service/contactService";

const ContatosPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (err) {
        setError("Erro ao carregar contatos");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // const handleDelete = async (id: string) => {
  //   try {
  //     await deleteContact(id);
  //     setContacts((prev) => prev.filter((contact) => contact.id !== id));
  //     toast({ description: "Contato excluído com sucesso!" });
  //   } catch {
  //     toast({ description: "Erro ao excluir contato", variant: "destructive" });
  //   }
  // };

  if (loading) return <p className="text-center">Carregando contatos...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Meus Contatos</h1>

      {contacts.length > 0 ? (
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
                  <Button variant="destructive" size="sm" onClick={() => (console.log("delete"))}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">Nenhum contato encontrado.</p>
      )}
    </div>
  );
};

export default ContatosPage;
