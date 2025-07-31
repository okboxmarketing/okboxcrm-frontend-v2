"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCreative, getCreatives } from "@/service/creativeService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "@/lib/types";
import useSWR from "swr";

export interface Creative {
    id: string;
    title: string;
    keyphrase: string;
    createdAt: string;
    Ticket: Ticket[];
    _count?: {
        Ticket: number;
    };
}

const creativeSchema = z.object({
    title: z.string().min(1, "O título é obrigatório"),
    keyphrase: z.string().min(1, "A frase-chave é obrigatória"),
});

type CreativeType = {
    title: string;
    keyphrase: string;
};

const CriativosPage: React.FC = () => {
    const [loadingCreate, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();
    const { data: creatives = [], isLoading: loadingData, mutate } = useSWR("criativos", getCreatives);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreativeType>({
        resolver: zodResolver(creativeSchema),
    });

    const onSubmit = async (data: CreativeType) => {
        startTransition(async () => {
            try {
                await createCreative(data);
                reset();
                mutate();
                setDialogOpen(false);
                toast({
                    description: 'Criativo cadastrado com sucesso!',
                });
            } catch (error) {
                console.error("Erro ao cadastrar criativo:", error);
                toast({
                    description: `Erro ao cadastrar criativo: ${error}`,
                    variant: 'destructive',
                });
            }
        });
    };

    if (loadingData) return <p className="text-center">Carregando...</p>;

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Criativos</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Novo Criativo</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Criativo</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Título</Label>
                                <Input id="title" type="text" {...register("title")} />
                                {errors.title && <p className="text-red-500">{String(errors.title.message)}</p>}
                            </div>
                            <div>
                                <Label htmlFor="keyphrase">Frase Chave</Label>
                                <Input id="keyphrase" type="text" {...register("keyphrase")} />
                                {errors.keyphrase && <p className="text-red-500">{String(errors.keyphrase.message)}</p>}
                            </div>
                            <Button type="submit" className="w-full" isLoading={loadingCreate}>Cadastrar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Frase Chave</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="w-[100px]">Tickets</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {creatives.map((creative) => (
                        <TableRow
                            key={creative.id}
                            className="cursor-pointer hover:bg-gray-100"
                        >
                            <TableCell>{creative.title}</TableCell>
                            <TableCell>{creative.keyphrase}</TableCell>
                            <TableCell>
                                {new Date(creative.createdAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                })}
                            </TableCell>
                            <TableCell>
                                <div className="flex text-center items-center gap-2">
                                    <p>
                                        {creative._count?.Ticket || 0}
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {creatives.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                Nenhum criativo cadastrado
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CriativosPage;
