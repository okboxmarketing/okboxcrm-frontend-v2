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
import { Plus } from "lucide-react";
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
  const [position, setPosition] = useState(0);
  const [beforeStep, setBeforeStep] = useState<KanbanStep | null>(null);
  const [afterStep, setAfterStep] = useState<KanbanStep | null>(null);
  const { toast } = useToast();

  const fetchKanbanSteps = async () => {
    try {
      const data = await getKanbanSteps();
      const sortedData = [...data].sort((a, b) => a.position - b.position);
      setKanbanSteps(sortedData);
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

  const isStepCreationAllowed = (before: KanbanStep, after: KanbanStep) => {
    if (before.name === "Sem Contato" && after.name === "Contato Feito") {
      return false;
    }

    if ((before.name === "Perdido" && after.name === "Vendido") ||
      (before.name === "Vendido" && after.name === "Perdido")) {
      return false;
    }

    return true;
  };

  const openCreateBetweenDialog = (beforeIndex: number) => {
    const before = kanbanSteps[beforeIndex];
    const after = kanbanSteps[beforeIndex + 1];

    if (!isStepCreationAllowed(before, after)) {
      toast({
        description: `Não é permitido criar etapas entre "${before.name}" e "${after.name}"`,
        variant: "destructive"
      });
      return;
    }

    setBeforeStep(before);
    setAfterStep(after);

    const newPosition = calculatePositionBetween(before, after);
    setPosition(newPosition);

    setStepName("");
    setColor("#000000");
    setOpenDialog(true);
  };

  const calculatePositionBetween = (before: KanbanStep, after: KanbanStep) => {
    if (!before || !after) {
      if (!before) return (after?.position || 0) - 1;
      if (!after) return (before?.position || 0) + 1;
      return 0;
    }

    return (before.position + after.position) / 2;
  };

  const handleCreateStep = async () => {
    if (!stepName.trim()) return;

    try {
      console.log("aquii", stepName, color, position);
      await createKanbanStep(stepName, color, position);
      toast({ description: "Etapa criada com sucesso!" });
      setStepName("");
      setColor("#000000");
      setBeforeStep(null);
      setAfterStep(null);
      setOpenDialog(false);

      fetchKanbanSteps();
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao criar etapa" });
    }
  };

  const handleEditStep = async () => {
    if (!stepToEdit) return;
    try {
      await updateKanbanStep(stepToEdit.id, editStepName, editColor);
      toast({ description: "Etapa atualizada com sucesso!" });
      setEditDialogOpen(false);
      setStepToEdit(null);

      fetchKanbanSteps();
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao atualizar etapa" });
    }
  };

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
      </div>

      {kanbanSteps.length ? (
        <div className="relative">
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
              {kanbanSteps.map((step, index) => (
                <>
                  <TableRow key={step.id}>
                    <TableCell>{step.name}</TableCell>
                    <TableCell>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: step.color }}></div>
                    </TableCell>
                    <TableCell>{step.ticketCount}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        disabled={step.name === "Sem Contato" || step.name === "Contato Feito" || step.name === "Vendido" || step.name === "Perdido"}
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
                        disabled={step.name === "Sem Contato" || step.name === "Contato Feito" || step.name === "Vendido" || step.name === "Perdido"}
                        onClick={() => {
                          setStepToDelete(step);
                          setConfirmDialogOpen(true);
                        }}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>

                  {index < kanbanSteps.length - 1 && (
                    (() => {
                      const before = kanbanSteps[index];
                      const after = kanbanSteps[index + 1];
                      const isAllowed = isStepCreationAllowed(before, after);

                      return (
                        <TableRow
                          className={`h-0 group hover:bg-gray-50 ${isAllowed ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          onClick={() => isAllowed && openCreateBetweenDialog(index)}
                        >
                          <TableCell colSpan={4} className="p-0 h-0">
                            {isAllowed && (
                              <div className="bg-gray-100 items-center font-bold flex gap-2 px-2 hover:bg-gray-50">
                                <Plus size='14' />
                                <p> Adicionar Etapa</p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })()
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Nenhuma etapa cadastrada.</p>
          <Button onClick={() => {
            setPosition(0);
            setOpenDialog(true);
          }}>
            Criar Primeira Etapa
          </Button>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {beforeStep && afterStep
                ? `Nova Etapa entre "${beforeStep.name}" e "${afterStep.name}"`
                : "Nova Etapa do Kanban"}
            </DialogTitle>
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