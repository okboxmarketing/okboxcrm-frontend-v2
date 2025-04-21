'use client';

import { moveTicket } from '@/service/ticketsService';
import { formatPhone } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dropTargetForElements, draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useRouter } from 'next/navigation';
import { useKanbanSteps } from '@/hooks/swr/use-kanban-swr';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

export default function KanbanBoard() {
  const router = useRouter();
  const { kanbanSteps, isLoading, mutate } = useKanbanSteps();
  const [draggingTicketId, setDraggingTicketId] = useState<number | null>(null);

  const columns = kanbanSteps
    .filter((step) => step.name !== 'Vendido' && step.name !== 'Perdido')
    .reduce((acc, step) => {
      acc[step.id] = step;
      return acc;
    }, {} as Record<string, typeof kanbanSteps[number]>);

  const handleTicketClick = (ticketId: number) => {
    router.push(`/home/atendimento?ticketId=${ticketId}`);
  };

  useEffect(() => {
    const handleMouseUp = () => setDraggingTicketId(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">Carregando seu quadro Kanban...</p>
        </div>
      </div>
    );
  }

  if (kanbanSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum passo encontrado</h3>
          <p className="text-slate-600 mb-4">
            Parece que não há passos configurados para o seu quadro Kanban.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-6 overflow-hidden">
      <div className="flex-1 mb-4">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <p className="text-black/40">Acompahe as etapas dos seus atendimentos!</p>
      </div>

      <div className="flex space-x-4 overflow-x-auto">
        <AnimatePresence initial={false}>
          {Object.values(columns).map((column) => (
            <motion.div
              key={column.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-white border"
              ref={(element) => {
                if (element) {
                  dropTargetForElements({
                    element,
                    getData: () => ({ droppableId: column.id }),
                    onDrop: ({ source }) => {
                      const { ticketId, sourceStepId } = source.data as {
                        ticketId: number;
                        sourceStepId: number;
                      };
                      if (sourceStepId !== column.id) {
                        moveTicket(ticketId, column.id.toString()).then(() => mutate());
                      }
                      setDraggingTicketId(null);
                    },
                  });
                }
              }}
            >
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: `${column.color}15` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
                  <h2 className="text-lg font-semibold text-slate-800">{column.name}</h2>
                </div>
                <Badge variant="secondary" className="font-medium">
                  {column.ticketCount}
                </Badge>
              </div>

              <ScrollArea className="p-3 h-[calc(100vh-160px)]">
                <AnimatePresence>
                  {column.tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-20 border border-dashed rounded-lg border-slate-200 text-slate-400 text-sm p-4 text-center">
                      Nenhum atendimento nesta etapa
                    </div>
                  ) : (
                    column.tickets.map((ticket) => (
                      <motion.div
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          boxShadow: draggingTicketId === ticket.id ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 mb-3 bg-white rounded-lg border cursor-pointer hover:shadow-md flex flex-col gap-3 relative ${draggingTicketId === ticket.id ? 'border-primary/50 bg-primary/5' : 'border-slate-200'
                          }`}
                        onClick={() => handleTicketClick(ticket.id)}
                        ref={(element) => {
                          if (element) {
                            draggable({
                              element,
                              getInitialData: () => ({
                                ticketId: ticket.id,
                                sourceStepId: column.id,
                              }),
                              onDragStart: () => {
                                setDraggingTicketId(ticket.id);
                              },
                            });
                          }
                        }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg" style={{ backgroundColor: column.color }}></div>
                        <div className="flex items-center gap-3 pl-2">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            {ticket.Contact.pictureUrl ? (
                              <AvatarImage src={ticket.Contact.pictureUrl || "/placeholder.svg"} alt={ticket.Contact.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {ticket.Contact.name[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{ticket.Contact.name}</p>
                            <div className="flex items-center text-xs text-slate-500 gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span>{formatPhone(ticket.Contact.phone)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </ScrollArea>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
