"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanPieChart } from "@/components/dashboard/kanban-pie-chart"
import { CalendarIcon, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { useDashboardData } from "@/hooks/swr/use-dashboard-swr"
import { LossReasonsBarChart } from "@/components/dashboard/loss-reason-chart"
import { SalesFunnelChart } from "@/components/dashboard/funnel-chart"

export default function DashboardPage() {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [date, setDate] = useState<DateRange | undefined>({
    from: firstDayOfMonth,
    to: today,
  })

  const startDate = date?.from?.toISOString().split("T")[0] ?? ""
  const endDate = date?.to?.toISOString().split("T")[0] ?? ""

  const { data } = useDashboardData(startDate, endDate)

  return (
    <div className="min-h-screen bg-zinc-900 p-6 space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400">Resumo geral das métricas por período</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100",
                  !date && "text-zinc-500",
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

          <Button
            variant="outline"
            onClick={() => setDate(undefined)}
            className="w-full sm:w-auto bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Conversas Iniciadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">{data?.totalConversas || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">{data?.totalVendas || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <PieChart className="h-5 w-5 text-emerald-500" />
              Valor Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data?.valorTotalVendas || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">
              {new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(data?.taxaConversao || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data?.ticketMedio || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Total de Perdas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-100">{data?.totalPerdas || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Leads por Etapa
              </CardTitle>
              <p className="text-zinc-400 text-sm">Distribuição de leads no funil</p>
            </CardHeader>
            <CardContent>
              <KanbanPieChart data={data?.composicaoKanban || []} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Funil de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesFunnelChart data={data?.funilVendas || []} darkMode={true} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Principais Motivos de Perda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LossReasonsBarChart data={data?.rankingMotivosPerda || []} darkMode={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
