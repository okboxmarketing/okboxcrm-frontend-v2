import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveDownRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createLoss } from "@/service/lossService";
import { getLossReasons } from "@/service/lossService";
import { LossReason } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { CreateLossDto } from "@/types/loss";
import NewLossReasonButton from "@/components/perdas/new-loss-reason-button";

const LossButton: React.FC = () => {
    const { selectedChat, fetchTickets } = useChatStore();
    const { toast } = useToast();
    const [lossDialogOpen, setLossDialogOpen] = useState(false);
    const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
    const [lossData, setLossData] = useState<CreateLossDto>({
        ticketId: selectedChat?.id || 0,
        lossReasonId: '',
        observation: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchLossReasons = async () => {
        try {
            const data = await getLossReasons();
            if (data) {
                setLossReasons(data);
            }
        } catch (error) {
            console.error("Erro ao carregar motivos de perda:", error);
            toast({
                description: "Erro ao carregar motivos de perda",
                variant: "destructive",
            });
        }
    };

    const handleOpenLossDialog = () => {
        fetchLossReasons();
        setLossData({
            ticketId: selectedChat?.id || 0,
            lossReasonId: '',
            observation: ''
        });
        setLossDialogOpen(true);
    };

    const handleCreateLoss = async () => {
        setIsLoading(true);
        if (!selectedChat || !lossData.lossReasonId) return;

        try {
            await createLoss({
                ticketId: selectedChat.id,
                lossReasonId: lossData.lossReasonId,
                observation: lossData.observation
            });

            toast({
                description: "Perda registrada com sucesso!",
            });

            setLossDialogOpen(false);
            fetchTickets("OPEN");
        } catch (error) {
            console.error("Erro ao registrar perda:", error);
            toast({
                description: "Erro ao registrar perda",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const lossReasonOptions = lossReasons.map(reason => ({
        value: reason.id,
        label: reason.description
    }));

    const handleLossReasonCreated = (newReasonId?: string) => {
        // Recarrega a lista de motivos de perda
        fetchLossReasons();
        // Seleciona automaticamente o motivo recém-criado se um ID foi fornecido
        if (newReasonId) {
            setLossData(prev => ({ ...prev, lossReasonId: newReasonId }));
        }
    };

    return (
        <>
            <Button onClick={handleOpenLossDialog} className="bg-red-500 hover:bg-red-500/70">
                <MoveDownRight />
            </Button>

            <Dialog open={lossDialogOpen} onOpenChange={setLossDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Perda</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Motivo
                            </Label>
                            <Combobox
                                options={lossReasonOptions}
                                value={lossData.lossReasonId}
                                onValueChange={(value) => setLossData({ ...lossData, lossReasonId: value })}
                                placeholder="Selecione um motivo"
                                searchPlaceholder="Pesquisar motivos..."
                                emptyMessage="Nenhum motivo encontrado."
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-1"></div>
                            <span className="col-span-3">
                                <NewLossReasonButton
                                    onLossReasonCreated={handleLossReasonCreated}
                                />
                            </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right align-self-start pt-2">
                                Descrição
                            </Label>
                            <Textarea
                                id="description"
                                value={lossData.observation}
                                onChange={(e) => setLossData({ ...lossData, observation: e.target.value })}
                                className="col-span-3"
                                placeholder="Descreva os detalhes da perda"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLossDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateLoss}
                            disabled={!lossData.lossReasonId}
                            isLoading={isLoading}
                        >
                            Registrar Perda
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LossButton; 