import useSWR from "swr";
import type { KanbanStep, Ticket } from "@/lib/types";
import { useState } from "react";
import { getKanbanBoard, getTicketsByStepId } from "@/service/kanbanService";

export function useKanbanBoard() {
    const { data: board, error, isLoading, mutate } = useSWR<KanbanStep[]>(
        "kanban-board",
        () => getKanbanBoard()
    );

    const [pages, setPages] = useState<Record<number, number>>({});
    const [loadingMore, setLoadingMore] = useState<Record<number, boolean>>({});

    async function loadMore(stepId: number) {
        setLoadingMore((prev) => ({ ...prev, [stepId]: true }));
        const nextPage = (pages[stepId] ?? 1) + 1;
        try {

            const more: Ticket[] = await getTicketsByStepId(stepId, nextPage);
            mutate((current) => {
                if (!current) return current;
                return current.map((step) => {
                    if (step.id === stepId) {
                        return {
                            ...step,
                            tickets: [...step.tickets, ...more],
                        };
                    }
                    return step;
                });
            }, false);
            setPages((prev) => ({ ...prev, [stepId]: nextPage }));
        } finally {
            setLoadingMore((prev) => ({ ...prev, [stepId]: false }));
        }
    }

    return {
        kanbanBoard: board ?? [],
        isLoading,
        error,
        reload: mutate,
        loadMore,
        loadingMore,
    };
}