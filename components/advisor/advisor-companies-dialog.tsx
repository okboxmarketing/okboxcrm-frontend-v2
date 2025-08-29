"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle, Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyCompanies } from "@/service/advisorService";
import { setActiveCompany } from "@/service/companyService";
import { Company } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/authStore";

interface AdvisorCompaniesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdvisorCompaniesDialog({
    open,
    onOpenChange,
}: AdvisorCompaniesDialogProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, updateToken } = useAuthStore();
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const data = await getMyCompanies();
                console.log(data);
                setCompanies(data);

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

    useEffect(() => {
        if (user?.companyId) {
            setActiveCompanyId(user.companyId);
        }
    }, [user?.companyId]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCompanies(companies);
        } else {
            const filtered = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (company.Advisor?.name && company.Advisor.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCompanies(filtered);
        }
    }, [searchTerm, companies]);

    const handleSetActive = async (companyId: string) => {
        try {
            setActivating(companyId);
            const response = await setActiveCompany(companyId);

            updateToken(response.access_token);

            setActiveCompanyId(companyId);

            toast({
                description: "Empresa ativada com sucesso!",
            });

            onOpenChange(false);

            await new Promise(resolve => setTimeout(resolve, 100));

            window.location.reload();

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

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {searchTerm ? "Nenhuma empresa encontrada para sua busca." : "Nenhuma empresa encontrada."}
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto grid gap-4 py-4">
                        {filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="flex justify-between items-center border rounded-md p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    {company.profileImage ? (
                                        <img
                                            src={company.profileImage}
                                            alt={company.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <Building2 size={40} className="text-gray-500 h-8" />
                                    )}
                                    <div className="text-left">
                                        <p className="font-medium">{company.name}</p>
                                        {user?.masterAdvisor && company.Advisor && (
                                            <p className="text-sm text-gray-500">
                                                {company.Advisor.name}
                                            </p>)}
                                        <p className="text-sm text-gray-500">
                                            {company._count?.users || company.userCount || 0} usuários
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
                                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
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
        </Dialog >
    );
}