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
import { LossStepsBarChart } from "@/components/dashboard/loss-steps-chart"

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
    <div className="min-h-screen bg-white p-6 space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500">Resumo geral das métricas por período</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50",
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
            className="w-full sm:w-auto bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Conversas Iniciadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{data?.totalConversas || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{data?.totalVendas || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <PieChart className="h-5 w-5 text-emerald-500" />
              Valor Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data?.valorTotalVendas || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(data?.taxaConversao || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data?.ticketMedio || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Total de Perdas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{data?.totalPerdas || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Leads por Etapa
              </CardTitle>
              <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
            </CardHeader>
            <CardContent>
              {data?.composicaoKanban && data.composicaoKanban.length > 0 ? (
                <KanbanPieChart data={data.composicaoKanban} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                  <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver leads no sistema</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Funil de Vendas
              </CardTitle>
              <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
            </CardHeader>
            <CardContent>
              {data?.funilVendas && data.funilVendas.length > 0 ? (
                <SalesFunnelChart data={data.funilVendas} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                  <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver leads no sistema</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Principais Motivos de Perda
              </CardTitle>
              <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
            </CardHeader>
            <CardContent>
              {data?.rankingMotivosPerda && data.rankingMotivosPerda.length > 0 ? (
                <LossReasonsBarChart data={data.rankingMotivosPerda} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                  <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver leads perdidos no sistema</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Etapas com Mais Perdas
              </CardTitle>
              <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
            </CardHeader>
            <CardContent>
              {data?.etapaAoPerder && data.etapaAoPerder.length > 0 ? (
                <LossStepsBarChart data={data.etapaAoPerder} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                  <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver leads perdidos no sistema</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
