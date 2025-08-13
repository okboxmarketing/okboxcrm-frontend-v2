import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createSale } from "@/service/saleService";
import { getProducts } from "@/service/productService";
import { useChatStore } from "@/store/chatStore";
import { Combobox } from "@/components/ui/combobox";
import NewProductButton from "@/components/vendas/new-product-button";
import { formatPrice, formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";
import confetti from 'canvas-confetti';

type Products = {
    id: string;
    name: string;
    price?: number;
};

type SelectedProduct = {
    id: string;
    quantity: number;
    price: number;
};

type CurrentProduct = {
    id: string;
    quantity: number;
    price: number;
};

const SaleButton: React.FC = () => {
    const { selectedChat, fetchTickets } = useChatStore();
    const { toast } = useToast();
    const [saleDialogOpen, setSaleDialogOpen] = useState(false);
    const [products, setProducts] = useState<Products[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [currentProduct, setCurrentProduct] = useState<CurrentProduct>({
        id: "",
        quantity: 1,
        price: 0
    });
    const [priceInputValue, setPriceInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            if (data) {
                setProducts(data);
            }
        } catch (error) {
            toast({
                description: `Erro ao carregar produtos: ${error}`,
                variant: "destructive",
            });
        }
    };

    const handleOpenSaleDialog = () => {
        fetchProducts();
        setSelectedProducts([]);
        setCurrentProduct({
            id: "",
            quantity: 1,
            price: 0
        });
        setPriceInputValue("");
        setSaleDialogOpen(true);
    };

    const handleAddProduct = () => {
        if (!currentProduct.id || currentProduct.quantity <= 0 || currentProduct.price <= 0) return;

        const product = products.find(p => p.id === currentProduct.id);
        if (!product) return;

        setSelectedProducts([
            ...selectedProducts,
            {
                id: product.id,
                quantity: currentProduct.quantity,
                price: currentProduct.price
            }
        ]);

        setCurrentProduct({
            id: "",
            quantity: 1,
            price: 0
        });
        setPriceInputValue("");
    };

    const handleRemoveProduct = (index: number) => {
        const newProducts = [...selectedProducts];
        newProducts.splice(index, 1);
        setSelectedProducts(newProducts);
    };

    const fireSaleConfetti = async () => {
        try {
            await confetti({
                particleCount: 150,
                spread: 90,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#84cc16', '#65a30d'],
                shapes: ['star', 'circle', 'square'],
                startVelocity: 60,
                gravity: 0.8,
                decay: 0.85,
                ticks: 300,
                scalar: 1.5
            });
        } catch (error) {
            console.error('Erro ao disparar confetti:', error);
        }
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

            // Dispara confetti para celebrar a venda
            await fireSaleConfetti();

            toast({
                description: "🎉 Venda registrada com sucesso!",
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

    const productOptions = products.map(product => ({
        value: product.id,
        label: product.name
    }));

    const handleProductCreated = (newProductId?: string) => {
        // Recarrega a lista de produtos
        fetchProducts();
        // Seleciona automaticamente o produto recém-criado se um ID foi fornecido
        if (newProductId) {
            setCurrentProduct(prev => ({ ...prev, id: newProductId }));
        }
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
                            <Combobox
                                options={productOptions}
                                value={currentProduct.id}
                                onValueChange={(value) => setCurrentProduct({ ...currentProduct, id: value })}
                                placeholder="Selecione um produto"
                                searchPlaceholder="Pesquisar produtos..."
                                emptyMessage="Nenhum produto encontrado."
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-1"></div>
                            <span className="col-span-3">
                                <NewProductButton
                                    onProductCreated={handleProductCreated}
                                />
                            </span>
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
                                onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Preço
                            </Label>
                            <Input
                                id="price"
                                type="text"
                                value={priceInputValue}
                                onChange={(e) => {
                                    const formattedValue = formatCurrencyInput(e.target.value);
                                    setPriceInputValue(formattedValue);
                                    const numericValue = parseCurrencyInput(e.target.value);
                                    setCurrentProduct({ ...currentProduct, price: numericValue });
                                }}
                                className="col-span-3"
                                placeholder="R$ 0,00"
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
                                                        {item.quantity} x {formatPrice(item.price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-4">
                                                        {formatPrice(item.price * item.quantity)}
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
                                            {formatPrice(calculateTotal())}
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