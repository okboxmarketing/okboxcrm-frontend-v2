"use client";
import React, { useState, useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getKanbanSteps } from "@/service/kanbanStepsService";
import { KanbanStep } from "@/lib/types";
import { moveTicket } from "@/service/ticketsService";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Record<string, KanbanStep>>({});

  useEffect(() => {
    getKanbanSteps().then((steps) => {
      if (steps) {
        const newColumns: Record<string, KanbanStep> = {};
        steps.forEach((step: KanbanStep) => {
          newColumns[step.id] = step;
        });
        setColumns(newColumns);
      }
    });
  }, []);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, ticketId: number, sourceStepId: number) => {
    event.dataTransfer.setData("application/json", JSON.stringify({ ticketId, sourceStepId }));
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, destinationStepId: number) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("application/json"));
    const { ticketId, sourceStepId } = data;

    if (sourceStepId !== destinationStepId) {
      await moveTicket(ticketId, destinationStepId.toString());
      getKanbanSteps().then((steps) => {
        if (steps) {
          const newColumns: Record<string, KanbanStep> = {};
          steps.forEach((step: KanbanStep) => {
            newColumns[step.id] = step;
          });
          setColumns(newColumns);
        }
      });
    }
  };

  return (
    <div className="flex h-screen bg-white border-t">
      <div className="flex-1 flex p-4 space-x-4 overflow-x-auto">
        {Object.values(columns).map((column) => (
          <div
            key={column.id}
            className={`w-72 rounded-lg p-4 shadow-sm bg-slate-50 border border-t-4`}
            style={{ borderColor: column.color }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, column.id)}
            ref={(element) => {
              if (element) {
                dropTargetForElements({
                  element,
                  getData: () => ({ droppableId: column.id }),
                });
              }
            }}
          >
            <div className="flex items-center justify-between  mb-4">
              <h2 className="text-lg font-semibold" style={{ color: column.color }}>{column.name}</h2>
              <span className="flex items-center justify-center w-6 h-6 bg-black text-white text-sm font-medium rounded-full">
                {column.ticketCount}
              </span>
            </div>
            <div className="space-y-2">
              {column.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md flex items-center gap-4"
                  draggable
                  onDragStart={(event) => handleDragStart(event, ticket.id, column.id)}
                >
                  <img
                    src={ticket.Contact.pictureUrl || "/images/avatar-placeholder.png"}
                    alt={ticket.Contact.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-sm text-gray-800">{ticket.Contact.name}</p>
                    <p>{ticket.Contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
