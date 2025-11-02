"use client";
import { useState } from "react";
import { type Layout } from "react-grid-layout";
import { api } from "@/trpc/react";
import { resolveLogicalDay } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { DateNavigator } from "@/components/tracking/date-navigator";
import { TaskGrid } from "@/components/tracking/task-grid";
import { SingleTaskCard } from "@/components/tracking/single-task-card";
import { MultiTaskCard } from "@/components/tracking/multi-task-card";
import { DEFAULT_CUTOFF_HOUR } from "@/lib/settings";
import type { Task, TaskLayoutPanel } from "@/lib/tasks";

export default function Home() {
    const { data: settings } = api.settings.getSettings.useQuery();
    const cutoff = settings?.cutoffHour ?? DEFAULT_CUTOFF_HOUR;
    const baseToday = resolveLogicalDay(new Date(), cutoff);
    const [offsetDays, setOffsetDays] = useState<number>(0);
    const dayId = (() => {
        const d = new Date(baseToday);
        d.setDate(d.getDate() + offsetDays);
        return d;
    })();

    const { data: setForDay } = api.taskSet.getForDate.useQuery({
        date: dayId,
    });
    const { data: logForDay, refetch: refetchLog } =
        api.dailyLog.getForDate.useQuery({ date: dayId });

    const utils = api.useUtils();
    const upsertLog = api.dailyLog.upsertForDate.useMutation({
        onSuccess: async () => {
            await utils.dailyLog.getForDate.invalidate({ date: dayId });
        },
    });

    const updateLayoutForToday = api.taskSet.updateLayoutForDate.useMutation({
        onSuccess: async () => {
            await utils.taskSet.getForDate.invalidate({ date: dayId });
        },
    });

    const weekdayDay = dayId.getDay();
    const weekday = weekdayDay === 0 ? 6 : weekdayDay - 1;
    const tasks = (setForDay?.tasks ?? []).filter(
        (t: Task) => t.activeWeekdays?.[weekday] === true,
    );

    const [editLayout, setEditLayout] = useState(false);
    const originalPanels = setForDay?.layout.panels ?? [];
    const initialLayout: Layout[] = tasks.map((task: Task, index: number) => {
        const saved = originalPanels.find(
            (p: TaskLayoutPanel) => p.taskId === task.id,
        );
        if (saved)
            return {
                i: saved.taskId,
                x: saved.x,
                y: saved.y,
                w: saved.w,
                h: saved.h,
            };
        const column = (index % 2) * 6;
        const row = Math.floor(index / 2) * 4;
        return {
            i: task.id,
            x: column,
            y: row,
            w: 6,
            h: 4,
        };
    });
    const [draftLayout, setDraftLayout] = useState<Layout[] | null>(null);

    const values = logForDay?.data ?? {};

    const handleSaveLayout = () => {
        const panels = (draftLayout ?? initialLayout).map(
            (l: { i: string; x: number; y: number; w: number; h: number }) => ({
                taskId: l.i,
                x: l.x,
                y: l.y,
                w: l.w,
                h: l.h,
            }),
        );
        updateLayoutForToday.mutate({
            layout: { panels },
            date: dayId,
        });
        setDraftLayout(null);
        setEditLayout(false);
    };

    const handleCancelLayout = () => {
        setDraftLayout(null);
        setEditLayout(false);
    };

    return (
        <div className="flex flex-col gap-8">
            <DateNavigator
                dayId={dayId}
                onOffsetChange={(offset) => setOffsetDays((v) => v + offset)}
                editLayout={editLayout}
                onEditLayoutChange={setEditLayout}
                onSaveLayout={handleSaveLayout}
                onCancelLayout={handleCancelLayout}
            />

            {!setForDay ? (
                <Card>
                    <CardContent className="text-text-muted px-6 py-10 text-center text-sm">
                        No active task set for this day. Visit Tasks to craft
                        your flow.
                    </CardContent>
                </Card>
            ) : (
                <TaskGrid
                    layoutItems={draftLayout ?? initialLayout}
                    isEditing={editLayout}
                    onDraftChange={(next) => setDraftLayout(next)}
                >
                    {tasks.map((t: Task) => {
                        const value = values[t.id] ?? 0;
                        return (
                            <div key={t.id} className="h-full">
                                {t.type === "single" ? (
                                    <SingleTaskCard
                                        task={t}
                                        value={value}
                                        editLayout={editLayout}
                                        onToggle={async () => {
                                            const next = value === 1 ? 0 : 1;
                                            const optimistic = {
                                                ...values,
                                                [t.id]: next,
                                            };
                                            await upsertLog.mutateAsync({
                                                date: dayId,
                                                data: optimistic,
                                            });
                                            await refetchLog();
                                        }}
                                    />
                                ) : (
                                    <MultiTaskCard
                                        task={t}
                                        value={value}
                                        editLayout={editLayout}
                                        onIncrement={async () => {
                                            const cur = value;
                                            const next = cur + 1;
                                            const optimistic = {
                                                ...values,
                                                [t.id]: next,
                                            };
                                            await upsertLog.mutateAsync({
                                                date: dayId,
                                                data: optimistic,
                                            });
                                            await refetchLog();
                                        }}
                                        onDecrement={async () => {
                                            const cur = value;
                                            const next = Math.max(0, cur - 1);
                                            const optimistic = {
                                                ...values,
                                                [t.id]: next,
                                            };
                                            await upsertLog.mutateAsync({
                                                date: dayId,
                                                data: optimistic,
                                            });
                                            await refetchLog();
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </TaskGrid>
            )}
        </div>
    );
}
