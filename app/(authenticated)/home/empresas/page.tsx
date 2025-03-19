"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema } from "@/schema/companySchema";
import { findAllCompanies, createCompany } from "@/service/companyService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Company } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type CompanyType = {
  name: string;
};

const CadastroPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCreate, startTransition] = useTransition();
  // const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const data = await findAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyType>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyType) => {
    startTransition(async () => {
      try {
        const companyId = await createCompany(data);
        reset();
        fetchCompanies();
        setDialogOpen(false);
        router.push(`/home/empresas/${companyId}`);
        toast({
          description: 'Empresa cadastrada com sucesso!',
        });
      } catch (error) {
        console.error("Erro ao cadastrar empresa:", error);
      }
    });
  };

  if (loading) return <p className="text-center"></p>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Empresas Cadastradas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input id="name" type="text" {...register("name")} />
                {errors.name && <p className="text-red-500">{String(errors.name.message)}</p>}
              </div>
              <Button type="submit" className="w-full" isLoading={loadingCreate}>Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Criação</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Assessor</TableHead>
            <TableHead>Usuários</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow
              key={company.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/home/empresas/${company.id}`)}
            >
              <TableCell>
                {new Date(company.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </TableCell>

              <TableCell>{company.name}</TableCell>
              <TableCell>{company.Advisor?.name || "Nenhum"}</TableCell>
              <TableCell className="flex items-center gap-2"><Users size={14} />{company._count?.users || company.userCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CadastroPage;
