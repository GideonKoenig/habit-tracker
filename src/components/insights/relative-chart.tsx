import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatGermanDate, formatGermanDateShort } from "@/lib/time";
import type { InsightDataPoint } from "@/lib/insights";
import { InsightsTooltip } from "@/components/insights/insights-tooltip";

export function RelativeChart(props: {
    data: InsightDataPoint[];
    endDayId: Date;
}) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-1">
                <CardTitle>Trend</CardTitle>
                <CardDescription>
                    Percentage · End {formatGermanDate(props.endDayId)}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-96 px-3 py-3">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={props.data}
                        margin={{
                            top: 8,
                            bottom: 8,
                            left: 0,
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
                            tickFormatter={(value: string) =>
                                formatGermanDateShort(new Date(value))
                            }
                        />
                        <YAxis
                            domain={[0, 100]}
                            stroke="oklch(68% 0.01 270)"
                            tickFormatter={(v) => `${v}%`}
                            tick={{
                                fontSize: 11,
                                fill: "oklch(68% 0.01 270)",
                            }}
                            tickLine={false}
                            axisLine={{
                                stroke: "oklch(25% 0.01 270 / 0.5)",
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={(tooltipProps) => (
                                <InsightsTooltip
                                    {...tooltipProps}
                                    mode="relative"
                                />
                            )}
                        />
                        <Bar
                            dataKey="percentage"
                            fill="oklch(70% 0.15 340)"
                            radius={[8, 8, 0, 0]}
                            cursor="pointer"
                            activeBar={{
                                fill: "oklch(55% 0.15 340)",
                                stroke: "none",
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
