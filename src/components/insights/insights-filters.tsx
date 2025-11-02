import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { GraphSettings } from "@/lib/insights";

export function InsightsFilters(props: {
    settings: GraphSettings;
    setSettings: (settings: GraphSettings) => void;
}) {
    return (
        <div className="border-border bg-bg-elevated/60 rounded-lg border backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs uppercase">
                        Range
                    </span>
                    <Select
                        value={props.settings.range}
                        onValueChange={(v) =>
                            props.setSettings({
                                ...props.settings,
                                range: v as GraphSettings["range"],
                            })
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="365d">Last 365 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs uppercase">
                        Resolution
                    </span>
                    <Select
                        value={props.settings.resolution}
                        onValueChange={(v) =>
                            props.setSettings({
                                ...props.settings,
                                resolution: v as GraphSettings["resolution"],
                            })
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Resolution" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs uppercase">
                        Mode
                    </span>
                    <Select
                        value={props.settings.mode}
                        onValueChange={(v) =>
                            props.setSettings({
                                ...props.settings,
                                mode: v as GraphSettings["mode"],
                            })
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relative">Percentage</SelectItem>
                            <SelectItem value="absolute">Absolute</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
