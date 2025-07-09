"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createLossReason } from "@/service/lossService";

interface NewLossReasonButtonProps {
    onLossReasonCreated?: (reasonId?: string) => void;
    className?: string;
}

const NewLossReasonButton = ({ onLossReasonCreated, className }: NewLossReasonButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
    });
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            description: "",
        });
    };

    const handleOpenDialog = () => {
        resetForm();
        setOpenDialog(true);
    };

    const handleCreateLossReason = async () => {
        if (!formData.description.trim()) {
            toast({
                description: "Descrição é obrigatória",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const newLossReason = await createLossReason(formData);
            toast({
                description: "Motivo de perda criado com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            onLossReasonCreated?.(newLossReason.id);
        } catch (error) {
            console.error("Erro ao criar motivo de perda:", error);
            toast({
                description: "Erro ao criar motivo de perda",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleOpenDialog} className={className}>
                Novo Motivo
            </Button>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Motivo de Perda</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Descrição
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Digite a descrição do motivo"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateLossReason}
                            disabled={loading || !formData.description.trim()}
                        >
                            {loading ? "Criando..." : "Criar Motivo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewLossReasonButton; 