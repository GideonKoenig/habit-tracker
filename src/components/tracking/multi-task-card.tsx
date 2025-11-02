"use client";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/tasks";

export function MultiTaskCard(props: {
    task: Task;
    value: number;
    editLayout: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
}) {
    const { task, value, editLayout, onIncrement, onDecrement } = props;
    const target = task.targetPerDay ?? 0;
    const goalReached = target > 0 && value >= target;
    return (
        <div
            className={`group relative flex h-full flex-col justify-between gap-4 rounded-lg border px-5 py-5 transition will-change-transform ${
                goalReached
                    ? "border-border/58 bg-bg-elevated/78"
                    : "border-accent-pink/52 bg-accent-pink/36"
            } ${
                editLayout
                    ? "cursor-default opacity-75"
                    : "cursor-pointer hover:-translate-y-px hover:shadow-lg"
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <span
                        className={`text-base font-semibold ${
                            goalReached ? "text-text-muted" : "text-text"
                        }`}
                    >
                        {task.label}
                    </span>
                    <span
                        className={`text-xs tracking-[0.24em] uppercase ${
                            goalReached ? "text-text-muted" : "text-text/70"
                        }`}
                    >
                        {target > 0 ? `Target ${target}` : "No target"}
                    </span>
                </div>
                <span
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[0.65rem] font-medium tracking-[0.16em] uppercase ${
                        goalReached
                            ? "text-text-muted border-border/60"
                            : "bg-accent-pink/82 text-text border-transparent"
                    }`}
                >
                    {value}
                    {target > 0 ? ` / ${target}` : ""}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={editLayout}
                    onClick={onDecrement}
                    className={`h-11 w-11 text-lg font-semibold transition ${
                        goalReached
                            ? "text-text-muted border-border/68 bg-bg-elevated/72"
                            : "bg-accent-pink/70 text-text hover:bg-accent-pink/64 border-transparent"
                    }`}
                >
                    −
                </Button>
                <div className="flex flex-col items-center gap-1 text-center">
                    <span
                        className={`text-3xl font-semibold ${
                            goalReached ? "text-text-muted" : "text-text"
                        }`}
                    >
                        {value}
                    </span>
                    <span className="text-text-muted text-xs">
                        Logged today
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={editLayout}
                    onClick={onIncrement}
                    className={`h-11 w-11 text-lg font-semibold transition ${
                        goalReached
                            ? "border-[color-mix(in_oklch,var(--border-strong)68%,transparent)]"
                            : "border-transparent bg-[color-mix(in_oklch,var(--accent-2)70%,transparent)] text-[--color-text-contrast] hover:bg-[color-mix(in_oklch,var(--accent-2)64%,transparent)]"
                    }`}
                >
                    +
                </Button>
            </div>
            <div
                className={`pointer-events-none absolute inset-0 rounded-lg transition ${
                    goalReached
                        ? "bg-transparent"
                        : "bg-accent-pink/14 opacity-0 group-hover:opacity-100"
                }`}
            />
        </div>
    );
}
