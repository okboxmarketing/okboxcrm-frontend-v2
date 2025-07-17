"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { assignAccessorToCompany, deleteCompany, findCompanyById } from "@/service/companyService";
import { deleteUser, inviteUser, updateUserRole } from "@/service/userService";
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
import { Trash } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import PendingInvites from "@/components/invites/pending-invites";

const EmpresaPage: React.FC = () => {
  const pathname = usePathname();
  const companyId = pathname.split("/").pop();
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [company, setCompany] = useState<Company>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openAdvisorDialog, setOpenAdvisorDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loadingInviteUser, setTransitionInviteUser] = useTransition();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const requiredRole = user?.userRole;
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
    setTransitionInviteUser(async () => {
      try {
        const inviteData = {
          email: data.email,
          name: data.name,
          role: data.userRole,
          companyId: data.companyId
        };

        await inviteUser(inviteData);
        reset();
        setOpenDialog(false);
        setCompany(await findCompanyById(companyId!));
        toast({
          description: "Usuário convidado com sucesso!",
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
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
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
          <Button onClick={() => setOpenDialog(true)}>Novo Usuário</Button>
          {!company?.Advisor?.email && (<Button onClick={() => handleAdvisorModal()}>Atribuir Assessor</Button>)}
          <Button variant={'destructive'} onClick={() => setOpenDeleteDialog(true)}>Deletar Empresa</Button>
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
            {company && company?.users?.length > 0 ? (
              company.users.map((user: User) => (
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
                    {requiredRole === "ADVISOR" ? (
                      <Select
                        value={user.role}
                        onValueChange={async (value) => {
                          await updateUserRole(user.id, value as "USER" | "ADMIN");
                          toast({ description: "Papel do usuário atualizado!" });
                          await fetchCompany();
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Usuário</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {requiredRole === "ADVISOR" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          console.log(user);
                          setUserToDelete(user);
                          setConfirmDialogOpen(true);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-6">
        <PendingInvites companyId={companyId} />
      </div>

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
            <DialogTitle>Convidar Usuário para {company?.name}</DialogTitle>
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
              <Button type="submit" isLoading={loadingInviteUser}>
                Convidar
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
                  await deleteUser(userToDelete.id, companyId!);
                  toast({ description: "Usuário excluído com sucesso!" });
                  await fetchCompany();
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

export default EmpresaPage;
