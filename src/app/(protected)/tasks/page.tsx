"use client";
import { api } from "@/trpc/react";
import { resolveLogicalDay } from "@/lib/time";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { DEFAULT_CUTOFF_HOUR } from "@/lib/settings";

export default function TasksPage() {
    const { data: settings } = api.settings.getSettings.useQuery();
    const cutoff = settings?.cutoffHour ?? DEFAULT_CUTOFF_HOUR;
    const today = resolveLogicalDay(new Date(), cutoff);

    const { data: set, isLoading: isLoadingSet } =
        api.taskSet.getLatestForUser.useQuery();

    if (isLoadingSet) {
        return (
            <div className="text-text-muted flex items-center justify-center py-20 text-sm">
                Loading…
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <TaskForm currentSet={set} today={today} />
            <div className="grid grid-cols-1 gap-6">
                <TaskList />
            </div>
        </div>
    );
}
