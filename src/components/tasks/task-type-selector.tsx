"use client";
import { cn } from "@/lib/utils";
import type { TaskType } from "@/lib/tasks";

export function TaskTypeSelector(props: { value: TaskType; onChange: (value: TaskType) => void; disabled?: boolean }) {
    return (
        <div className="border-border/80 flex w-full overflow-hidden rounded-md border">
            {(["single", "multi"] as const).map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => props.onChange(type)}
                    disabled={props.disabled}
                    className={cn(
                        "flex-1 px-3 py-2 text-xs uppercase transition",
                        props.value === type ? "text-text bg-accent-pink/52" : "text-text-muted hover:text-text",
                        props.disabled && "opacity-50",
                    )}
                >
                    {type === "single" ? "Single" : "Multi"}
                </button>
            ))}
        </div>
    );
}
