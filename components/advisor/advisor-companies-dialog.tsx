"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMyCompanies } from "@/service/advisorService";
import { Company } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AdvisorCompaniesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdvisorCompaniesDialog({
    open,
    onOpenChange,
}: AdvisorCompaniesDialogProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const data = await getMyCompanies();
                setCompanies(data);
            } catch (error) {
                console.error("Erro ao buscar empresas:", error);
                toast({
                    variant: "destructive",
                    description: "Erro ao carregar empresas. Tente novamente.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchCompanies();
        }
    }, [open, toast]);

    const handleSelectCompany = (companyId: string) => {
        // Here you could implement any logic needed when selecting a company
        // For now, just close the dialog and navigate to the home page
        onOpenChange(false);
        router.push("/home");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Suas Empresas</DialogTitle>
                    <DialogDescription>
                        Selecione uma empresa para gerenciar.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Nenhuma empresa encontrada.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {companies.map((company) => (
                            <Button
                                key={company.id}
                                variant="outline"
                                className="flex justify-between items-center h-auto py-3 px-4 hover:bg-gray-50"
                                onClick={() => handleSelectCompany(company.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Building2 className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{company.name}</p>
                                        <p className="text-sm text-gray-500">
                                            { } usuários
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Criada em {new Date(company.createdAt).toLocaleDateString()}
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}