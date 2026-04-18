import { formatGermanDate, getWeekdayFull } from "@/lib/time";
import type { InsightDataPoint, GraphSettings } from "@/lib/insights";

export function InsightsTooltip(props: {
    active?: boolean;
    payload?: Array<{ payload?: InsightDataPoint }>;
    label?: string;
    mode: GraphSettings["mode"];
}) {
    const payload = props.payload?.[0]?.payload;
    if (!props.active || !payload) return null;

    const date = new Date(props.label!);
    const weekday = getWeekdayFull(date);

    return (
        <div className="border-border bg-bg-elevated rounded-xl border p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <div className="text-text text-sm font-semibold">{formatGermanDate(date)}</div>
                    <div className="text-text-muted text-sm">{weekday}</div>
                </div>
                <span className="bg-accent-pink/20 text-accent-pink shrink-0 rounded-full px-3 py-1 text-sm font-semibold">
                    {payload.percentage.toFixed(0)}%
                </span>
            </div>
            <div className="text-text-muted text-sm">{`${payload.pointsEarned} / ${payload.totalPossiblePoints}`}</div>
        </div>
    );
}
