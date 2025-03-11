"use client";

import { useEffect, useState } from "react";
import { findMyCompany } from "@/service/companyService";
import { createUser } from "@/service/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserSchemaType } from "@/schema/userSchema";
import { useToast } from "@/hooks/use-toast";
import { Company, User } from "@/lib/types";

const MinhaEmpresaPage: React.FC = () => {
  const [company, setCompany] = useState<Company>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userRole: "USER",
      companyId: "",
    },
  });

  // Lê companyId do localStorage apenas no client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("companyId") || "";
      setCompanyId(id);
      setValue("companyId", id);
    }
  }, [setValue]);

  // Busca a empresa sempre que companyId for definido
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!companyId) return;
        const data = await findMyCompany();
        setCompany(data);
      } catch (err) {
        setError("Erro ao carregar empresa: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const onSubmit = async (data: UserSchemaType) => {
    setCreatingUser(true);
    try {
      await createUser(data);
      toast({
        description: "Usuário cadastrado com sucesso!",
      });
      reset();
      setOpenDialog(false);
      const updated = await findMyCompany();
      setCompany(updated);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar usuário"
      );
    } finally {
      setCreatingUser(false);
    }
  };

  if (loading) return <p className="text-center">Carregando empresa...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{company?.name}</h1>
          <p className="text-black/40">
            Assessor:{" "}
            <span>
              {company?.Advisor?.name || "Nenhum"}
              {company?.Advisor?.email && (
                <span> ({company?.Advisor?.email})</span>
              )}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setOpenDialog(true)}>Novo Usuário</Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-4 mb-2">Usuários da Empresa</h2>
      {company?.users?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {company.users.map((user: User) => (
              <TableRow key={user.id} className="hover:bg-gray-100">
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">
          Nenhum usuário cadastrado nesta empresa.
        </p>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                type="text"
                {...register("name")}
                placeholder="Digite o nome"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="Digite o email"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Digite a senha"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label>Função</Label>
              <Select
                onValueChange={(value) =>
                  setValue("userRole", value as "USER" | "ADMIN")
                }
                defaultValue="USER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel do usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creatingUser}>
                {creatingUser ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhaEmpresaPage;
