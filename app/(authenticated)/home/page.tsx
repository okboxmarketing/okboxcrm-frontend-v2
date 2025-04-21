'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/dashboard';
import { getDashboardData } from '@/service/dashboardService';
import { KanbanPieChart } from '@/components/dashboard/kanban-pie-chart';

import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DateRange } from 'react-day-picker';


export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [date, setDate] = useState<DateRange | undefined>({
    from: firstDayOfMonth,
    to: today,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!date?.from || !date?.to) return;

      setLoading(true);
      try {
        const startDate = date.from.toISOString().split('T')[0];
        const endDate = date.to.toISOString().split('T')[0];
        const result = await getDashboardData(startDate, endDate);
        setData(result);
      } catch (error) {
        console.error('Erro ao buscar dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  if (loading) return <p className="p-4">Carregando...</p>;
  if (!data) return <p className="p-4">Nenhum dado disponível.</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-black/40">Resumo geral das métricas por período</p>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={() => setDate(undefined)}>
            Limpar Filtros
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalVendas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.valorTotalVendas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.ticketMedio)}
            </p>
          </CardContent>
        </Card>

        <KanbanPieChart data={data.composicaoKanban} />
      </div>
    </div>
  );
}
