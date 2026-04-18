import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGermanDate, formatGermanDateShort } from "@/lib/time";
import type { InsightDataPoint } from "@/lib/insights";
import { InsightsTooltip } from "@/components/insights/insights-tooltip";

function roundToNiceNumber(value: number) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;
    let nice;
    if (normalized <= 1) nice = 1;
    else if (normalized <= 2) nice = 2;
    else if (normalized <= 5) nice = 5;
    else nice = 10;
    return nice * magnitude;
}

export function AbsoluteChart(props: { data: InsightDataPoint[]; endDayId: Date }) {
    const chartData = props.data.map((point) => ({
        ...point,
        pointsUnearned: Math.max(0, point.totalPossiblePoints - point.pointsEarned),
    }));

    const maxTotalPoints = chartData.length > 0 ? Math.max(...chartData.map((d) => d.totalPossiblePoints)) : 0;

    const roundedMax = maxTotalPoints > 0 ? roundToNiceNumber(maxTotalPoints) : 100;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-1">
                <CardTitle>Trend</CardTitle>
                <CardDescription>Absolute · End {formatGermanDate(props.endDayId)}</CardDescription>
            </CardHeader>
            <CardContent className="h-96 px-3 py-3">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 8,
                            bottom: 8,
                            left: 20,
                            right: 0,
                        }}
                    >
                        <XAxis
                            dataKey="bucket"
                            stroke="oklch(68% 0.01 270)"
                            tickLine={false}
                            axisLine={{
                                stroke: "oklch(25% 0.01 270 / 0.5)",
                            }}
                            tick={{
                                fontSize: 11,
                                fill: "oklch(68% 0.01 270)",
                            }}
                            tickFormatter={(value: string) => formatGermanDateShort(new Date(value))}
                        />
                        <YAxis
                            domain={[0, roundedMax]}
                            stroke="oklch(68% 0.01 270)"
                            tick={{
                                fontSize: 11,
                                fill: "oklch(68% 0.01 270)",
                            }}
                            tickLine={false}
                            axisLine={{
                                stroke: "oklch(25% 0.01 270 / 0.5)",
                            }}
                            tickCount={6}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={(tooltipProps) => <InsightsTooltip {...tooltipProps} mode="absolute" />}
                        />
                        <Bar
                            dataKey="pointsEarned"
                            stackId="stack"
                            fill="oklch(70% 0.15 340)"
                            radius={[0, 0, 0, 0]}
                            cursor="pointer"
                            activeBar={{
                                fill: "oklch(55% 0.15 340)",
                                stroke: "none",
                            }}
                        />
                        <Bar
                            dataKey="pointsUnearned"
                            stackId="stack"
                            fill="oklch(65% 0.02 270)"
                            radius={[8, 8, 0, 0]}
                            cursor="pointer"
                            activeBar={{
                                fill: "oklch(60% 0.02 270)",
                                stroke: "none",
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
