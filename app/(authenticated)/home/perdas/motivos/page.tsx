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
import { getLossReasons, updateLossReason, deleteLossReason } from "@/service/lossService";
import { LossReasonListSkeleton } from "@/components/skeleton/loss-reason-skeleton";
import useAuthStore from "@/store/authStore";
import NewLossReasonButton from "@/components/perdas/new-loss-reason-button";

interface LossReason {
  id: string;
  description: string;
  companyId: string;
  createdAt: string;
}

interface LossReasonFormData {
  description: string;
}

const LossReasonsPage: React.FC = () => {
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<LossReasonFormData>({
    description: "",
  });
  const [selectedReason, setSelectedReason] = useState<LossReason | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore()

  const fetchLossReasons = async () => {
    setLoading(true);
    try {
      const data = await getLossReasons();
      if (data) {
        setLossReasons(data);
      }
    } catch (error) {
      console.error("Erro ao carregar motivos de perdas:", error);
      toast({
        description: "Erro ao carregar motivos de perdas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLossReasons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      description: "",
    });
    setSelectedReason(null);
  };

  const handleOpenEditDialog = (reason: LossReason) => {
    setSelectedReason(reason);
    setFormData({
      description: reason.description || "",
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (reason: LossReason) => {
    setSelectedReason(reason);
    setConfirmDeleteDialog(true);
  };

  const handleUpdateLossReason = async () => {
    if (!selectedReason) return;

    try {
      await updateLossReason(selectedReason.id, formData);
      toast({
        description: "Motivo de perda atualizado com sucesso!",
      });
      setOpenDialog(false);
      resetForm();
      fetchLossReasons();
    } catch (error) {
      console.error("Erro ao atualizar motivo de perda:", error);
      toast({
        description: "Erro ao atualizar motivo de perda",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLossReason = async () => {
    if (!selectedReason) return;

    try {
      await deleteLossReason(selectedReason.id);
      toast({
        description: "Motivo de perda removido com sucesso!",
      });
      setConfirmDeleteDialog(false);
      setSelectedReason(null);
      fetchLossReasons();
    } catch (error) {
      console.error("Erro ao remover motivo de perda:", error);
      toast({
        description: "Erro ao remover motivo de perda",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Motivos de Perdas</h1>
          <p className="text-black/40">Gerencie os motivos de perdas de oportunidades</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-black text-white px-3 py-1 text-sm">
            {lossReasons.length}
          </Badge>
          {user?.userRole !== "USER" && (
            <NewLossReasonButton onLossReasonCreated={() => fetchLossReasons()} />
          )}
        </div>
      </div>

      {loading ? (
        <LossReasonListSkeleton />
      ) : lossReasons.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
                {user?.userRole !== "USER" && (
                  <TableHead>Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lossReasons.map((reason) => (
                <TableRow key={reason.id} className="hover:bg-gray-100">
                  <TableCell className="font-medium">{reason.description || "-"}</TableCell>
                  <TableCell>{formatDate(reason.createdAt)}</TableCell>
                  {user?.userRole !== "USER" && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditDialog(reason)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenDeleteDialog(reason)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  Nenhum motivo de perda cadastrado
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Motivo de Perda</DialogTitle>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateLossReason}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o motivo de perda{" "}
              <strong>{selectedReason?.description}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteLossReason}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LossReasonsPage;