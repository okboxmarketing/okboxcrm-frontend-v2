"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Props {
    data: { motivo: string; quantidade: number }[];
    darkMode?: boolean;
}

export function LossReasonsBarChart({ data, darkMode = false }: Props) {
    const top6 = data.slice(0, 6)

    const chartConfig = {
        perdas: {
            label: "Perdas",
            color: darkMode ? "#ef4444" : "hsl(var(--primary))",
        },
        label: {
            color: darkMode ? "#f4f4f5" : "hsl(var(--foreground))",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig}>
            <BarChart
                data={top6}
                layout="vertical"
                margin={{ right: 16 }}
            >
                <CartesianGrid horizontal={false} stroke={darkMode ? "#3f3f46" : "hsl(var(--border))"} />
                <YAxis
                    dataKey="motivo"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={200}
                    className={darkMode ? "fill-zinc-100 text-xs" : "fill-foreground text-xs"}
                />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar
                    dataKey="quantidade"
                    fill={darkMode ? "#ef4444" : "var(--color-perdas)"}
                    radius={4}
                >
                    <LabelList
                        dataKey="quantidade"
                        position="right"
                        className={darkMode ? "fill-zinc-100" : "fill-foreground"}
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}
