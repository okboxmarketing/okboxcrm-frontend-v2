"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/service/productService";

interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "price" ? parseFloat(value) || 0 : value 
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
    });
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setConfirmDeleteDialog(true);
  };

  const handleCreateProduct = async () => {
    try {
      await createProduct(formData);
      toast({
        description: "Produto criado com sucesso!",
      });
      setOpenDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast({
        description: "Erro ao criar produto",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      await updateProduct(selectedProduct.id, formData);
      toast({
        description: "Produto atualizado com sucesso!",
      });
      setOpenDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      toast({
        description: "Produto removido com sucesso!",
      });
      setConfirmDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast({
        description: "Erro ao remover produto",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-black/40">Gerencie os produtos disponíveis para venda</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-black text-white px-3 py-1 text-sm">
            {products.length}
          </Badge>
          <Button onClick={handleOpenCreateDialog}>Novo Produto</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando produtos...</p>
      ) : products.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-100">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditDialog(product)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleOpenDeleteDialog(product)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Nenhum produto cadastrado.</p>
          <Button onClick={handleOpenCreateDialog} className="mt-4">
            Cadastrar Primeiro Produto
          </Button>
        </div>
      )}

      {/* Dialog para criar/editar produto */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={isEditing ? handleUpdateProduct : handleCreateProduct}>
              {isEditing ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir produto */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o produto{" "}
              <strong>{selectedProduct?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;