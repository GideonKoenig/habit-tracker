import { z } from "zod";

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

export const DEFAULT_TASK_LAYOUT: TaskLayout = { panels: [] };
