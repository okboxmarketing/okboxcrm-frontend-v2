"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KanbanStep } from "@/lib/types";
import { HexColorPicker } from "react-colorful";
import { Plus, Trash, ChevronUp, ChevronDown } from "lucide-react";
import {
  createKanbanStep,
  removeKanbanStep,
  updateKanbanStep,
  swapKanbanSteps,
} from "@/service/kanbanStepsService";
import { useKanbanSteps } from "@/hooks/swr/use-kanban-swr";
import useAuthStore from "@/store/authStore";

const KanbanStepsPage: React.FC = () => {
  const { kanbanSteps, mutate } = useKanbanSteps();
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stepName, setStepName] = useState("");
  const { user } = useAuthStore()
  const [color, setColor] = useState("#000000");
  const [stepToDelete, setStepToDelete] = useState<KanbanStep | null>(null);
  const [stepToEdit, setStepToEdit] = useState<KanbanStep | null>(null);
  const [editStepName, setEditStepName] = useState("");
  const [editColor, setEditColor] = useState("#000000");
  const { toast } = useToast();

  const moveStep = async (fromIdx: number, toIdx: number) => {
    const from = kanbanSteps[fromIdx];
    const to = kanbanSteps[toIdx];
    try {
      await swapKanbanSteps(from.id, to.id);
      toast({ description: "Ordem atualizada com sucesso!" });
      await mutate();
    } catch (err) {
      console.error(err);
      toast({ description: "Erro ao atualizar ordem", variant: "destructive" });
    }
  };

  const handleCreateStep = async () => {
    if (!stepName.trim()) return;
    try {
      const last = kanbanSteps[kanbanSteps.length - 1];
      const pos = last ? last.position + 1 : 0;
      await createKanbanStep(stepName, color, pos);
      toast({ description: "Etapa criada com sucesso!" });
      setOpenDialog(false);
      setStepName("");
      setColor("#000000");
      await mutate()
    } catch {
      toast({ description: "Erro ao criar etapa", variant: "destructive" });
    }
  };

  const handleEditStep = async () => {
    if (!stepToEdit) return;
    try {
      await updateKanbanStep(stepToEdit.id, editStepName, editColor);
      toast({ description: "Etapa atualizada com sucesso!" });
      setEditDialogOpen(false);
      await mutate()
    } catch {
      toast({ description: "Erro ao atualizar etapa", variant: "destructive" });
    }
  };

  const handleRemoveStep = async () => {
    if (!stepToDelete) return;
    try {
      await removeKanbanStep(stepToDelete.id);
      toast({ description: "Etapa removida com sucesso!" });
      setConfirmDialogOpen(false);
      await mutate()
    } catch {
      toast({ description: "Erro ao remover etapa", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Etapas do Kanban</h1>
        {user?.userRole === "ADMIN" && (
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Etapa
          </Button>
        )}
      </div>

      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/6">Nome</TableHead>
            <TableHead className="w-1/6">Cor</TableHead>
            <TableHead className="w-1/6">Tickets</TableHead>
            {user?.userRole === "ADMIN" && (
              <TableHead className="w-2/6">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {kanbanSteps.map((step, idx) => (
            <TableRow key={step.id} className="hover:bg-gray-50">
              <TableCell>{step.name}</TableCell>
              <TableCell>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: step.color }} />
              </TableCell>
              <TableCell>{step.ticketCount}</TableCell>
              {user?.userRole === "ADMIN" && (
                <TableCell className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, idx - 1)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={idx === kanbanSteps.length - 1}
                    onClick={() => moveStep(idx, idx + 1)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    disabled={step.name === "Contato Feito" || step.name === "Sem Contato" || step.name === "Vendido" || step.name === "Perdido"}
                    onClick={() => {
                      setStepToEdit(step);
                      setEditStepName(step.name);
                      setEditColor(step.color);
                      setEditDialogOpen(true);
                    }}>
                    Editar
                  </Button>
                  <Button
                    disabled={step.name === "Contato Feito" || step.name === "Sem Contato" || step.name === "Vendido" || step.name === "Perdido"}
                    variant="destructive" onClick={() => {
                      setStepToDelete(step);
                      setConfirmDialogOpen(true);
                    }}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Etapa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={stepName} onChange={e => setStepName(e.target.value)} />
            </div>
            <div>
              <Label>Cor</Label>
              <HexColorPicker color={color} onChange={setColor} />
              <div className="mt-2 flex items-center">
                <Input value={color} onChange={e => setColor(e.target.value)} />
                <div className="w-6 h-6 ml-2 rounded border" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateStep}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Etapa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={editStepName} onChange={e => setEditStepName(e.target.value)} />
            </div>
            <div>
              <Label>Cor</Label>
              <HexColorPicker color={editColor} onChange={setEditColor} />
              <div className="mt-2 flex items-center">
                <Input value={editColor} onChange={e => setEditColor(e.target.value)} />
                <div className="w-6 h-6 ml-2 rounded border" style={{ backgroundColor: editColor }} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditStep}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar remoção</DialogTitle></DialogHeader>
          <p>Tem certeza que deseja remover a etapa <strong>{stepToDelete?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveStep}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanStepsPage;
