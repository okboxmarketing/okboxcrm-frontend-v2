import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { moveTicket } from "@/service/ticketsService";

interface KanbanStep {
  id: number;
  color: string;
  name: string;
}

interface MoveTicketSelectProps {
  ticketId: number;
}

const MoveTicketSelect: React.FC<MoveTicketSelectProps> = ({ ticketId }) => {
  const [kanbanSteps, setKanbanSteps] = useState<KanbanStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar etapas do Kanban
  useEffect(() => {
    const fetchKanbanSteps = async () => {
      try {
        const steps = await getKanbanSteps();
        setKanbanSteps(steps);
      } catch (error) {
        console.log(error);
        toast({ description: "Erro ao carregar etapas do Kanban" });
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanSteps();
  }, []);

  const handleMoveTicket = async (value: string) => {
    const stepId = Number(value);
    if (isNaN(stepId)) return;

    try {
      await moveTicket(ticketId, stepId.toString());
      toast({ description: "Ticket movido com sucesso!" });
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao mover ticket" });
    }
  };

  return (
    <Select onValueChange={handleMoveTicket}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder={loading ? "Carregando..." : "Selecione a Etapa"} className="w-1/2" />
      </SelectTrigger>
      <SelectContent>
        {kanbanSteps.map((step) => (
          <SelectItem key={step.id} value={step.id.toString()}>
            <p className={`bg-[${step.color}]`}>
              {step.name}
            </p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MoveTicketSelect;
