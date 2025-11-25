"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { TaskRowEdit } from "@/components/tasks/task-row-edit";

export function TaskRow(props: {
    task: Task;
    onDelete: () => void;
    onEdit: (task: Task) => Promise<void>;
    disabled?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <TaskRowEdit
                key={props.task.id}
                task={props.task}
                onSave={async (task: Task) => {
                    await props.onEdit(task);
                    setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
                disabled={props.disabled}
            />
        );
    }

    return (
        <div className="contents">
            <span className="text-text text-sm font-medium">
                {props.task.label}
            </span>
            <span className="text-text text-xs uppercase">
                {props.task.type === "single"
                    ? "Single"
                    : `Multi (${props.task.targetPerDay ?? 0})`}
            </span>
            <span className="text-text text-sm">
                {props.task.pointsPerUnit ?? 1}
            </span>
            <div className="flex justify-end gap-1">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={props.disabled}
                    onClick={() => setIsEditing(true)}
                >
                    <Pencil className="size-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    disabled={props.disabled}
                    onClick={props.onDelete}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}
