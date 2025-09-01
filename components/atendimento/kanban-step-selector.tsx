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
  const { selectedChat, updateChat, removeTicket, selectChat, currentKanbanStepId, currentOnlyActive } = useChatStore()
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
    } else {
      setSelectedStep("");
    }
  }, [selectedChat?.kanbanStepId]);

  const handleMoveTicket = async (value: string) => {
    const stepId = Number(value);
    if (isNaN(stepId)) return;

    try {
      if (stepId) {
        await moveTicket(ticketId, stepId.toString());
        setSelectedStep(value);

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

          const shouldRemoveTicket = () => {
            if (currentKanbanStepId !== undefined && currentKanbanStepId !== stepId) {
              return true;
            }

            if (currentOnlyActive && (newStep.name === "Vendido" || newStep.name === "Perdido")) {
              return true;
            }

            if (newStep.name === "Sem Contato") {
              return true;
            }

            return false;
          };

          if (shouldRemoveTicket()) {
            removeTicket(ticketId);
            selectChat(null);
          }
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
      <SelectTrigger className="bg-white h-10 w-full min-w-[140px]">
        <SelectValue placeholder="Selecione a Etapa" />
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
