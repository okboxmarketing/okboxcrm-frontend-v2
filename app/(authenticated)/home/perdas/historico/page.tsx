"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getLosses } from "@/service/lossService";

interface Loss {
    id: string;
    ticketId: number;
    reason: string;
    observation: string;
    createdAt: string;
    Ticket: {
        Contact: {
            name: string;
            phone: string;
        };
        Responsible: {
            name: string;
        };
    };
}

const LossHistoryPage: React.FC = () => {
    const [losses, setLosses] = useState<Loss[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLoss, setExpandedLoss] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchLosses = async () => {
        setLoading(true);
        try {
            const data = await getLosses();
            if (data) {
                setLosses(data);
            }
        } catch (error) {
            console.error("Erro ao carregar perdas:", error);
            toast({
                description: "Erro ao carregar histórico de perdas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLosses();
    }, []);

    const toggleLossDetails = (lossId: string) => {
        if (expandedLoss === lossId) {
            setExpandedLoss(null);
        } else {
            setExpandedLoss(lossId);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Histórico de Perdas</h1>
                    <p className="text-black/40">Visualize todas as oportunidades perdidas</p>
                </div>
                <Badge className="bg-black text-white px-3 py-1 text-sm">
                    {losses.length}
                </Badge>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Carregando perdas...</p>
            ) : losses.length > 0 ? (
                <div className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead>Ticket ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {losses.map((loss) => (
                                <>
                                    <TableRow
                                        key={loss.id}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleLossDetails(loss.id)}
                                    >
                                        <TableCell>{formatDate(loss.createdAt)}</TableCell>
                                        <TableCell>{loss.Ticket.Contact.name}</TableCell>
                                        <TableCell>{loss.Ticket.Responsible?.name || "N/A"}</TableCell>
                                        <TableCell className="font-medium">{loss.reason}</TableCell>
                                        <TableCell>{loss.ticketId}</TableCell>
                                    </TableRow>
                                    {expandedLoss === loss.id && (
                                        <TableRow className="bg-gray-50">
                                            <TableCell colSpan={5} className="p-4">
                                                <div className="text-sm">
                                                    <h3 className="font-medium mb-2">Detalhes da Perda</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-gray-500">Cliente:</p>
                                                            <p>{loss.Ticket.Contact.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Telefone:</p>
                                                            <p>{loss.Ticket.Contact.phone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Responsável:</p>
                                                            <p>{loss.Ticket.Responsible?.name || "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Data:</p>
                                                            <p>{formatDate(loss.createdAt)}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500">Motivo:</p>
                                                            <p>{loss.reason}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500">Descrição:</p>
                                                            <p>{loss.observation || "Sem descrição"}</p> {/* Changed from description to observation */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>Nenhuma perda registrada.</p>
                </div>
            )}
        </div>
    );
};

export default LossHistoryPage;