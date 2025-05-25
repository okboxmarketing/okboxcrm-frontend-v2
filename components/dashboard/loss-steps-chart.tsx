"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Props {
    data: { etapa: string; quantidade: number }[];
}

export function LossStepsBarChart({ data }: Props) {
    const top6 = data.slice(0, 6)

    const chartConfig = {
        perdas: {
            label: "Perdas",
            color: "hsl(var(--primary))",
        },
        label: {
            color: "hsl(var(--foreground))",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig}>
            <BarChart
                data={top6}
                layout="vertical"
                margin={{ right: 16, left: 8, top: 8, bottom: 8 }}
                height={200}
            >
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <YAxis
                    dataKey="etapa"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    className="fill-foreground text-xs"
                />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar
                    dataKey="quantidade"
                    fill="var(--color-perdas)"
                    radius={4}
                >
                    <LabelList
                        dataKey="quantidade"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    )
} 