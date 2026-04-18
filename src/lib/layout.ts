import { type Layout } from "react-grid-layout";
import type { Task, TaskLayoutPanel } from "@/lib/tasks";

export function panelsToLayout(panels: TaskLayoutPanel[]): Layout[] {
    return panels.map((panel) => ({
        i: panel.taskId,
        x: panel.x,
        y: panel.y,
        w: panel.w,
        h: panel.h,
        resizeHandles: ["se"] as const,
    }));
}

export function layoutToPanels(layout: Layout[]): TaskLayoutPanel[] {
    return layout.map((item) => ({
        taskId: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
    }));
}

export function generateDefaultLayout(tasks: Task[], startRow = 0) {
    return tasks.map((task, index) => {
        const column = (index % 2) * 6;
        const row = startRow + Math.floor(index / 2) * 4;
        return {
            i: task.id,
            x: column,
            y: row,
            w: 5,
            h: 4,
            resizeHandles: ["se"] as const,
        } as Layout;
    });
}

export function prepareLayout(tasks: Task[], savedPanels: TaskLayoutPanel[]) {
    const savedLayouts = new Map<string, Layout>();
    for (const panel of savedPanels) {
        savedLayouts.set(panel.taskId, {
            i: panel.taskId,
            x: panel.x,
            y: panel.y,
            w: panel.w,
            h: panel.h,
            resizeHandles: ["se"] as const,
        });
    }

    const tasksWithoutLayout = tasks.filter((task) => !savedLayouts.has(task.id));

    let startRow = 0;
    if (savedLayouts.size > 0) {
        const maxBottom = Math.max(...Array.from(savedLayouts.values()).map((layout) => layout.y + layout.h));
        startRow = maxBottom;
    }

    const newLayouts = generateDefaultLayout(tasksWithoutLayout, startRow);
    const newLayoutsMap = new Map(newLayouts.map((layout) => [layout.i, layout]));

    return tasks.map((task): Layout => {
        const saved = savedLayouts.get(task.id);
        if (saved) {
            return saved;
        }
        return newLayoutsMap.get(task.id)!;
    });
}
