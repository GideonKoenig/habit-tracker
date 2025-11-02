"use client";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks";

export function MultiTaskCard(props: {
    task: Task;
    value: number;
    currentDate: Date;
    editLayout: boolean;
    values: Record<string, number>;
}) {
    const utils = api.useUtils();
    const upsertLog = api.dailyLog.upsertForDate.useMutation({
        onMutate: async (variables) => {
            await utils.dailyLog.getForUser.cancel();
            await utils.dailyLog.getForDate.cancel({ date: variables.date });
            const previousAll = utils.dailyLog.getForUser.getData();
            const previousForDate = utils.dailyLog.getForDate.getData({
                date: variables.date,
            });
            const nextAll = previousAll ? [...previousAll] : [];
            const existingIndex = nextAll.findIndex(
                (entry) => entry.date.getTime() === variables.date.getTime(),
            );
            const optimisticEntry =
                existingIndex >= 0
                    ? { ...nextAll[existingIndex]!, data: variables.data }
                    : {
                          id:
                              previousForDate?.id ??
                              previousAll?.[0]?.id ??
                              crypto.randomUUID(),
                          userId:
                              previousForDate?.userId ??
                              previousAll?.[0]?.userId ??
                              "",
                          date: variables.date,
                          data: variables.data,
                      };
            if (existingIndex >= 0) {
                nextAll[existingIndex] = optimisticEntry;
            } else {
                nextAll.push(optimisticEntry);
            }
            utils.dailyLog.getForUser.setData(undefined, nextAll);
            utils.dailyLog.getForDate.setData(
                { date: variables.date },
                optimisticEntry,
            );
            return { previousAll, previousForDate };
        },
        onError: (_error, variables, context) => {
            if (!context) return;
            utils.dailyLog.getForUser.setData(undefined, context.previousAll);
            utils.dailyLog.getForDate.setData(
                { date: variables.date },
                context.previousForDate ?? undefined,
            );
        },
        onSettled: async (_result, _error, variables) => {
            await utils.dailyLog.getForUser.invalidate();
            await utils.dailyLog.getForDate.invalidate({
                date: variables.date,
            });
        },
    });

    const weekday = (props.currentDate.getUTCDay() + 6) % 7;
    const scheduledToday = props.task.activeWeekdays[weekday];
    const isDisabled = props.editLayout || !scheduledToday;
    const target = props.task.targetPerDay ?? 0;
    const goalReached = target > 0 && props.value >= target;

    const statusText = props.editLayout
        ? "Layout locked"
        : !scheduledToday
          ? "Not scheduled today"
          : goalReached
            ? "Target reached"
            : target > 0
              ? "Keep going"
              : "Track freely";

    const handleIncrement = () => {
        const nextValue = props.value + 1;
        const nextLog = {
            ...props.values,
            [props.task.id]: nextValue,
        };
        upsertLog.mutate({
            date: props.currentDate,
            data: nextLog,
        });
    };

    const handleDecrement = () => {
        const nextValue = Math.max(0, props.value - 1);
        const nextLog = {
            ...props.values,
            [props.task.id]: nextValue,
        };
        upsertLog.mutate({
            date: props.currentDate,
            data: nextLog,
        });
    };

    return (
        <div
            className={cn(
                "grid h-full w-full grid-cols-[1fr_auto] gap-2 rounded-2xl border-2 px-6 py-6",
                goalReached && "border-border bg-bg-elevated",
                !goalReached && "border-accent-pink/70 bg-accent-pink/25",
                isDisabled && "cursor-default opacity-60",
                !isDisabled && "hover:scale-[1.01]",
                props.editLayout && "rounded-br-none",
            )}
        >
            <span
                className={cn(
                    "text-lg font-semibold tracking-tight",
                    goalReached && "text-text-muted",
                    !goalReached && "text-text",
                )}
            >
                {props.task.label}
            </span>
            <span
                className={cn(
                    "flex items-center rounded-full px-4 py-1 text-xs font-semibold tracking-widest",
                    goalReached && "border-border text-text-muted border",
                    !goalReached && "bg-text text-bg border border-transparent",
                )}
            >
                {target > 0 ? `${props.value} / ${target}` : props.value}
            </span>

            <div className="col-span-2 flex h-full min-h-0 gap-2">
                <button
                    type="button"
                    aria-label="Decrease count"
                    disabled={isDisabled}
                    onClick={handleDecrement}
                    className={cn(
                        "flex flex-1 items-center justify-center rounded-xl border-2 px-5 text-3xl leading-none font-semibold",
                        goalReached &&
                            "border-accent-pink/60 bg-accent-pink/35 text-text",
                        !goalReached &&
                            "border-accent-pink/80 bg-accent-pink/80 text-text",
                        isDisabled && "cursor-default opacity-50",
                        !isDisabled && "cursor-pointer hover:scale-[1.01]",
                    )}
                >
                    −
                </button>
                <div
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border px-5 py-4 text-center",
                        goalReached && "border-border bg-bg-elevated",
                        !goalReached && "border-border/60 bg-bg-elevated/70",
                    )}
                >
                    <span
                        className={cn(
                            "text-xs font-semibold tracking-widest uppercase",
                            (goalReached || isDisabled) && "text-text-muted",
                            !goalReached && !isDisabled && "text-text/70",
                        )}
                        title={statusText}
                    >
                        {statusText}
                    </span>
                    <span
                        className={cn(
                            "text-3xl font-semibold",
                            goalReached && "text-text-muted",
                            !goalReached && "text-text",
                        )}
                    >
                        {props.value}
                    </span>
                    <span className="text-text-muted text-xs tracking-widest uppercase">
                        Logged today
                    </span>
                </div>
                <button
                    type="button"
                    aria-label="Increase count"
                    disabled={isDisabled}
                    onClick={handleIncrement}
                    className={cn(
                        "flex flex-1 items-center justify-center rounded-xl border-2 px-5 text-3xl leading-none font-semibold",
                        goalReached &&
                            "border-accent-pink/60 bg-accent-pink/35 text-text",
                        !goalReached &&
                            "border-accent-pink/80 bg-accent-pink/80 text-text",
                        isDisabled && "cursor-default opacity-50",
                        !isDisabled && "cursor-pointer hover:scale-[1.01]",
                    )}
                >
                    +
                </button>
            </div>
        </div>
    );
}
