"use client";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks";
import { getWeekdayIndex } from "@/lib/time";

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

    const weekday = getWeekdayIndex(props.currentDate);
    const scheduledToday = props.task.activeWeekdays[weekday];
    const isDisabled = props.editLayout || !scheduledToday;
    const target = props.task.targetPerDay ?? 0;
    const goalReached = target > 0 && props.value >= target;

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
                "flex h-full w-full flex-wrap items-center justify-between gap-3 rounded-2xl border-2 px-6 py-3",
                goalReached && "border-accent-pink/30 bg-accent-pink/10",
                isDisabled &&
                    !goalReached &&
                    "border-border/30 bg-bg-elevated/30",
                !goalReached &&
                    !isDisabled &&
                    "border-accent-pink/70 bg-accent-pink/25",
                isDisabled && "cursor-default",
                !isDisabled && "hover:scale-[1.01]",
                props.editLayout && "rounded-br-none",
            )}
        >
            <span
                className={cn(
                    "text-lg font-semibold tracking-tight",
                    goalReached && "text-text/60",
                    isDisabled && !goalReached && "text-text-muted/50",
                    !goalReached && !isDisabled && "text-text",
                )}
            >
                {props.task.label}
            </span>
            <span
                className={cn(
                    "flex items-center rounded-full px-4 py-1 text-xs font-semibold tracking-widest",
                    goalReached &&
                        "border-accent-pink/25 bg-accent-pink/8 text-text/40 border",
                    isDisabled &&
                        !goalReached &&
                        "border-border/30 bg-bg-elevated/30 text-text-muted/50 border",
                    !goalReached &&
                        !isDisabled &&
                        "border-accent-pink/60 bg-accent-pink/20 text-text border",
                )}
            >
                {target > 0 ? `${props.value} / ${target}` : props.value}
            </span>

            <div className="flex min-w-24 flex-1 flex-wrap gap-2 self-stretch">
                <button
                    type="button"
                    aria-label="Decrease count"
                    disabled={isDisabled}
                    onClick={handleDecrement}
                    className={cn(
                        "flex min-w-20 flex-1 items-center justify-center rounded-xl border-2 px-5 text-3xl leading-none font-semibold",
                        goalReached &&
                            "border-accent-pink/30 bg-accent-pink/10 text-text/50",
                        isDisabled &&
                            !goalReached &&
                            "bg-bg-elevated/20 text-text-muted/50 border-transparent",
                        !goalReached &&
                            !isDisabled &&
                            "border-accent-pink/80 bg-accent-pink/80 text-text",
                        isDisabled && "cursor-default",
                        !isDisabled && "cursor-pointer hover:scale-[1.01]",
                    )}
                >
                    −
                </button>
                <button
                    type="button"
                    aria-label="Increase count"
                    disabled={isDisabled}
                    onClick={handleIncrement}
                    className={cn(
                        "flex min-w-20 flex-1 items-center justify-center rounded-xl border-2 px-5 text-3xl leading-none font-semibold",
                        goalReached &&
                            "border-accent-pink/30 bg-accent-pink/10 text-text/50",
                        isDisabled &&
                            !goalReached &&
                            "bg-bg-elevated/20 text-text-muted/50 border-transparent",
                        !goalReached &&
                            !isDisabled &&
                            "border-accent-pink/80 bg-accent-pink/80 text-text",
                        isDisabled && "cursor-default",
                        !isDisabled && "cursor-pointer hover:scale-[1.01]",
                    )}
                >
                    +
                </button>
            </div>
        </div>
    );
}
