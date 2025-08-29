"use client"
interface TicketAceitoPorUsuario {
    nomeUsuario: string
    quantidade: number
}

interface TicketsAceitosChartProps {
    data: TicketAceitoPorUsuario[]
}

export function TicketsAceitosChart({ data }: TicketsAceitosChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-muted-foreground mb-2">Nenhum dado disponível</p>
                <p className="text-sm text-muted-foreground/70">
                    Os dados serão exibidos assim que houver tickets aceitos no sistema
                </p>
            </div>
        )
    }

    // Ordenar por quantidade decrescente e pegar top 5
    const topUsuarios = data
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)

    // Calcular total para porcentagens
    const totalTickets = data.reduce((sum, item) => sum + item.quantidade, 0)

    return (
        <div className="space-y-3">
            {topUsuarios.map((item, index) => {
                const porcentagem = totalTickets > 0 ? (item.quantidade / totalTickets) * 100 : 0

                return (
                    <div key={index} className="p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </div>
                                <span className="font-medium text-zinc-900 truncate max-w-[120px]">
                                    {item.nomeUsuario}
                                </span>
                            </div>
                            <span className="text-lg font-bold text-orange-600">
                                {item.quantidade}
                            </span>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-full bg-zinc-200 rounded-full h-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${porcentagem}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm text-zinc-600 mt-1">
                            <span className="text-xs">
                                {porcentagem.toFixed(1)}% do total
                            </span>
                            <span className="text-xs">
                                {item.quantidade === 1 ? 'ticket' : 'tickets'}
                            </span>
                        </div>
                    </div>
                )
            })}

            {data.length > 5 && (
                <div className="text-center pt-2">
                    <p className="text-sm text-zinc-500">
                        +{data.length - 5} mais usuários
                    </p>
                    <p className="text-xs text-zinc-400">
                        Total: {totalTickets} tickets aceitos
                    </p>
                </div>
            )}
        </div>
    )
}
