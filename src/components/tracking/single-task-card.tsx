"use client";
import type { Task } from "@/lib/tasks";

export function SingleTaskCard(props: {
    task: Task;
    value: number;
    editLayout: boolean;
    onToggle: () => void;
}) {
    const { task, value, editLayout, onToggle } = props;
    const completed = value === 1;
    return (
        <button
            type="button"
            disabled={editLayout}
            onClick={onToggle}
            className={`group relative flex h-full w-full items-center justify-between gap-4 rounded-lg border px-5 py-6 transition will-change-transform ${
                completed
                    ? "border-border/58 bg-bg-elevated/78"
                    : "border-accent-pink/55 bg-accent-pink/42"
            } ${
                editLayout
                    ? "cursor-default opacity-75"
                    : "cursor-pointer hover:-translate-y-px hover:shadow-lg"
            }`}
        >
            <div className="flex flex-col items-start gap-1 text-left">
                <span
                    className={`text-base font-semibold ${
                        completed ? "text-text-muted" : "text-text"
                    }`}
                >
                    {task.label}
                </span>
                <span
                    className={`text-xs tracking-[0.24em] uppercase ${
                        completed ? "text-text-muted" : "text-text/75"
                    }`}
                >
                    {completed ? "Completed" : "Tap to complete"}
                </span>
            </div>
            <span
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg font-semibold transition ${
                    completed
                        ? "text-text-muted border-border/60 bg-bg-elevated/72"
                        : "bg-accent-pink/85 text-text group-hover:bg-accent-pink/75 border-transparent"
                }`}
            >
                {completed ? "✓" : ""}
            </span>
            <div
                className={`pointer-events-none absolute inset-0 rounded-lg transition ${
                    completed
                        ? "bg-transparent"
                        : "bg-accent-pink/16 opacity-0 group-hover:opacity-100"
                }`}
            />
        </button>
    );
}
