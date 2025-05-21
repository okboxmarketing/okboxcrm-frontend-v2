import type { FunilVendas } from "@/types/dashboard"

interface FunnelChartProps {
    data: FunilVendas[];
    darkMode?: boolean;
}

export function SalesFunnelChart({ data, darkMode = false }: FunnelChartProps) {
    return (
        <div className="space-y-6">
            {data.map((item, index) => (
                <div key={item.etapa} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className={`text-sm font-medium ${darkMode ? 'text-zinc-100' : ''}`}>{item.etapa}</span>
                            <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                                {item.valor.toLocaleString('pt-BR')} leads
                            </p>
                        </div>
                        {index < data.length - 1 && (
                            <div className="text-right">
                                <span className={`text-sm font-medium ${darkMode ? 'text-zinc-100' : ''}`}>
                                    {item.taxa && item.taxa.toFixed(1)}%
                                </span>
                                <p className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                                    taxa de conversão
                                </p>
                            </div>
                        )}
                    </div>
                    <div className={`relative h-2 w-full ${darkMode ? 'bg-zinc-700' : 'bg-secondary/50'} rounded-full overflow-hidden`}>
                        <div
                            className={`h-full ${darkMode ? 'bg-emerald-500' : 'bg-primary'} transition-all`}
                            style={{
                                width: `${item.taxa}%`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
