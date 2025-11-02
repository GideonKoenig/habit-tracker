"use client";
import { type Layout } from "react-grid-layout";
import { TaskGrid } from "@/components/tracking/task-grid";
import { SingleTaskCard } from "@/components/tracking/single-task-card";
import { MultiTaskCard } from "@/components/tracking/multi-task-card";
import type { Task } from "@/lib/tasks";

export function TaskTrackingGrid(props: {
    tasks: Task[];
    values: Record<string, number>;
    currentDate: Date;
    activeLayout: Layout[];
    draftLayout: Layout[] | null;
    onDraftChange: (layout: Layout[] | null) => void;
}) {
    const editLayout = props.draftLayout !== null;

    return (
        <TaskGrid
            layoutItems={props.draftLayout ?? props.activeLayout}
            isEditing={editLayout}
            onDraftChange={props.onDraftChange}
        >
            {props.tasks.map((task) => {
                const value = props.values[task.id] ?? 0;
                return (
                    <div key={task.id} className="h-full">
                        {task.type === "single" ? (
                            <SingleTaskCard
                                task={task}
                                value={value}
                                currentDate={props.currentDate}
                                editLayout={editLayout}
                                values={props.values}
                            />
                        ) : (
                            <MultiTaskCard
                                task={task}
                                value={value}
                                currentDate={props.currentDate}
                                editLayout={editLayout}
                                values={props.values}
                            />
                        )}
                    </div>
                );
            })}
        </TaskGrid>
    );
}
