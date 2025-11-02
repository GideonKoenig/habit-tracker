"use client";
import { api } from "@/trpc/react";
import { resolveLogicalDay, formatGermanDate } from "@/lib/time";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TaskRow } from "@/components/tasks/task-row";
import { DEFAULT_CUTOFF_HOUR } from "@/lib/settings";

export function TaskList() {
    const utils = api.useUtils();
    const { data: settings } = api.settings.getSettings.useQuery();
    const { data: set } = api.taskSet.getLatestForUser.useQuery();
    const upsert = api.taskSet.upsertForDate.useMutation({
        onSuccess: async () => {
            await utils.taskSet.getLatestForUser.invalidate();
            await utils.taskSet.getForUser.invalidate();
        },
    });

    if (!set) {
        return (
            <Card className="bg-bg-elevated/60 backdrop-blur-sm">
                <CardContent className="text-text-muted p-10 text-center text-sm">
                    Start by crafting your first habit above.
                </CardContent>
            </Card>
        );
    }

    const cutoff = settings?.cutoffHour ?? DEFAULT_CUTOFF_HOUR;
    const today = resolveLogicalDay(new Date(), cutoff);

    const handleDelete = async (taskId: string) => {
        const tasks = set.tasks.filter((task) => task.id !== taskId);
        await upsert.mutateAsync({
            taskSet: {
                tasks,
                layout: set.layout,
            },
            date: today,
        });
    };

    return (
        <Card className="bg-bg-elevated/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription className="text-text-muted text-xs">
                        Active since: {formatGermanDate(set.activeFrom)}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {set.tasks.length === 0 ? (
                    <div className="text-text-muted border-border/60 bg-bg-elevated/62 rounded-xl border border-dashed p-6 text-center text-sm">
                        No tasks yet. Your first habit will appear here.
                    </div>
                ) : (
                    <div className="grid grid-cols-[1.4fr_0.9fr_0.7fr_auto] items-center gap-x-4 gap-y-3">
                        <span className="text-text-muted text-[10px] tracking-[0.2em] uppercase">
                            Name
                        </span>
                        <span className="text-text-muted text-[10px] tracking-[0.2em] uppercase">
                            Type
                        </span>
                        <span className="text-text-muted text-[10px] tracking-[0.2em] uppercase">
                            Points
                        </span>
                        <span className="text-text-muted text-right text-[10px] tracking-[0.2em] uppercase">
                            Actions
                        </span>
                        {set.tasks.map((task) => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                onDelete={() => handleDelete(task.id)}
                                disabled={upsert.isPending}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
