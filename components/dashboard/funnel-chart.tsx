import type { FunilVendas } from "@/types/dashboard"

interface FunnelChartProps {
    data: FunilVendas[]
}

export function SalesFunnelChart({ data }: FunnelChartProps) {
    const maxValue = Math.max(...data.map((item) => item.valor))

    return (
        <div className="space-y-1">
            {data.map((item, index) => {
                const widthPercentage = (item.valor / maxValue) * 100

                return (
                    <div key={item.etapa} className="relative">
                        <div className="flex flex-col items-center">
                            <div
                                className="relative h-16 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
                                style={{
                                    width: `${widthPercentage}%`,
                                    maxWidth: "100%",
                                    minWidth: "200px",
                                    clipPath:
                                        index === data.length - 1
                                            ? "polygon(15% 0%, 85% 0%, 85% 100%, 15% 100%)"
                                            : "polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)",
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <div className="font-semibold text-sm">{item.etapa}</div>
                                        <div className="text-xs opacity-90">{item.valor.toLocaleString("pt-BR")} leads</div>
                                    </div>
                                </div>
                            </div>

                            {index < data.length - 1 && (
                                <div className="flex flex-col items-center py-2">
                                    <div
                                        className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-muted"
                                    />
                                    <div className="text-xs font-medium mt-1 text-muted-foreground">
                                        {item.taxa && item.taxa.toFixed(1)}% conversão
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
