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
}

const MoveTicketSelect: React.FC<MoveTicketSelectProps> = ({ ticketId, fetchTickets }) => {
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const [steps, currentStep] = await Promise.all([
          getKanbanSteps(),
          getKanbanStepByTicketId(ticketId),
        ]);

        const filteredSteps = steps.filter(step =>
          step.name !== "Perdido" && step.name !== "Vendido" && step.name !== "Com Contato" && step.name !== "Sem Contato"
        );

        setKanbanSteps(filteredSteps);
        setSelectedStep(currentStep.id.toString());
      } catch (error) {
        console.log(error);
        toast({ description: "Erro ao carregar etapas do Kanban" });
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanData();
  }, [ticketId]);

  const handleMoveTicket = async (value: string) => {
    const stepId = Number(value);
    if (isNaN(stepId)) return;

    try {
      await moveTicket(ticketId, stepId.toString());
      setSelectedStep(value);
      toast({ description: "Ticket movido com sucesso!" });
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
    <Select onValueChange={handleMoveTicket} value={selectedStep}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder={loading ? "Carregando..." : "Selecione a Etapa"} className="w-1/2" />
      </SelectTrigger>
      <SelectContent>
        {kanbanSteps.map((step) => (
          <SelectItem key={step.id} value={step.id.toString()}>
            <p className={`font-bold`} style={{ color: step.color }}>
              {step.name}
            </p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MoveTicketSelect;