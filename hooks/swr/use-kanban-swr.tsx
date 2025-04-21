import useSWR from "swr";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { KanbanStep } from "@/lib/types";

export function useKanbanSteps() {
    const { data, error, isLoading, mutate } = useSWR<KanbanStep[]>(
        "kanban-steps",
        getKanbanSteps
    );

    return {
        kanbanSteps: data ?? [],
        isLoading,
        error,
        mutate,
    };
}
