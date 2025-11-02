import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { resolveLogicalDay, formatGermanDate } from "@/lib/time";
import { calculateInsights, type GraphSettings } from "@/lib/insights";
import { RelativeChart } from "@/components/insights/relative-chart";
import { AbsoluteChart } from "@/components/insights/absolute-chart";

export function InsightsChart(props: {
    settings: GraphSettings;
    cutoffHour: number;
}) {
    const { data: taskSets, isLoading: isLoadingTaskSets } =
        api.taskSet.getForUser.useQuery();
    const { data: dailyLogs, isLoading: isLoadingLogs } =
        api.dailyLog.getForUser.useQuery();

    const isLoading = isLoadingTaskSets || isLoadingLogs;
    const endDayId = resolveLogicalDay(new Date(), props.cutoffHour);

    const insightsData =
        taskSets && dailyLogs
            ? calculateInsights(
                  endDayId,
                  props.settings.range,
                  props.settings.resolution,
                  taskSets,
                  dailyLogs,
              )
            : [];

    if (isLoading) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-1">
                    <CardTitle>Trend</CardTitle>
                    <CardDescription>
                        {props.settings.mode === "relative"
                            ? "Percentage"
                            : "Absolute"}{" "}
                        · End {formatGermanDate(endDayId)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-96 px-3 py-3">
                    <div className="text-text-muted flex h-full items-center justify-center text-sm">
                        Loading…
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!insightsData || insightsData.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-1">
                    <CardTitle>Trend</CardTitle>
                    <CardDescription>
                        {props.settings.mode === "relative"
                            ? "Percentage"
                            : "Absolute"}{" "}
                        · End {formatGermanDate(endDayId)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-96 px-3 py-3">
                    <div className="text-text-muted flex h-full items-center justify-center text-sm">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return props.settings.mode === "relative" ? (
        <RelativeChart data={insightsData} endDayId={endDayId} />
    ) : (
        <AbsoluteChart data={insightsData} endDayId={endDayId} />
    );
}
