import { z } from "zod";
import type { RouterOutputs } from "@/trpc/react";

export const taskTypeSchema = z.enum(["single", "multi"]);

export const taskSchema = z.object({
    id: z.string().uuid(),
    label: z.string().min(1),
    type: taskTypeSchema,
    pointsPerUnit: z.number(),
    targetPerDay: z.number().int().positive().optional(),
    activeWeekdays: z.array(z.boolean()).length(7),
    displayColor: z.string().optional(),
    displayIcon: z.string().optional(),
});

export const panelSchema = z.object({
    taskId: z.string(),
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    w: z.number().int().min(1),
    h: z.number().int().min(1),
});

export const taskLayoutSchema = z.object({
    panels: z.array(panelSchema),
});

export const taskSetSchema = z.object({
    tasks: z.array(taskSchema),
    layout: taskLayoutSchema,
});

export type Task = z.infer<typeof taskSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskSet = z.infer<typeof taskSetSchema>;
export type TaskLayout = z.infer<typeof taskLayoutSchema>;
export type TaskLayoutPanel = z.infer<typeof panelSchema>;

export type TaskSetEntry = RouterOutputs["taskSet"]["getForUser"][number];

export const DEFAULT_TASK_LAYOUT: TaskLayout = { panels: [] };

export function findActiveTaskSetForDate<T extends { activeFrom: Date; activeTo: Date | null }>(
    taskSets: T[],
    date: Date,
) {
    return taskSets.find((taskSet) => {
        const fromTime = taskSet.activeFrom.getTime();
        const toTime = taskSet.activeTo?.getTime();
        const targetTime = date.getTime();
        return targetTime >= fromTime && (toTime === undefined || targetTime <= toTime);
    });
}
