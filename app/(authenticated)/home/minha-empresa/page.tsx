"use client";

import { useEffect, useState } from "react";
import { findMyCompany } from "@/service/companyService";
import { createUser, deleteUser } from "@/service/userService";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserSchemaType } from "@/schema/userSchema";
import { useToast } from "@/hooks/use-toast";
import { Company, User } from "@/lib/types";
import { Trash } from 'lucide-react';
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

const MinhaEmpresaPage: React.FC = () => {
  const [company, setCompany] = useState<Company>();
  const { user } = useAuthStore();
  const requestUserRole = user?.userRole;
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const { toast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
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

  const fetchCompany = async () => {
    try {
      const data = await findMyCompany();
      setCompany(data);
      setValue("companyId", data.id);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const onSubmit = async (data: UserSchemaType) => {
    console.log(data);
    setCreatingUser(true);
    try {
      await createUser(data);
      toast({
        description: "Usuário cadastrado com sucesso!",
      });
      reset({ ...data, name: "", email: "", password: "" });
      setOpenDialog(false);
      const updated = await findMyCompany();
      setCompany(updated);
    } catch (error) {
      console.log(error);
      toast({ variant: "destructive", description: "Erro ao cadastrar usuário." });
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-gray-200">
              <AvatarImage
                src={company?.profileImage || "/placeholder.svg"}
                alt={company?.name || "Empresa"}
              />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {company?.name ? getInitials(company.name) : "CO"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{company?.name}</h1>
            <p className="text-muted-foreground">
              Assessor:{" "}
              <span>
                {company?.Advisor?.name || "Nenhum"}
                {company?.Advisor?.email && (
                  <span> ({company?.Advisor?.email})</span>
                )}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {requestUserRole === "ADMIN" && (
            <Button onClick={() => setOpenDialog(true)}>Novo Usuário</Button>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-4 mb-2">Usuários da Empresa</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {company?.users.map((user: User) => (
              <TableRow key={user.id} className="hover:bg-gray-100">
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                    {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {requestUserRole === "ADMIN" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(user);
                        setConfirmDialogOpen(true);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!company?.users || company.users.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input type="text" {...register("name")} placeholder="Digite o nome" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="Digite o email" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" {...register("password")} placeholder="Digite a senha" />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div>
              <Label>Função</Label>
              <Controller
                control={control}
                name="userRole"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel do usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userRole && <p className="text-red-500 text-sm">{errors.userRole.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creatingUser} isLoading={creatingUser}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!userToDelete) return;
                try {
                  await deleteUser(userToDelete.id);
                  toast({ description: "Usuário excluído com sucesso!" });
                  const updated = await findMyCompany();
                  setCompany(updated);
                } catch (error) {
                  toast({
                    variant: "destructive",
                    description: String(error),
                  });
                } finally {
                  setConfirmDialogOpen(false);
                  setUserToDelete(null);
                }
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhaEmpresaPage;
