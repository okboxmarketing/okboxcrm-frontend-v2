import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getKanbanSteps, getKanbanStepByTicketId } from "@/service/kanbanStepsService";
import { moveTicket } from "@/service/ticketsService";

interface KanbanStep {
  id: number;
  color: string;
  name: string;
}

interface MoveTicketSelectProps {
  ticketId: number;
  fetchTickets: () => void;
  refreshKey: number
}

const MoveTicketSelect: React.FC<MoveTicketSelectProps> = ({ ticketId, fetchTickets, refreshKey }) => {
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string>("");
  const { toast } = useToast();

  const fetchKanbanData = async () => {
    try {
      const [steps, currentStep] = await Promise.all([
        getKanbanSteps(),
        getKanbanStepByTicketId(ticketId),
      ]);
      setKanbanSteps(steps);
      setSelectedStep(currentStep.id.toString());
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao carregar etapas do Kanban" });
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, [ticketId, refreshKey]);

  const handleMoveTicket = async (value: string) => {
    const stepId = Number(value);
    if (isNaN(stepId)) return;

    try {
      await moveTicket(ticketId, stepId.toString());
      setSelectedStep(value);
      fetchTickets()
    } catch (error) {
      console.log(error);
      toast({
        description: "Erro ao mover ticket",
        variant: "destructive"
      });
    }
  };

  return (
    <Select key={refreshKey} onValueChange={handleMoveTicket} value={selectedStep}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Selecione a Etapa" className="w-1/2" />
      </SelectTrigger>
      <SelectContent>
        {kanbanSteps.map((step) => (
          <SelectItem
            key={step.id}
            value={step.id.toString()}
            disabled={step.name === "Sem Contato" || step.name === "Contato Feito" || step.name === "Vendido" || step.name === "Perdido"}>
            <p className="font-bold" style={{ color: step.color }}>
              {step.name}
            </p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MoveTicketSelect;
