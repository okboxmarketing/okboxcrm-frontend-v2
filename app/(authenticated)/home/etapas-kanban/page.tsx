"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KanbanStep } from "@/lib/types";
import { HexColorPicker } from "react-colorful";
import { createKanbanStep, getKanbanSteps, removeKanbanStep, updateKanbanStep } from "@/service/kanbanStepsService";

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
      setKanbanSteps(data);
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao carregar etapas do Kanban" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanSteps();
  }, []);

  // Criação de nova etapa
  const handleCreateStep = async () => {
    if (!stepName.trim()) return;

    try {
      await createKanbanStep(stepName, color);
      toast({ description: "Etapa criada com sucesso!" });
      setStepName("");
      setColor("#000000");
      setOpenDialog(false);

      // Recarrega as etapas
      const updatedSteps = await getKanbanSteps();
      setKanbanSteps(updatedSteps);
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao criar etapa" });
    }
  };

  // Atualização de uma etapa
  const handleEditStep = async () => {
    if (!stepToEdit) return;
    try {
      await updateKanbanStep(stepToEdit.id, editStepName, editColor);
      toast({ description: "Etapa atualizada com sucesso!" });
      setEditDialogOpen(false);
      setStepToEdit(null);

      // Recarrega as etapas
      const updatedSteps = await getKanbanSteps();
      setKanbanSteps(updatedSteps);
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao atualizar etapa" });
    }
  };

  // Remoção de uma etapa
  const handleRemoveStep = async (stepId: number) => {
    try {
      await removeKanbanStep(stepId);
      toast({ description: "Etapa removida com sucesso!" });
      setKanbanSteps((prev) => prev.filter((step) => step.id !== stepId));
      setStepToDelete(null);
    } catch (error) {
      console.log(error);
      toast({ description: String(error), variant: "destructive" });
    }
  };

  if (loading) return <p className="text-center">Carregando etapas...</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Etapas do Kanban</h1>
        <Button onClick={() => setOpenDialog(true)}>Nova Etapa</Button>
      </div>

      {/* Tabela de Etapas */}
      {kanbanSteps.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kanbanSteps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>{step.name}</TableCell>
                <TableCell>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: step.color }}></div>
                </TableCell>
                <TableCell>{step.ticketCount}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    disabled={step.name === "Sem Contato" || step.name === "Com Contato"}
                    onClick={() => {
                      setStepToEdit(step);
                      setEditStepName(step.name);
                      setEditColor(step.color);
                      setEditDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={step.name === "Sem Contato" || step.name === "Com Contato"}
                    onClick={() => {
                      setStepToDelete(step);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">Nenhuma etapa cadastrada.</p>
      )}

      {/* Dialog para criação de nova etapa */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Etapa do Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Etapa</Label>
              <Input
                type="text"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="Digite o nome da etapa"
              />
            </div>
            <div>
              <Label>Selecione a Cor</Label>
              <HexColorPicker color={color} onChange={setColor} />
              <div className="mt-2 flex items-center">
                <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
                <div className="w-8 h-8 ml-2 rounded-full border" style={{ backgroundColor: color }}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateStep}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para remoção da etapa */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Deleção</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja remover a etapa <strong>{stepToDelete?.name}</strong>? Todos os atendimentos associados ficarão sem etapa definida.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (stepToDelete) {
                  handleRemoveStep(stepToDelete.id);
                  setConfirmDialogOpen(false);
                }
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para edição da etapa */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etapa do Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Etapa</Label>
              <Input
                type="text"
                value={editStepName}
                onChange={(e) => setEditStepName(e.target.value)}
                placeholder="Digite o nome da etapa"
              />
            </div>
            <div>
              <Label>Selecione a Cor</Label>
              <HexColorPicker color={editColor} onChange={setEditColor} />
              <div className="mt-2 flex items-center">
                <Input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                <div className="w-8 h-8 ml-2 rounded-full border" style={{ backgroundColor: editColor }}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditStep}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanStepsPage;
