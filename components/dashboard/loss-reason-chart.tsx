"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingDown } from "lucide-react"

interface Props {
    data: { motivo: string; quantidade: number }[]
}

const chartConfig = {
    perdas: {
        label: "Perdas",
        color: "hsl(var(--chart-1))",
    },
    label: {
        color: "hsl(var(--background))",
    },
} satisfies ChartConfig

export function LossReasonsBarChart({ data }: Props) {
    const top6 = data.slice(0, 6)

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Principais Motivos de Perda</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={top6}
                        layout="vertical"
                        margin={{ right: 16 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="motivo"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={200}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
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
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                <div className="flex gap-2 items-center">
                    <TrendingDown className="h-4 w-4" />
                    Dados dos 6 principais motivos de perda
                </div>
            </CardFooter>
        </Card>
    )
}
