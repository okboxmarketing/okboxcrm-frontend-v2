'use client';

import { moveTicket } from '@/service/ticketsService';
import { formatPhone } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dropTargetForElements, draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useRouter } from 'next/navigation';
import { useKanbanBoard } from '@/hooks/swr/use-kanban-board';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function KanbanBoard() {
  const router = useRouter();
  const { kanbanBoard, isLoading, error, reload, loadMore, loadingMore } = useKanbanBoard();
  const [draggingTicketId, setDraggingTicketId] = useState<number | null>(null);

  const ordered = [...kanbanBoard]
    .filter((col) => col.name !== 'Vendido' && col.name !== 'Perdido')
    .sort((a, b) => a.position - b.position);

  const handleTicketClick = (ticketId: number) => {
    router.push(`/home/atendimento?ticketId=${ticketId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Erro ao carregar o Kanban.</div>;
  }

  return (
    <div className="h-screen p-6 overflow-hidden">
      <h1 className="text-2xl font-bold mb-2">Kanban</h1>
      <p className="text-black/40 mb-6">Acompanhe as etapas dos seus atendimentos!</p>

      <div className="flex space-x-4 overflow-x-auto">
        <AnimatePresence initial={false}>
          {ordered.map((col) => (
            <motion.div
              key={col.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-white border"
              ref={(el) => {
                if (!el) return;
                dropTargetForElements({
                  element: el,
                  getData: () => ({ droppableId: col.id }),
                  onDrop: ({ source }) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { ticketId, sourceStepId } = source.data as any;
                    if (sourceStepId !== col.id) {
                      moveTicket(ticketId, col.id.toString()).then(() => reload());
                    }
                    setDraggingTicketId(null);
                  },
                });
              }}
            >
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: `${col.color}15` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                  <h2 className="text-lg font-semibold text-slate-800">{col.name}</h2>
                </div>
                <Badge variant="secondary" className="font-medium">
                  {col.ticketCount}
                </Badge>
              </div>

              <ScrollArea className="p-3 h-[calc(100vh-200px)]">
                <AnimatePresence>
                  {col.tickets.length === 0 ? (
                    <div className="flex h-20 items-center justify-center text-sm text-slate-400 border-dashed border rounded-lg">
                      Nenhum atendimento nesta etapa
                    </div>
                  ) : (
                    col.tickets.map((ticket) => (
                      <motion.div
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          boxShadow:
                            draggingTicketId === ticket.id
                              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                              : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 mb-3 bg-white rounded-lg border cursor-pointer hover:shadow-md flex gap-3 relative ${draggingTicketId === ticket.id
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-slate-200'
                          }`}
                        onClick={() => handleTicketClick(ticket.id)}
                        ref={(el) => {
                          if (!el) return;
                          draggable({
                            element: el,
                            getInitialData: () => ({
                              ticketId: ticket.id,
                              sourceStepId: col.id,
                            }),
                            onDragStart: () => setDraggingTicketId(ticket.id),
                          });
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
                          style={{ backgroundColor: col.color }}
                        />
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          {ticket.Contact?.pictureUrl ? (
                            <AvatarImage src={ticket.Contact.pictureUrl} alt={ticket.Contact.name} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {ticket.Contact?.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {ticket.Contact?.name}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{formatPhone(ticket.Contact?.phone)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {col.tickets.length < col.ticketCount && (
                  <div className="text-center mt-2">
                    <Button variant="outline" onClick={() => loadMore(col.id)} isLoading={loadingMore[col.id]}>
                      Carregar mais
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
