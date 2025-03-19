"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle } from "lucide-react";
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
import { setActiveCompany } from "@/service/companyService";
import { Company } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";

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
    const [activating, setActivating] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const { user, refreshUser } = useAuth();
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const data = await getMyCompanies();
                setCompanies(data);

                // Set active company from user context
                if (user?.companyId) {
                    setActiveCompanyId(user.companyId);
                }
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
    }, [open, toast, user]);

    const handleSetActive = async (companyId: string) => {
        try {
            setActivating(companyId);
            await setActiveCompany(companyId);
            setActiveCompanyId(companyId);

            // Refresh user context to get updated token
            if (refreshUser) {
                await refreshUser();
            }

            toast({
                description: "Empresa ativada com sucesso!",
            });

            // Close dialog and refresh page
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Erro ao ativar empresa:", error);
            toast({
                variant: "destructive",
                description: "Não foi possível ativar a empresa.",
            });
        } finally {
            setActivating(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Suas Empresas</DialogTitle>
                    <DialogDescription>
                        Selecione uma empresa para acompanhar.
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
                            <div
                                key={company.id}
                                className="flex justify-between items-center border rounded-md p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Building2 className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{company.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {company.userCount || 0} usuários
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleSetActive(company.id)}
                                    variant={activeCompanyId === company.id ? "default" : "outline"}
                                    size="sm"
                                    disabled={activating !== null}
                                    className="flex items-center gap-1"
                                >
                                    {activating === company.id ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : activeCompanyId === company.id ? (
                                        <>
                                            <CheckCircle size={16} />
                                            Acessando
                                        </>
                                    ) : (
                                        "Acessar"
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}