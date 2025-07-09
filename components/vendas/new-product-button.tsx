"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/service/productService";

interface NewProductButtonProps {
    onProductCreated?: (productId?: string) => void;
    className?: string;
}

const NewProductButton = ({ onProductCreated, className }: NewProductButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
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
            name: "",
        });
    };

    const handleOpenDialog = () => {
        resetForm();
        setOpenDialog(true);
    };

    const handleCreateProduct = async () => {
        if (!formData.name.trim()) {
            toast({
                description: "Nome do produto é obrigatório",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const newProduct = await createProduct(formData);
            toast({
                description: "Produto criado com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            onProductCreated?.(newProduct.id);
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            toast({
                description: "Erro ao criar produto",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleOpenDialog} className={className}>
                Novo Produto
            </Button>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Digite o nome do produto"
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
                            onClick={handleCreateProduct}
                            disabled={loading || !formData.name.trim()}
                        >
                            {loading ? "Criando..." : "Criar Produto"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewProductButton; 