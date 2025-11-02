"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import {
    resolveLogicalDay,
    formatGermanDate,
    formatGermanDateShort,
} from "@/lib/time";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Range = "7d" | "30d" | "365d";
type Resolution = "daily" | "weekly";

export default function InsightsPage() {
    const [range, setRange] = useState<Range>("30d");
    const [resolution, setResolution] = useState<Resolution>("daily");
    const [mode, setMode] = useState<"relative" | "absolute">("relative");
    const { data: settings, isLoading: isLoadingSettings } =
        api.settings.getSettings.useQuery();

    if (isLoadingSettings) {
        return (
            <div className="text-text-muted flex items-center justify-center py-20 text-sm">
                Loading…
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-text-muted flex items-center justify-center py-20 text-sm">
                Failed to load settings.
            </div>
        );
    }

    const cutoff = settings.cutoffHour ?? 3;
    const endDayId = resolveLogicalDay(new Date(), cutoff);
    const { data, isLoading } = api.analytics.getRangeSummary.useQuery({
        range,
        resolution,
        endDayId,
    });

    return (
        <div className="flex flex-col gap-8">
            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <Card>
                    <CardHeader className="flex flex-col gap-1">
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>
                            Zeitspanne, Auflösung und Darstellung wählen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-text-muted text-xs uppercase">
                                Zeitraum
                            </span>
                            <Select
                                value={range}
                                onValueChange={(v) => setRange(v as Range)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Zeitraum" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">
                                        Letzte 7 Tage
                                    </SelectItem>
                                    <SelectItem value="30d">
                                        Letzte 30 Tage
                                    </SelectItem>
                                    <SelectItem value="365d">
                                        Letzte 365 Tage
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-text-muted text-xs uppercase">
                                Auflösung
                            </span>
                            <Select
                                value={resolution}
                                onValueChange={(v) =>
                                    setResolution(v as Resolution)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Auflösung" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">
                                        Täglich
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                        Wöchentlich
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-text-muted text-xs uppercase">
                                Modus
                            </span>
                            <Select
                                value={mode}
                                onValueChange={(v) =>
                                    setMode(v as "relative" | "absolute")
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Modus" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relative">
                                        Prozent
                                    </SelectItem>
                                    <SelectItem value="absolute">
                                        Absolut
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-col gap-1">
                        <CardTitle>Trend</CardTitle>
                        <CardDescription>
                            {mode === "relative" ? "Prozentual" : "Absolut"} ·
                            Ende {formatGermanDate(endDayId)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[360px] px-3 py-3">
                        {isLoading || !data ? (
                            <div className="text-text-muted flex h-full items-center justify-center text-sm">
                                Lädt…
                            </div>
                        ) : mode === "relative" ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data}
                                    margin={{
                                        top: 8,
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                    }}
                                >
                                    <XAxis
                                        dataKey="bucket"
                                        stroke="var(--ink-3)"
                                        tickLine={false}
                                        axisLine={{
                                            stroke: "color-mix(in oklch, var(--border-ghost) 50%, transparent)",
                                        }}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value: string) =>
                                            formatGermanDateShort(
                                                new Date(value),
                                            )
                                        }
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        stroke="var(--ink-3)"
                                        tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{
                                            stroke: "color-mix(in oklch, var(--border-ghost) 50%, transparent)",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "color-mix(in oklch, var(--surface-2) 90%, transparent)",
                                            border: "1px solid color-mix(in oklch, var(--border-strong) 60%, transparent)",
                                            borderRadius: "8px",
                                            color: "var(--color-text)",
                                            fontSize: "0.75rem",
                                        }}
                                        formatter={(value: number, name) =>
                                            name === "percentage"
                                                ? `${value.toFixed(0)}%`
                                                : value
                                        }
                                        labelFormatter={(value: string) =>
                                            formatGermanDate(new Date(value))
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke="var(--accent-2)"
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                            stroke: "var(--ink-1)",
                                            strokeWidth: 2,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{
                                        top: 8,
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                    }}
                                >
                                    <XAxis
                                        dataKey="bucket"
                                        stroke="var(--ink-3)"
                                        tickLine={false}
                                        axisLine={{
                                            stroke: "color-mix(in oklch, var(--border-ghost) 50%, transparent)",
                                        }}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value: string) =>
                                            formatGermanDateShort(
                                                new Date(value),
                                            )
                                        }
                                    />
                                    <YAxis
                                        stroke="var(--ink-3)"
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{
                                            stroke: "color-mix(in oklch, var(--border-ghost) 50%, transparent)",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "color-mix(in oklch, var(--surface-2) 90%, transparent)",
                                            border: "1px solid color-mix(in oklch, var(--border-strong) 60%, transparent)",
                                            borderRadius: "8px",
                                            color: "var(--color-text)",
                                            fontSize: "0.75rem",
                                        }}
                                        labelFormatter={(value: string) =>
                                            formatGermanDate(new Date(value))
                                        }
                                    />
                                    <Bar
                                        dataKey="total_possible_points"
                                        fill="color-mix(in oklch, var(--ink-4) 14%, transparent)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="points_earned"
                                        fill="var(--accent-2)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
