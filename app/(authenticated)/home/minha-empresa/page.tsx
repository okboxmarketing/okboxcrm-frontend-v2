"use client"
import { findMyCompany } from '@/service/companyService';
import React, { useEffect } from 'react';

type CompanyType = {
  name: string;
};

const MinhaEmpresaPage: React.FC = () => {

  const [company, setCompany] = React.useState<CompanyType | null>(null);

  const fetchCompany = async () => {
    try {
      const company = await findMyCompany();
      setCompany(company);
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
    }
  }

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <div>
      <h1>{company?.name}</h1>
    </div>
  );
};

export default MinhaEmpresaPage;