"use client";

import { useEffect, useState } from "react";
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
import { Plus, Trash } from "lucide-react";
import {
  createKanbanStep,
  getKanbanSteps,
  removeKanbanStep,
  updateKanbanStep,
  updateKanbanStepPosition,
} from "@/service/kanbanStepsService";
import {
  dropTargetForElements,
  draggable,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";


const KanbanStepsPage: React.FC = () => {
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stepName, setStepName] = useState("");
  const [color, setColor] = useState("#000000");
  const [stepToDelete, setStepToDelete] = useState<KanbanStep | null>(null);
  const [stepToEdit, setStepToEdit] = useState<KanbanStep | null>(null);
  const [editStepName, setEditStepName] = useState("");
  const [editColor, setEditColor] = useState("#000000");
  const { toast } = useToast();

  const fetchKanbanSteps = async () => {
    try {
      const data = await getKanbanSteps();
      setKanbanSteps(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error(error);
      toast({ description: "Erro ao carregar etapas do Kanban", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanSteps();
  }, []);

  const setupDragAndDrop = (el: HTMLElement | null, stepId: number) => {
    if (!el) return;
    // Configura o elemento como draggable
    draggable({
      element: el,
      getInitialData: () => ({ stepId }),
    });

    // Configura o elemento como drop target
    const dropTarget = dropTargetForElements({
      element: el,
      getData: () => ({ stepId }),
      onDragEnter: () => {
        el.classList.add("border-t-4", "border-primary");
      },
      onDragLeave: () => {
        el.classList.remove("border-t-4", "border-primary");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDrop: async (payload: any) => {
        // Identifica origem e destino
        const fromId = payload.source.data.stepId as number;
        const toId = payload.self.data.stepId as number;
        if (!fromId || !toId || fromId === toId) return;

        // Remove a indicação visual
        el.classList.remove("border-t-4", "border-primary");

        // Reordena localmente
        const sorted = [...kanbanSteps];
        const fromIdx = sorted.findIndex(s => s.id === fromId);
        const toIdx = sorted.findIndex(s => s.id === toId);
        const [moved] = sorted.splice(fromIdx, 1);
        sorted.splice(toIdx, 0, moved);

        // Calcula nova posição
        const prev = sorted[toIdx - 1];
        const next = sorted[toIdx + 1];
        const newPos = prev && next
          ? (prev.position + next.position) / 2
          : prev
            ? prev.position + 1
            : next
              ? next.position - 1
              : moved.position;

        try {
          await updateKanbanStepPosition(moved.id, newPos);
          toast({ description: "Ordem atualizada com sucesso!" });
          fetchKanbanSteps();
        } catch (err) {
          console.error(err);
          toast({ description: "Erro ao atualizar ordem", variant: "destructive" });
        }
      },
    });

    // Importante: retornar função de cleanup
    return dropTarget;
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
      fetchKanbanSteps();
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
      fetchKanbanSteps();
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
      fetchKanbanSteps();
    } catch {
      toast({ description: "Erro ao remover etapa", variant: "destructive" });
    }
  };

  if (loading) return <p>Carregando etapas...</p>;

  return (
    <div className="flex-1 mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Etapas do Kanban</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Etapa
        </Button>
      </div>

      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/6">Nome</TableHead>
            <TableHead className="w-1/6">Cor</TableHead>
            <TableHead className="w-1/6">Tickets</TableHead>
            <TableHead className="w-2/6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kanbanSteps.map(step => (
            <TableRow
              key={step.id}
              ref={el => setupDragAndDrop(el, step.id)}
              className="hover:bg-gray-50 cursor-move"
            >
              <TableCell>{step.name}</TableCell>
              <TableCell>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: step.color }} />
              </TableCell>
              <TableCell>{step.ticketCount}</TableCell>
              <TableCell className="flex gap-2">
                <Button onClick={() => {
                  setStepToEdit(step);
                  setEditStepName(step.name);
                  setEditColor(step.color);
                  setEditDialogOpen(true);
                }}>
                  Editar
                </Button>
                <Button variant="destructive" onClick={() => {
                  setStepToDelete(step);
                  setConfirmDialogOpen(true);
                }}>
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
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

      {/* Edit Dialog */}
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
          <DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button><Button onClick={handleEditStep}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar remoção</DialogTitle></DialogHeader>
          <p>Tem certeza que deseja remover a etapa <strong>{stepToDelete?.name}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleRemoveStep}>Remover</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanStepsPage;