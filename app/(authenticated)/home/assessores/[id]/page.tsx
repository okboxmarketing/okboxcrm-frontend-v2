"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdvisorById, deleteAdvisor, updateAdvisor, CreateAdvisorData } from "@/service/advisorService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Company, User } from "@/lib/types";

export default function AdvisorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [advisor, setAdvisor] = useState<User>();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (id) {
      fetchAdvisor();
    }
  }, [id]);

  const fetchAdvisor = async () => {
    const data = await getAdvisorById(id as string);
    setAdvisor(data);
    setFormData((prev) => ({
      ...prev,
      name: data.name || "",
      email: data.email || "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    try {
      await deleteAdvisor(id as string);
      toast({ description: "Assessor deletado com sucesso!" });
      router.push("/home/assessores");
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "Erro ao deletar assessor" });
    }
  };

  const handleUpdate = async () => {
    if (showPassword && formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", description: "As senhas não coincidem." });
      return;
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      password: showPassword ? formData.password : undefined,
    };

    try {
      await updateAdvisor(id as string, updateData as CreateAdvisorData);
      toast({ description: "Assessor atualizado com sucesso!" });
      setOpenEdit(false);
      fetchAdvisor();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "Erro ao atualizar assessor" });
    }
  };

  if (!advisor) return <div></div>;

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{advisor.name}</h1>
          <p className="text-black/50">{advisor.email}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild>
              <Button><Edit /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Assessor</DialogTitle>
                <DialogDescription>Atualize as informações do assessor.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input name="email" value={formData.email} onChange={handleChange} />
                </div>
                <Button variant="outline" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Cancelar" : "Trocar Senha"}
                </Button>
                {showPassword && (
                  <>
                    <div className="grid gap-2">
                      <Label>Senha</Label>
                      <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Confirmar Senha</Label>
                      <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button className="bg-black hover:bg-black/80" onClick={handleUpdate}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-500/70"><Trash /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Deleção</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja deletar este assessor? Essa ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancelar</Button>
                <Button className="bg-red-500 hover:bg-red-500/70" onClick={handleDelete}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Empresas</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Qtd. Usuários</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advisor?.AdvisorOf?.map((company: Company) => (
            <TableRow key={company.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/home/empresas/${company.id}`)}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company._count?.users ?? company.users?.length ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
