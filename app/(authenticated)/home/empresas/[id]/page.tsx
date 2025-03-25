"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { assignAccessorToCompany, deleteCompany, findCompanyById } from "@/service/companyService";
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
import { Company, User } from "@/lib/types";
import { getAdvisors } from "@/service/advisorService";

const EmpresaPage: React.FC = () => {
  const pathname = usePathname();
  const companyId = pathname.split("/").pop();
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [company, setCompany] = useState<Company>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openAdvisorDialog, setOpenAdvisorDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loadingCreateUser, setTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [loadingDeleteCompany, setTransitionDeleteCompany] = useTransition();

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

  const fetchCompany = async () => {
    try {
      if (!companyId) return;
      const data = await findCompanyById(companyId);
      setCompany(data);
    } catch (err) {
      console.log("Erro ao carregar empresa" + err);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      setValue("companyId", companyId);
    }
  }, [companyId, setValue]);

  const onSubmit = async (data: UserSchemaType) => {
    setTransition(async () => {
      try {
        await createUser(data);
        reset();
        setOpenDialog(false);
        setCompany(await findCompanyById(companyId!));
        toast({
          description: "Usuário cadastrado com sucesso!",
        });
      } catch (error) {
        if (error instanceof Error) {
          toast({
            description: error.message,
            variant: "destructive"
          })
        }
      }
    });
  };

  const onSubmitAdvisor = async (advisorEmail: string) => {
    try {
      await assignAccessorToCompany(advisorEmail, companyId!);
      toast({ description: "Assessor atribuído com sucesso!" });
      setOpenAdvisorDialog(false);
      setCompany(await findCompanyById(companyId!));
    } catch (error) {
      if (error instanceof Error) {
        toast({
          description: error.message,
          variant: "destructive"
        })

      }
    }
  };

  const handleDeleteCompany = async () => {
    setTransitionDeleteCompany(async () => {
      await deleteCompany(companyId!);
      router.push("/home/empresas");
      toast({ description: "Empresa deletada com sucesso!" });
    });
  }

  const handleAdvisorModal = async () => {
    const data = await getAdvisors()
    setAdvisors(data);
    setOpenAdvisorDialog(true);
  }


  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{company?.name}</h1>
          <p className="text-black/40">Assessor: <span>{company?.Advisor?.name || "Nenhum"}
            {company?.Advisor?.email && (
              <span> ({company.Advisor?.email})</span>
            )}
          </span></p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setOpenDialog(true)}>Novo Usuário</Button>
          {!company?.Advisor?.email && (<Button onClick={() => handleAdvisorModal()}>Atribuir Assessor</Button>)}
          <Button variant={'destructive'} onClick={() => setOpenDeleteDialog(true)}>Deletar Empresa</Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-4 mb-2">Usuários da Empresa</h2>
      {(company && company?.users?.length > 0) ? (
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
        <p className="text-center text-gray-500">Nenhum usuário cadastrado nesta empresa.</p>
      )}

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Você tem certeza?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => handleDeleteCompany()} isLoading={loadingDeleteCompany}>Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAdvisorDialog} onOpenChange={setOpenAdvisorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Assessor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(advisors && advisors?.length > 0) ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Atribuir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advisors.map((advisor: User) => (
                    <TableRow key={advisor.id} className="hover:bg-gray-100">
                      <TableCell>{advisor.name}</TableCell>
                      <TableCell>{advisor.email}</TableCell>
                      <TableCell><Button onClick={() => onSubmitAdvisor(advisor.email)}>Atribuir</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500">Nenhum assessor cadastrado.</p>
            )}
          </div>
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
              <Button type="submit" isLoading={loadingCreateUser}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmpresaPage;
