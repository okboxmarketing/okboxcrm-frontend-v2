"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { assignAccessorToCompany, findCompanyById } from "@/service/companyService";
import { createUser } from "@/service/userService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserSchemaType } from "@/schema/userSchema";
import { useToast } from "@/hooks/use-toast";
import { assignAccessorSchema } from "@/schema/companySchema";

const EmpresaPage: React.FC = () => {
  const pathname = usePathname();
  const companyId = pathname.split("/").pop();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAccessorDialog, setOpenAccessorDialog] = useState(false);
  const [assigningAccessor, setAssigningAccessor] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register: registerAccessor,
    handleSubmit: handleSubmitAccessor,
    reset: resetAccessorForm,
    formState: { errors: errorsAccessor },
  } = useForm<{ accessorEmail: string }>({
    resolver: zodResolver(assignAccessorSchema),
    defaultValues: {
      accessorEmail: "",
    },
  });


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
      companyId: companyId || ""
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!companyId) return;
        const data = await findCompanyById(companyId);
        setCompany(data);
      } catch (err) {
        setError("Erro ao carregar empresa");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      setValue("companyId", companyId);
    }
  }, [companyId, setValue]);

  const onSubmit = async (data: UserSchemaType) => {
    setCreatingUser(true);
    try {
      await createUser(data);
      toast({
        description: "Usuário cadastrado com sucesso!",
      });
      reset()
      setOpenDialog(false);
      setCompany(await findCompanyById(companyId!));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao cadastrar usuário");
    } finally {
      setCreatingUser(false);
    }
  };

  const onSubmitAccessor = async (data: { accessorEmail: string }) => {
    setAssigningAccessor(true);
    try {
      await assignAccessorToCompany(data.accessorEmail, companyId!);
      toast({ description: "Acessor atribuído com sucesso!" });
      resetAccessorForm();
      setOpenAccessorDialog(false);
      setCompany(await findCompanyById(companyId!));
    } catch (error) {
      if (error instanceof Error) {
        toast({
          description: error.message,
          variant: "destructive"
        })

      }
    } finally {
      setAssigningAccessor(false);
    }
  };


  if (loading) return <p className="text-center">Carregando empresa...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{company?.name}</h1>
          <p className="text-black/40">Acessor: <span>{company.Accessory.name || "Nenhum"} ({company.Accessory.email || ""})</span></p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setOpenDialog(true)}>Novo Usuário</Button>
          {!company.Accessory.email && (<Button onClick={() => setOpenAccessorDialog(true)}>Novo Acessor</Button>)}
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-4 mb-2">Usuários da Empresa</h2>
      {company?.users?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {company.users.map((user: any) => (
              <TableRow key={user.id} className="hover:bg-gray-100">
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">Nenhum usuário cadastrado nesta empresa.</p>
      )}

      <Dialog open={openAccessorDialog} onOpenChange={setOpenAccessorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Novo Acessor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAccessor(onSubmitAccessor)} className="space-y-4">
            <div>
              <Label>Email do Acessor</Label>
              <Input type="email" {...registerAccessor("accessorEmail")} placeholder="Digite o email do acessor" />
              {errorsAccessor.accessorEmail && <p className="text-red-500">{errorsAccessor.accessorEmail.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAccessorDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={assigningAccessor}>
                {assigningAccessor ? "Atribuindo..." : "Atribuir"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input type="text" {...register("name")} placeholder="Digite o nome" />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="Digite o email" />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" {...register("password")} placeholder="Digite a senha" />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <Label>Função</Label>
              <Select onValueChange={(value) => setValue("userRole", value as "USER" | "ADMIN")} defaultValue="USER">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel do usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <input type="hidden" {...register("companyId")} value={companyId} />

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

export default EmpresaPage;
