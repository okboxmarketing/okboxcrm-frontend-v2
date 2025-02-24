"use client";
import React, { useState, useEffect } from "react";
import { dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

// Dados iniciais do quadro Kanban
const initialColumns = {
  todo: {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "task1", content: "Task 1" },
      { id: "task2", content: "Task 2" },
    ],
  },
  inProgress: {
    id: "inProgress",
    title: "In Progress",
    tasks: [
      { id: "task3", content: "Task 3" },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    tasks: [
      { id: "task4", content: "Task 4" },
    ],
  },
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState(initialColumns);

  // Função para lidar com o arrastar e soltar
  interface DragResult {
    source: {
      droppableId: string;
      index: number;
    };
    destination: {
      droppableId: string;
      index: number;
    } | null;
  }

  const handleDragEnd = (result: DragResult) => {
    const { source, destination } = result;

    if (!destination) {
      return; // Se não houver destino, não fazemos nada
    }

    const sourceColumn = columns[source.droppableId as keyof typeof columns];
    const destColumn = columns[destination.droppableId as keyof typeof columns];
    const [removed] = sourceColumn.tasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Movendo dentro da mesma coluna
      sourceColumn.tasks.splice(destination.index, 0, removed);
    } else {
      // Movendo para outra coluna
      destColumn.tasks.splice(destination.index, 0, removed);
    }

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  // Configuração do monitor de arrastar e soltar
  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: (args) => {
        const { source, location } = args;
        const destination = location.current.dropTargets[0];

        if (destination) {
          handleDragEnd({
            source: {
              droppableId: source.data.droppableId as string,
              index: source.data.index as number,
            },
            destination: {
              droppableId: destination.data.droppableId as string,
              index: destination.data.index as number,
            },
          });
        }
      },
    });

    return () => cleanup();
  }, [columns]);

  return (
    <div className="flex h-screen bg-white border-t">
      {/* Quadro Kanban */}
      <div className="flex-1 flex p-4 space-x-4 overflow-x-auto">
        {Object.values(columns).map((column) => (
          <div
            key={column.id}
            className="w-72 bg-gray-50 rounded-lg p-4 border border-gray-200"
            ref={(element) => {
              if (element) {
                dropTargetForElements({
                  element,
                  getData: () => ({ droppableId: column.id }),
                });
              }
            }}
          >
            <h2 className="text-lg font-semibold mb-4">{column.title}</h2>
            <div className="space-y-2">
              {column.tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "text/plain",
                      JSON.stringify({ droppableId: column.id, index })
                    );
                  }}
                >
                  <p className="text-sm text-gray-800">{task.content}</p>
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