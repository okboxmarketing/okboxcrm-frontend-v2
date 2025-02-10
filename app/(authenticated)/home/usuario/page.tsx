"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { userSchema } from "@/schema/userSchema";
import { createUser } from "@/service/userService";
import { findAllCompanies } from "@/service/companyService";

export default function UserRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  const fetchCompanies = async () => {
    try {
      const companies = await findAllCompanies();
      setCompanies(companies);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  }

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      await createUser(data);
      alert("Usuário cadastrado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 shadow-md rounded-md w-96">
        <h2 className="text-xl font-bold mb-4">Cadastro de Usuário</h2>

        <label className="block mb-2">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border p-2 rounded-md"
        />
        {errors.email && <p className="text-red-500">{String(errors.email.message)}</p>}

        <label className="block mb-2">Nome</label>
        <input
          type="text"
          {...register("name")}
          className="w-full border p-2 rounded-md"
        />
        {errors.name && <p className="text-red-500">{String(errors.name.message)}</p>}

        <label className="block mb-2">Senha</label>
        <input
          type="password"
          {...register("password")}
          className="w-full border p-2 rounded-md"
        />
        {errors.password && <p className="text-red-500">{String(errors.password.message)}</p>}

        <label className="block mb-2">ID da Empresa</label>
        <input
          type="text"
          {...register("companyId")}
          className="w-full border p-2 rounded-md"
        />
        {errors.companyId && <p className="text-red-500">{String(errors.companyId.message)}</p>}

        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md"
        >
          {loading ? "Cadastrando..." : "Cadastrar Usuário"}
        </button>
      </form>
    </div>
  );
}
