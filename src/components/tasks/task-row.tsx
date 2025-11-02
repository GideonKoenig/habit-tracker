"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Task } from "@/lib/tasks";

export function TaskRow(props: {
    task: Task;
    onDelete: () => void;
    disabled?: boolean;
}) {
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
            <div className="flex justify-end">
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
