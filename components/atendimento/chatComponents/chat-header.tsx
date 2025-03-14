"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MoveDownRight } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
import { useChatContext } from "@/contexts/ChatContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createSale } from "@/service/saleService";
import { createLoss } from "@/service/lossService";
import { getLossReasons } from "@/service/lossService";
import { getProducts } from "@/service/productService";

const ChatHeader: React.FC = () => {
  const { selectedChat, fetchTickets } = useChatContext();
  const { toast } = useToast();

  // Sale dialog state
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string, quantity: number, price: number }[]>([]);
  const [currentProduct, setCurrentProduct] = useState<{ id: string, quantity: string }>(
    { id: "", quantity: "1" }
  );

  // Loss dialog state
  const [lossDialogOpen, setLossDialogOpen] = useState(false);
  const [lossReasons, setLossReasons] = useState<any[]>([]);
  const [lossData, setLossData] = useState({
    reasonId: "",
    description: ""
  });

  // Fetch products for sale dialog
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

  // Fetch loss reasons for loss dialog
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

  // Handle opening sale dialog
  const handleOpenSaleDialog = () => {
    fetchProducts();
    setSelectedProducts([]);
    setCurrentProduct({ id: "", quantity: "1" });
    setSaleDialogOpen(true);
  };

  // Handle opening loss dialog
  const handleOpenLossDialog = () => {
    fetchLossReasons();
    setLossData({ reasonId: "", description: "" });
    setLossDialogOpen(true);
  };

  // Handle adding product to sale
  const handleAddProduct = () => {
    if (!currentProduct.id || parseInt(currentProduct.quantity) <= 0) return;

    const product = products.find(p => p.id === currentProduct.id);
    if (!product) return;

    setSelectedProducts([
      ...selectedProducts,
      {
        id: product.id,
        quantity: parseInt(currentProduct.quantity),
        price: product.price
      }
    ]);

    setCurrentProduct({ id: "", quantity: "1" });
  };

  // Handle removing product from sale
  const handleRemoveProduct = (index: number) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  // Handle creating sale
  const handleCreateSale = async () => {
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
      fetchTickets();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast({
        description: "Erro ao registrar venda",
        variant: "destructive",
      });
    }
  };

  // Handle creating loss
  const handleCreateLoss = async () => {
    if (!selectedChat || !lossData.reasonId) return;

    try {
      await createLoss({
        ticketId: selectedChat.id,
        reason: lossData.reasonId,
        description: lossData.description
      });

      toast({
        description: "Perda registrada com sucesso!",
      });

      setLossDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error("Erro ao registrar perda:", error);
      toast({
        description: "Erro ao registrar perda",
        variant: "destructive",
      });
    }
  };

  // Calculate total sale amount
  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (!selectedChat) return null;

  return (
    <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-[#FAFAFA] z-10">
      <div className="flex items-center gap-3">
        <Avatar>
          {selectedChat.Contact.pictureUrl ? (
            <AvatarImage src={selectedChat.Contact.pictureUrl} />
          ) : (
            <AvatarFallback>{selectedChat.Contact.name[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h2 className="font-semibold">{selectedChat.Contact.name}</h2>
          {selectedChat.responsibleId && (
            <p className="text-sm text-black/40">
              Acompanhado por: {selectedChat.Responsible?.name}
            </p>
          )}
        </div>
      </div>
      {selectedChat.status !== "PENDING" && (
        <div className="flex items-center gap-4">
          <MoveTicketSelect ticketId={selectedChat.id} fetchTickets={fetchTickets} />
          <Button onClick={handleOpenSaleDialog}>
            <ShoppingCart />
          </Button>
          <Button onClick={handleOpenLossDialog}>
            <MoveDownRight />
          </Button>
        </div>
      )}

      {/* Sale Dialog */}
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
                      {product.name} - {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.price)}
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
            >
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loss Dialog */}
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
              <Select
                value={lossData.reasonId}
                onValueChange={(value) => setLossData({ ...lossData, reasonId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {lossReasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right align-self-start pt-2">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={lossData.description}
                onChange={(e) => setLossData({ ...lossData, description: e.target.value })}
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
              disabled={!lossData.reasonId}
            >
              Registrar Perda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHeader;