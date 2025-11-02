"use client";
import { useState } from "react";
import { type Layout } from "react-grid-layout";
import { api } from "@/trpc/react";
import { resolveLogicalDay, addDaysUtc } from "@/lib/time";
import { prepareLayout, layoutToPanels } from "@/lib/layout";
import { findActiveTaskSetForDate } from "@/lib/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { DateNavigator } from "@/components/tracking/date-navigator";
import { TaskTrackingGrid } from "@/components/tracking/task-tracking-grid";
import { DEFAULT_CUTOFF_HOUR } from "@/lib/settings";

export default function Home() {
    const utils = api.useUtils();
    const [offsetDays, setOffsetDays] = useState<number>(0);
    const [draftLayout, setDraftLayout] = useState<Layout[] | null>(null);
    const { data: settings, isLoading: isLoadingSettings } =
        api.settings.getSettings.useQuery();
    const { data: allTaskSets, isLoading: isLoadingTaskSets } =
        api.taskSet.getForUser.useQuery();
    const { data: allLogs, isLoading: isLoadingLogs } =
        api.dailyLog.getForUser.useQuery();

    const updateLayoutForToday = api.taskSet.updateLayoutForDate.useMutation({
        onMutate: async (variables) => {
            await utils.taskSet.getForUser.cancel();
            await utils.taskSet.getForDate.cancel({ date: variables.date });
            const previousTaskSets = utils.taskSet.getForUser.getData();
            const previousForDate = utils.taskSet.getForDate.getData({
                date: variables.date,
            });
            if (!previousTaskSets) {
                return { previousTaskSets, previousForDate };
            }
            const activeForDate = findActiveTaskSetForDate(
                previousTaskSets,
                variables.date,
            );
            if (!activeForDate) {
                return { previousTaskSets, previousForDate };
            }
            const nextTaskSets = previousTaskSets.map((entry) =>
                entry.id === activeForDate.id
                    ? { ...entry, layout: variables.layout }
                    : entry,
            );
            const updatedActive = nextTaskSets.find(
                (entry) => entry.id === activeForDate.id,
            )!;
            utils.taskSet.getForUser.setData(undefined, nextTaskSets);
            utils.taskSet.getForDate.setData(
                { date: variables.date },
                updatedActive,
            );
            return { previousTaskSets, previousForDate };
        },
        onError: (_error, variables, context) => {
            if (!context) return;
            utils.taskSet.getForUser.setData(
                undefined,
                context.previousTaskSets,
            );
            utils.taskSet.getForDate.setData(
                { date: variables.date },
                context.previousForDate,
            );
        },
        onSettled: async (_result, _error, variables) => {
            await utils.taskSet.getForUser.invalidate();
            await utils.taskSet.getForDate.invalidate({ date: variables.date });
        },
    });

    if (isLoadingSettings || isLoadingTaskSets || isLoadingLogs) {
        return (
            <div className="text-text-muted flex items-center justify-center py-20 text-sm">
                Loading…
            </div>
        );
    }

    if (!settings || !allTaskSets || !allLogs) {
        return (
            <div className="text-text-muted flex items-center justify-center py-20 text-sm">
                Failed to load data.
            </div>
        );
    }

    const cutoff = settings.cutoffHour ?? DEFAULT_CUTOFF_HOUR;
    const today = resolveLogicalDay(new Date(), cutoff);
    const currentDate = addDaysUtc(today, offsetDays);

    const activeLogEntry = allLogs.find((log) => {
        const logTime = log.date.getTime();
        const targetTime = currentDate.getTime();
        return logTime === targetTime;
    });

    const activeTaskSet = findActiveTaskSetForDate(allTaskSets, currentDate);

    if (!activeTaskSet) {
        return (
            <div className="flex flex-col gap-8">
                <DateNavigator
                    currentDate={currentDate}
                    today={today}
                    onOffsetChange={(offset) =>
                        setOffsetDays((v) => v + offset)
                    }
                />
                <Card>
                    <CardContent className="text-text-muted px-6 py-10 text-center text-sm">
                        No active task set for this day. Visit Tasks to craft
                        your flow.
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tasks = activeTaskSet.tasks;
    const originalPanels = activeTaskSet.layout.panels;
    const activeLayout = prepareLayout(tasks, originalPanels);

    const values = activeLogEntry?.data ?? {};

    return (
        <div className="flex flex-col gap-6">
            <DateNavigator
                currentDate={currentDate}
                today={today}
                onOffsetChange={(offset) => setOffsetDays((v) => v + offset)}
                draftLayout={draftLayout}
                setDraftLayout={setDraftLayout}
                activeLayout={activeLayout}
                onSaveLayout={(layout) => {
                    const panels = layoutToPanels(layout);
                    updateLayoutForToday.mutate({
                        date: currentDate,
                        layout: { panels },
                    });
                }}
            />

            <TaskTrackingGrid
                tasks={tasks}
                values={values}
                currentDate={currentDate}
                activeLayout={activeLayout}
                draftLayout={draftLayout}
                onDraftChange={(next) => {
                    setDraftLayout(next);
                }}
            />
        </div>
    );
}
