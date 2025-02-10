"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { findCompanyById } from "@/service/companyService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const EmpresaPage: React.FC = () => {
  const pathname = usePathname();
  const companyId = pathname.split("/").pop();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  if (loading) return <p className="text-center">Carregando empresa...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{company?.name}</h1>
        <Button onClick={() => router.push("/home")}>Novo Usuário</Button>
      </div>
      <p>Empresa ativa?
      </p>

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
    </div>
  );
};

export default EmpresaPage;
