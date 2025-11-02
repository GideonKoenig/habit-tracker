"use client";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks";

export function SingleTaskCard(props: {
    task: Task;
    value: number;
    currentDate: Date;
    editLayout: boolean;
    values: Record<string, number>;
}) {
    const utils = api.useUtils();
    const upsertLog = api.dailyLog.upsertForDate.useMutation({
        onSuccess: async () => {
            await utils.dailyLog.getForUser.invalidate();
        },
    });

    const weekday = (props.currentDate.getUTCDay() + 6) % 7;
    const scheduledToday = props.task.activeWeekdays[weekday];
    const completed = props.value === 1;
    const isDisabled = props.editLayout || !scheduledToday;

    const statusText = props.editLayout
        ? "Layout locked"
        : !scheduledToday
          ? "Not scheduled today"
          : completed
            ? "Completed today"
            : "Tap to complete";

    const handleToggle = async () => {
        const nextValue = props.value === 1 ? 0 : 1;
        const nextLog = {
            ...props.values,
            [props.task.id]: nextValue,
        };
        await upsertLog.mutateAsync({
            date: props.currentDate,
            data: nextLog,
        });
    };

    const cardClasses = cn(
        "h-full w-full rounded-2xl border-2 px-6 py-5 flex items-center justify-center",
        completed && "border-border bg-bg-elevated",
        !completed && "border-accent-pink/70 bg-accent-pink/25",
        isDisabled && "cursor-default opacity-60",
        !isDisabled &&
            "cursor-pointer hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        props.editLayout && "rounded-br-none",
    );

    const content = (
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3">
            <span
                className={cn(
                    "text-left text-lg font-semibold tracking-tight",
                    completed ? "text-text-muted" : "text-text",
                )}
            >
                {props.task.label}
            </span>

            <span
                aria-hidden
                className={cn(
                    "row-span-2 flex size-12 items-center justify-center rounded-full border-2 text-2xl font-semibold",
                    completed
                        ? "border-accent-pink/60 bg-accent-pink/25 text-text"
                        : "border-accent-pink/90 bg-accent-pink/90 text-text",
                )}
            >
                {completed ? "✓" : ""}
            </span>

            <span
                className={cn(
                    "text-left text-xs tracking-widest uppercase",
                    completed || isDisabled
                        ? "text-text-muted"
                        : "text-text/75",
                )}
            >
                {statusText}
            </span>
        </div>
    );

    if (props.editLayout) {
        return <div className={cardClasses}>{content}</div>;
    }

    return (
        <button
            type="button"
            disabled={isDisabled}
            onClick={handleToggle}
            aria-pressed={completed}
            className={cardClasses}
        >
            {content}
        </button>
    );
}
