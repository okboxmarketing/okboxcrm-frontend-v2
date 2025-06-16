import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createSale } from "@/service/saleService";
import { getProducts } from "@/service/productService";
import { useChatStore } from "@/store/chatStore";

type Products = {
    id: string;
    name: string;
    price?: number;
};

const SaleButton: React.FC = () => {
    const { selectedChat, fetchTickets } = useChatStore();
    const { toast } = useToast();
    const [saleDialogOpen, setSaleDialogOpen] = useState(false);
    const [products, setProducts] = useState<Products[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<{ id: string, quantity: number, price: number }[]>([]);
    const [currentProduct, setCurrentProduct] = useState<{ id: string, quantity: string, price: string }>(
        { id: "", quantity: "1", price: "" }
    );
    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            if (data) {
                setProducts(data);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            toast({
                description: "Erro ao carregar produtos",
                variant: "destructive",
            });
        }
    };

    const handleOpenSaleDialog = () => {
        fetchProducts();
        setSelectedProducts([]);
        setCurrentProduct({ id: "", quantity: "1", price: "" });
        setSaleDialogOpen(true);
    };

    const handleAddProduct = () => {
        if (!currentProduct.id || parseInt(currentProduct.quantity) <= 0 || !currentProduct.price) return;

        const product = products.find(p => p.id === currentProduct.id);
        if (!product) return;

        setSelectedProducts([
            ...selectedProducts,
            {
                id: product.id,
                quantity: parseInt(currentProduct.quantity),
                price: parseFloat(currentProduct.price)
            }
        ]);

        setCurrentProduct({ id: "", quantity: "1", price: "" });
    };

    const handleRemoveProduct = (index: number) => {
        const newProducts = [...selectedProducts];
        newProducts.splice(index, 1);
        setSelectedProducts(newProducts);
    };

    const handleCreateSale = async () => {
        setIsLoading(true);
        if (!selectedChat || selectedProducts.length === 0) return;

        try {
            const saleData = {
                ticketId: selectedChat.id,
                items: selectedProducts.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            };

            await createSale(saleData);

            toast({
                description: "Venda registrada com sucesso!",
            });

            setSaleDialogOpen(false);
            fetchTickets("OPEN");
        } catch (error) {
            console.error("Erro ao registrar venda:", error);
            toast({
                description: "Erro ao registrar venda",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    return (
        <>
            <Button onClick={handleOpenSaleDialog} className="bg-green-500 hover:bg-green-500/70">
                <ShoppingCart />
            </Button>

            <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Venda</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product" className="text-right">
                                Produto
                            </Label>
                            <Select
                                value={currentProduct.id}
                                onValueChange={(value) => setCurrentProduct({ ...currentProduct, id: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Quantidade
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={currentProduct.quantity}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Preço
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={currentProduct.price}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                className="col-span-3"
                                placeholder="Informe o preço para este produto"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAddProduct}>Adicionar Produto</Button>
                        </div>

                        {selectedProducts.length > 0 && (
                            <div className="border rounded-md p-3 mt-2">
                                <h3 className="font-medium mb-2">Produtos Selecionados</h3>
                                <div className="space-y-2">
                                    {selectedProducts.map((item, index) => {
                                        const product = products.find(p => p.id === item.id);
                                        return (
                                            <div key={index} className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium">{product?.name}</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        {item.quantity} x {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(item.price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-4">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(item.price * item.quantity)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveProduct(index)}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateSale}
                            disabled={selectedProducts.length === 0}
                            isLoading={isLoading}
                        >
                            Registrar Venda
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaleButton; 