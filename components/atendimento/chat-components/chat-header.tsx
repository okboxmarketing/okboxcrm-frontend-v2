"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MoveDownRight, MoreVertical, Trash, EyeOff, ChevronRight, ArrowRightLeft, Loader2 } from "lucide-react";
import MoveTicketSelect from "@/components/atendimento/kanban-step-selector";
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
import { LossReason, User } from "@/lib/types";
import { deleteTicket, hideTicket, refreshTicket, transferTicket } from "@/service/ticketsService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { findMyCompany } from "@/service/companyService";

type Products = {
  id: string;
  name: string;
  price?: number;
};

const ChatHeader: React.FC = () => {
  const { selectedChat, fetchTickets, selectChat, removeTicket } = useChatStore();
  const { toast } = useToast();

  const handleFetchTickets = useCallback(() => {
    return fetchTickets("OPEN");
  }, [fetchTickets]);

  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [products, setProducts] = useState<Products[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string, quantity: number, price: number }[]>([]);
  const [currentProduct, setCurrentProduct] = useState<{ id: string, quantity: string, price: string }>(
    { id: "", quantity: "1", price: "" }
  );
  const [kanbanRefreshKey, setKanbanRefreshKey] = useState(0);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmHideOpen, setConfirmHideOpen] = useState(false);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [transferringUserId, setTransferringUserId] = useState<string | null>(null);

  const [lossDialogOpen, setLossDialogOpen] = useState(false);
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [lossData, setLossData] = useState({
    reasonId: "",
    description: ""
  });

  const { user } = useAuthStore()

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await findMyCompany()
      if (data) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  }

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

  const fetchLossReasons = async () => {
    try {
      const data = await getLossReasons();
      if (data) {
        setLossReasons(data);
        console.log("Motivos de perda:", data)
      }
    } catch (error) {
      console.error("Erro ao carregar motivos de perda:", error);
      toast({
        description: "Erro ao carregar motivos de perda",
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

  const handleOpenLossDialog = () => {
    fetchLossReasons();
    setLossData({ reasonId: "", description: "" });
    setLossDialogOpen(true);
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

  const handleDeleteTicket = async () => {
    if (!selectedChat) return;
    try {
      await deleteTicket(selectedChat.id);
      toast({
        description: "Ticket excluído com sucesso!",
      });
      selectChat(null)
      removeTicket(selectedChat.id);
    } catch (error) {
      console.error("Erro ao excluir ticket:", error);
      toast({
        description: "Erro ao excluir ticket",
        variant: "destructive",
      });
    }
    setConfirmDeleteOpen(false);
  }

  const handleHideTicket = async () => {
    if (!selectedChat) return;
    try {
      await hideTicket(selectedChat.id);
      toast({
        description: "Ticket ocultado com sucesso!",
      });
      selectChat(null)
      removeTicket(selectedChat.id);
    } catch (error) {
      console.error("Erro ao ocultar ticket:", error);
      toast({
        description: "Erro ao ocultar ticket",
        variant: "destructive",
      });
    }
    setConfirmHideOpen(false);
  }

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
      const updated = await refreshTicket(selectedChat.id);
      selectChat({
        ...selectedChat,
        status: updated.status,
        KanbanStep: updated.KanbanStep,
      });
      setKanbanRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast({
        description: "Erro ao registrar venda",
        variant: "destructive",
      });
    }
  };

  const handleCreateLoss = async () => {
    if (!selectedChat || !lossData.reasonId) return;

    console.log("handleCreateLoss + ticketId", lossData, selectedChat.id)
    console.log("ticketId", selectedChat.id)
    try {
      await createLoss({
        ticketId: selectedChat.id,
        lossReasonId: lossData.reasonId,
        description: lossData.description
      });

      toast({
        description: "Perda registrada com sucesso!",
      });

      setLossDialogOpen(false);
      const updated = await refreshTicket(selectedChat.id);
      selectChat({
        ...selectedChat,
        status: updated.status,
        KanbanStep: updated.KanbanStep,
      });
      setKanbanRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error("Erro ao registrar perda:", error);
      toast({
        description: "Erro ao registrar perda",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (!selectedChat) return null;

  return (
    <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-[#FAFAFA] z-10">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={selectedChat.Contact.name}
          pictureUrl={selectedChat.Contact.pictureUrl}
        />
        <div>
          <h2 className="font-semibold">{selectedChat.Contact.name}</h2>
          {selectedChat.responsibleId && (
            <p className="text-sm text-black/40">
              Acompanhado por: {selectedChat.Responsible?.name}
            </p>
          )}
        </div>
      </div>
      {selectedChat.status !== "PENDING" && user?.userRole !== "ADVISOR" && (
        <div className="flex items-center gap-4">
          <MoveTicketSelect ticketId={selectedChat.id} fetchTickets={handleFetchTickets} refreshKey={kanbanRefreshKey} />
          <Button onClick={handleOpenSaleDialog} className="bg-green-500 hover:bg-green-500/70">
            <ShoppingCart />
          </Button>
          {selectedChat.status !== "LOSS" && (
            <Button onClick={handleOpenLossDialog} className="bg-red-500 hover:bg-red-500/70">
              <MoveDownRight />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setConfirmHideOpen(true)} className="flex items-center gap-2 text-blue-500 hover:bg-blue-100">
                <EyeOff />
                Ocultar Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="flex items-center gap-2 text-red-500 hover:bg-red-100">
                <Trash />
                Excluir Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                fetchUsers()
                setConfirmTransferOpen(true)
              }} className="flex items-center gap-2 text-green-400 hover:bg-green-100">
                <ArrowRightLeft />
                Transferir Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
              </DialogHeader>
              <p>Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteTicket}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={confirmHideOpen} onOpenChange={setConfirmHideOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Você tem certeza?</DialogTitle>
              </DialogHeader>
              <p>Tem certeza que deseja ocultar este ticket? Ele não vai mais participar de seu atendimento, métricas e kanban.</p>
              <Link href={'/home/tickets'} className="flex items-center gap-2 text-blue-500 hover:text-blue-300 text-sm">
                <ChevronRight />
                Ver Tickets Ocultos
              </Link>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmHideOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleHideTicket}>
                  Ocultar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

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
            >
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      {reason.description}
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
      <Dialog open={confirmTransferOpen} onOpenChange={setConfirmTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecione o novo responsável</DialogTitle>
          </DialogHeader>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <div className="py-4 space-y-2">
              {users.map((thisUser) => (
                <div key={thisUser.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={thisUser.name} pictureUrl={thisUser.profileImage} />
                    <span>{thisUser.name}</span>
                  </div>
                  <Button
                    isLoading={transferringUserId === thisUser.id}
                    variant="outline"
                    disabled={thisUser.id === selectedChat.responsibleId}
                    onClick={async () => {
                      if (!selectedChat) return;
                      setTransferringUserId(thisUser.id);
                      try {
                        await transferTicket(selectedChat.id, thisUser.id);
                        toast({
                          description: "Ticket transferido com sucesso!",
                        });
                        if (user?.userRole === "USER") {
                          selectChat(null);
                          removeTicket(selectedChat.id);
                        } else {
                          selectChat({
                            ...selectedChat,
                            responsibleId: thisUser.id,
                            Responsible: {
                              name: thisUser.name,
                            }
                          });
                        }
                        setConfirmTransferOpen(false);
                      } catch (error) {
                        console.error("Erro ao transferir ticket:", error);
                        toast({
                          description: "Erro ao transferir ticket",
                          variant: "destructive",
                        });
                      } finally {
                        setTransferringUserId(null);
                      }
                    }}
                  >
                    Transferir
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTransferOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHeader;
