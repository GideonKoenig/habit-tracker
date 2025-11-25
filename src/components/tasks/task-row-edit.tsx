"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { taskSchema } from "@/lib/tasks";

export function TaskRowEdit(props: {
    task: Task;
    onSave: (task: Task) => Promise<void>;
    onCancel: () => void;
    disabled?: boolean;
}) {
    const [labelValue, setLabelValue] = useState<string | undefined>(
        props.task.label,
    );
    const [pointsValue, setPointsValue] = useState<number | undefined>(
        props.task.pointsPerUnit,
    );
    const [targetValue, setTargetValue] = useState<number | undefined>(
        props.task.targetPerDay,
    );

    const handleSave = async () => {
        const trimmedLabel = labelValue?.trim();
        if (!trimmedLabel) return;

        const pointsNum = Number(pointsValue);
        if (isNaN(pointsNum) || pointsNum <= 0) return;

        const targetNum = Number(targetValue);
        if (props.task.type === "multi" && (isNaN(targetNum) || targetNum <= 0))
            return;

        const taskToSave: Partial<Task> = {
            ...props.task,
            label: trimmedLabel,
            pointsPerUnit: pointsNum,
            targetPerDay: props.task.type === "multi" ? targetNum : undefined,
        };

        const result = taskSchema.safeParse(taskToSave);
        if (result.success) await props.onSave(result.data);
    };

    const handleCancel = () => {
        props.onCancel();
    };

    return (
        <div className="contents">
            <Input
                value={labelValue ?? ""}
                onChange={(e) => setLabelValue(e.target.value || undefined)}
                placeholder="Name"
                className="-ml-2.5 h-8 text-sm"
                disabled={props.disabled}
            />
            {props.task.type === "multi" ? (
                <Input
                    type="number"
                    placeholder="Target"
                    value={targetValue ?? ""}
                    onChange={(e) => {
                        const value =
                            e.target.value !== ""
                                ? Number(e.target.value)
                                : undefined;
                        setTargetValue(value);
                    }}
                    className="-ml-2.5 h-8 text-xs [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    disabled={props.disabled}
                />
            ) : (
                <span className="text-text text-xs uppercase">Single</span>
            )}
            <Input
                type="number"
                placeholder="Points"
                value={pointsValue ?? ""}
                onChange={(e) => {
                    const value =
                        e.target.value !== ""
                            ? Number(e.target.value)
                            : undefined;
                    setPointsValue(value);
                }}
                className="-ml-2.5 h-8 text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                disabled={props.disabled}
            />
            <div className="flex justify-end gap-1">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={props.disabled}
                    onClick={handleSave}
                >
                    <Check className="size-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    disabled={props.disabled}
                    onClick={handleCancel}
                >
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
