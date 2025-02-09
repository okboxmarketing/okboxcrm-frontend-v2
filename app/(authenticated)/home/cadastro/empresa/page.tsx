"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { useState } from "react";
import { companySchema } from "@/schema/companySchema";
import { createCompany } from "@/service/companyService";

type CompanyType = {
  name: string;
};

export default function CompanyRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyType>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyType) => {
    setError(null);
    setLoading(true);

    try {
      await createCompany(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };


  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 shadow-md rounded-md w-96">
        <h2 className="text-xl font-bold mb-4">Cadastro de Empresa</h2>

        <label className="block mb-2">Nome da Empresa</label>
        <input
          type="text"
          {...register("name")}
          className="w-full border p-2 rounded-md"
        />
        {errors.name && <p className="text-red-500">{String(errors.name.message)}</p>}

        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md"
        >
          {loading ? "Cadastrando..." : "Cadastrar Empresa"}
        </button>
      </form>
    </div>
  );
}
