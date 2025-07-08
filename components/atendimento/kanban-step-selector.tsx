import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { moveTicket } from "@/service/ticketsService";
import { useChatStore } from "@/store/chatStore";

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
  const [selectedStep, setSelectedStep] = useState<string>("");
  const { selectedChat, updateChat } = useChatStore()
  const { toast } = useToast();

  const fetchKanbanData = async () => {
    try {
      const steps = await getKanbanSteps();
      const filteredSteps = steps.filter(step => step.name !== "Sem Contato");
      setKanbanSteps(filteredSteps);
    } catch (error) {
      console.log(error);
      toast({ description: "Erro ao carregar etapas do Kanban" });
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, []);

  useEffect(() => {
    if (selectedChat?.kanbanStepId) {
      setSelectedStep(selectedChat.kanbanStepId.toString());
    }
  }, [selectedChat?.kanbanStepId]);

  const handleMoveTicket = async (value: string) => {
    const stepId = Number(value);
    if (isNaN(stepId)) return;

    try {
      if (stepId) {
        await moveTicket(ticketId, stepId.toString());
        setSelectedStep(value);

        // Busca as informações da nova etapa
        const newStep = kanbanSteps.find(step => step.id === stepId);

        if (selectedChat && newStep) {
          const updatedTicket = {
            ...selectedChat,
            kanbanStepId: stepId,
            KanbanStep: {
              id: newStep.id,
              name: newStep.name,
              color: newStep.color
            }
          };
          updateChat(updatedTicket);
        }
      } else {
        console.error("ID da etapa inválido");
        return
      }
    } catch (error) {
      console.log(error);
      toast({
        description: "Erro ao mover ticket",
        variant: "destructive"
      });
    }
  };

  return (
    <Select
      onValueChange={handleMoveTicket}
      value={selectedStep}
    >
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Selecione a Etapa" className="w-1/2" />
      </SelectTrigger>
      <SelectContent>
        {kanbanSteps.map((step) => (
          <SelectItem
            key={step.id}
            value={step.id.toString()}
            disabled={step.name === "Perdido" || step.name === "Vendido"}>
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
