"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import type { Task, TaskSet } from "@/lib/tasks";
import { taskSchema, DEFAULT_TASK_LAYOUT } from "@/lib/tasks";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TaskTypeSelector } from "@/components/tasks/task-type-selector";
import { WeekdaySelector } from "@/components/tasks/weekday-selector";

export function TaskForm(props: {
    currentSet: TaskSet | undefined;
    today: Date;
}) {
    const [newTask, setNewTask] = useState<Partial<Task>>({
        id: crypto.randomUUID(),
        label: "",
        type: "single",
        pointsPerUnit: 10,
        activeWeekdays: [true, true, true, true, true, false, false],
    });

    const utils = api.useUtils();
    const upsert = api.taskSet.upsertForDate.useMutation({
        onSuccess: async () => {
            await utils.taskSet.getLatestForUser.invalidate();
            await utils.taskSet.getForDate.invalidate({ date: props.today });
        },
    });

    const handleSubmit = async () => {
        const taskResult = taskSchema.safeParse(newTask);
        if (!taskResult.success) return;

        const tasks = [...(props.currentSet?.tasks ?? []), taskResult.data];
        await upsert.mutateAsync({
            taskSet: {
                tasks,
                layout: props.currentSet?.layout ?? DEFAULT_TASK_LAYOUT,
            },
            date: props.today,
        });
        setNewTask({
            id: crypto.randomUUID(),
            label: "",
            type: "single",
            pointsPerUnit: 10,
            activeWeekdays: [true, true, true, true, true, false, false],
        });
    };

    return (
        <Card className="bg-bg-elevated/60 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-1">
                <CardTitle>Create Habit</CardTitle>
                <CardDescription className="text-text-muted text-xs">
                    Provide a name, choose the type, and pick active days.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_10rem_7rem_7rem] md:gap-x-3 md:gap-y-5">
                <Input
                    placeholder="Name"
                    value={newTask.label}
                    onChange={(event) =>
                        setNewTask({ ...newTask, label: event.target.value })
                    }
                    disabled={upsert.isPending}
                />
                <TaskTypeSelector
                    value={newTask.type ?? "single"}
                    onChange={(type) => setNewTask({ ...newTask, type })}
                    disabled={upsert.isPending}
                />
                <Input
                    type="number"
                    className="w-full text-center [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={newTask.pointsPerUnit}
                    onChange={(e) =>
                        setNewTask({
                            ...newTask,
                            pointsPerUnit: Number(e.target.value),
                        })
                    }
                    disabled={upsert.isPending}
                />
                <Input
                    type="number"
                    placeholder="Target"
                    className="w-full [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={newTask.type === "multi" ? newTask.targetPerDay : ""}
                    onChange={(e) =>
                        setNewTask({
                            ...newTask,
                            targetPerDay:
                                e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                        })
                    }
                    disabled={newTask.type !== "multi" || upsert.isPending}
                />
                <div className="md:col-span-3">
                    <WeekdaySelector
                        weekdays={newTask.activeWeekdays!}
                        onChange={(weekdays) =>
                            setNewTask({ ...newTask, activeWeekdays: weekdays })
                        }
                        disabled={upsert.isPending}
                    />
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!newTask.label?.trim() || upsert.isPending}
                    className="w-full"
                >
                    {upsert.isPending && (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Adding…
                        </>
                    )}
                    {!upsert.isPending && "Add Habit"}
                </Button>
            </CardContent>
        </Card>
    );
}
