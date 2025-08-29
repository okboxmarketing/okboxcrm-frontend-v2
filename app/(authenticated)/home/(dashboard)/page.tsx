"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanPieChart } from "@/components/dashboard/kanban-pie-chart"
import { CalendarIcon, BarChart3, PieChart, TrendingUp, Users, Target } from 'lucide-react'
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
import { DashboardCardSkeleton, DashboardChartSkeleton, DashboardRankingSkeleton } from "@/components/skeleton/dashboard-card-skeleton"
import { TicketsAceitosChart } from "@/components/dashboard/tickets-aceitos-chart"
import { SimpleExportDropdown } from "@/components/reports/simple-export-dropdown"
import { generateDashboardReport } from "@/service/reportService"

export default function DashboardPage() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 1 semana atrás
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const [date, setDate] = useState<DateRange | undefined>({
    from: oneWeekAgo,
    to: tomorrow,
  })

  const startDate = date?.from?.toISOString().split("T")[0] ?? ""
  const endDate = date?.to?.toISOString().split("T")[0] ?? ""

  const { data, loading } = useDashboardData(startDate, endDate)

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

          <SimpleExportDropdown
            reportType="dashboard"
            generateReport={generateDashboardReport}
            onExport={() => { }}
          />
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeletons para os cards de métricas
          Array.from({ length: 6 }).map((_, index) => (
            <DashboardCardSkeleton key={index} height="h-full" />
          ))
        ) : (
          <>
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Conversas Iniciadas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">{data?.totalConversas || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">{data?.totalVendas || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <PieChart className="h-5 w-5 text-emerald-500" />
                  Valor Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data?.valorTotalVendas || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "percent",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data?.taxaConversao || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data?.ticketMedio || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Total de Perdas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <p className="text-3xl font-bold text-zinc-900">{data?.totalPerdas || 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardChartSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Leads por Etapa
                </CardTitle>
                <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
              </CardHeader>
              <CardContent className="flex-1">
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
          )}
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardChartSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Funil de Vendas
                </CardTitle>
                <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
              </CardHeader>
              <CardContent className="flex-1">
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
          )}
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardChartSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Principais Motivos de Perda
                </CardTitle>
                <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
              </CardHeader>
              <CardContent className="flex-1">
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
          )}
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardChartSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Etapas com Mais Perdas
                </CardTitle>
                <p className="text-zinc-500 text-sm">Distribuição de leads no funil</p>
              </CardHeader>
              <CardContent className="flex-1">
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
          )}
        </div>

        {/* Novos cards para rankings dos criativos */}
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardRankingSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <Target className="h-5 w-5 text-blue-500" />
                  Ranking de Criativos
                </CardTitle>
                <p className="text-zinc-500 text-sm">
                  Total: {data?.totalCaptacoesPorCriativos || 0} captações | Top 5 criativos
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                {data?.rankingCaptacoesPorCriativos && data.rankingCaptacoesPorCriativos.length > 0 ? (
                  <div className="space-y-3">
                    {data.rankingCaptacoesPorCriativos.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-zinc-900 truncate">{item.criativo}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{item.quantidade}</span>
                      </div>
                    ))}
                    {data.rankingCaptacoesPorCriativos.length > 5 && (
                      <p className="text-sm text-zinc-500 text-center">
                        +{data.rankingCaptacoesPorCriativos.length - 5} mais criativos
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                    <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver criativos no sistema</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardRankingSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <Users className="h-5 w-5 text-purple-500" />
                  Ranking por Origem
                </CardTitle>
                <p className="text-zinc-500 text-sm">Top 5 origens com mais captações</p>
              </CardHeader>
              <CardContent className="flex-1">
                {data?.rankingCaptacoesPorOrigem && data.rankingCaptacoesPorOrigem.length > 0 ? (
                  <div className="space-y-3">
                    {data.rankingCaptacoesPorOrigem.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-zinc-900 truncate">{item.origem}</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{item.quantidade}</span>
                      </div>
                    ))}
                    {data.rankingCaptacoesPorOrigem.length > 5 && (
                      <p className="text-sm text-zinc-500 text-center">
                        +{data.rankingCaptacoesPorOrigem.length - 5} mais origens
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                    <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver origens no sistema</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardRankingSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <Target className="h-5 w-5 text-green-500" />
                  Conversões por Criativo
                </CardTitle>
                <p className="text-zinc-500 text-sm">Performance de conversão dos criativos</p>
              </CardHeader>
              <CardContent className="flex-1">
                {data?.conversoesPorCriativo && data.conversoesPorCriativo.length > 0 ? (
                  <div className="space-y-3">
                    {data.conversoesPorCriativo.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-zinc-900 truncate">{item.nomeCriativo}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {item.taxaConversao.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-600">
                          <span>Leads: {item.leadsCaptados}</span>
                          <span>Conversões: {item.conversoes}</span>
                        </div>
                      </div>
                    ))}
                    {data.conversoesPorCriativo.length > 5 && (
                      <p className="text-sm text-zinc-500 text-center">
                        +{data.conversoesPorCriativo.length - 5} mais criativos
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                    <p className="text-sm text-muted-foreground/70">Os dados serão exibidos assim que houver conversões no sistema</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Novo card para ranking de tickets aceitos por usuário */}
        <div className="md:col-span-2 lg:col-span-2">
          {loading ? (
            <DashboardRankingSkeleton height="h-full" />
          ) : (
            <Card className="bg-white border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <Users className="h-5 w-5 text-orange-500" />
                  Tickets Aceitos por Usuário
                </CardTitle>
                <p className="text-zinc-500 text-sm">Ranking de usuários que mais aceitaram tickets</p>
              </CardHeader>
              <CardContent className="flex-1">
                {data?.rankingTicketsAceitosPorUsuario && data.rankingTicketsAceitosPorUsuario.length > 0 ? (
                  <TicketsAceitosChart data={data.rankingTicketsAceitosPorUsuario} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                    <p className="text-sm text-muted-foreground/70">
                      Os dados serão exibidos assim que houver tickets aceitos no sistema
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
