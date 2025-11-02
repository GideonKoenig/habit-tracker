"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { type GraphSettings } from "@/lib/insights";
import { InsightsFilters } from "@/components/insights/insights-filters";
import { InsightsChart } from "@/components/insights/insights-chart";

export default function InsightsPage() {
    const [graphSettings, setGraphSettings] = useState<GraphSettings>({
        range: "7d",
        resolution: "daily",
        mode: "relative",
    });

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

    return (
        <div className="flex flex-col gap-6">
            <InsightsFilters
                settings={graphSettings}
                setSettings={setGraphSettings}
            />
            <InsightsChart
                settings={graphSettings}
                cutoffHour={settings.cutoffHour ?? 3}
            />
        </div>
    );
}
