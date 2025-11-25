import type { Task, TaskSetEntry } from "@/lib/tasks";
import type { DailyLogEntry } from "@/lib/daily-logs";
import { addDaysUtc, getWeekdayIndex } from "@/lib/time";

type InsightRange = "7d" | "30d" | "365d";
type InsightResolution = "daily" | "weekly";
type InsightMode = "relative" | "absolute";

export type GraphSettings = {
    range: InsightRange;
    resolution: InsightResolution;
    mode: InsightMode;
};

export type InsightDataPoint = {
    bucket: string;
    pointsEarned: number;
    totalPossiblePoints: number;
    percentage: number;
};

function isTaskActiveForDay(
    task: Task,
    dayId: Date,
    taskSetActiveFrom: Date,
    taskSetActiveTo: Date | null,
) {
    const dayTime = dayId.getTime();
    const fromTime = taskSetActiveFrom.getTime();
    const toTime = taskSetActiveTo?.getTime();

    if (dayTime < fromTime) return false;
    if (toTime !== undefined && dayTime > toTime) return false;

    const weekdayIndex = getWeekdayIndex(dayId);
    return task.activeWeekdays[weekdayIndex] ?? false;
}

function calculateTaskPoints(task: Task, value: number) {
    if (task.type === "single") {
        const earned = value === 1 ? task.pointsPerUnit : 0;
        const possible = task.pointsPerUnit;
        return { earned, possible };
    } else {
        const rawPoints = value * task.pointsPerUnit;
        const maxPoints = (task.targetPerDay ?? 0) * task.pointsPerUnit;
        const earned = Math.min(rawPoints, maxPoints);
        const possible = maxPoints;
        return { earned, possible };
    }
}

function getTasksForDay(dayId: Date, taskSets: TaskSetEntry[]) {
    const result: Array<{ task: Task; taskSet: TaskSetEntry }> = [];

    for (const taskSet of taskSets) {
        for (const task of taskSet.tasks) {
            if (
                isTaskActiveForDay(
                    task,
                    dayId,
                    taskSet.activeFrom,
                    taskSet.activeTo,
                )
            ) {
                result.push({ task, taskSet });
            }
        }
    }

    return result;
}

function calculateDailyInsight(
    dayId: Date,
    taskSets: TaskSetEntry[],
    dailyLogs: DailyLogEntry[],
) {
    const logEntry = dailyLogs.find((log) => {
        const logTime = log.date.getTime();
        const targetTime = dayId.getTime();
        return logTime === targetTime;
    });

    const logData = logEntry?.data ?? {};
    const activeTasks = getTasksForDay(dayId, taskSets);

    let pointsEarned = 0;
    let totalPossiblePoints = 0;

    for (const { task } of activeTasks) {
        const value = logData[task.id] ?? 0;
        const { earned, possible } = calculateTaskPoints(task, value);
        pointsEarned += earned;
        totalPossiblePoints += possible;
    }

    const percentage =
        totalPossiblePoints > 0
            ? (pointsEarned / totalPossiblePoints) * 100
            : 0;

    return {
        date: dayId,
        pointsEarned,
        totalPossiblePoints,
        percentage,
    };
}

function getWeekStart(date: Date) {
    const weekdayIndex = getWeekdayIndex(date);
    return addDaysUtc(date, -weekdayIndex);
}

function calculateWeeklyInsight(
    weekStart: Date,
    taskSets: TaskSetEntry[],
    dailyLogs: DailyLogEntry[],
) {
    let pointsEarned = 0;
    let totalPossiblePoints = 0;

    for (let i = 0; i < 7; i++) {
        const dayId = addDaysUtc(weekStart, i);
        const daily = calculateDailyInsight(dayId, taskSets, dailyLogs);
        pointsEarned += daily.pointsEarned;
        totalPossiblePoints += daily.totalPossiblePoints;
    }

    const percentage =
        totalPossiblePoints > 0
            ? (pointsEarned / totalPossiblePoints) * 100
            : 0;

    return {
        weekStart,
        pointsEarned,
        totalPossiblePoints,
        percentage,
    };
}

function getRangeDays(range: InsightRange) {
    switch (range) {
        case "7d":
            return 7;
        case "30d":
            return 30;
        case "365d":
            return 365;
    }
}

export function calculateInsights(
    endDayId: Date,
    range: InsightRange,
    resolution: InsightResolution,
    taskSets: TaskSetEntry[],
    dailyLogs: DailyLogEntry[],
) {
    const days = getRangeDays(range);
    const startDayId = addDaysUtc(endDayId, -(days - 1));

    if (resolution === "daily") {
        const results: InsightDataPoint[] = [];
        for (let i = 0; i < days; i++) {
            const dayId = addDaysUtc(startDayId, i);
            const insight = calculateDailyInsight(dayId, taskSets, dailyLogs);
            results.push({
                bucket: dayId.toISOString(),
                pointsEarned: insight.pointsEarned,
                totalPossiblePoints: insight.totalPossiblePoints,
                percentage: insight.percentage,
            });
        }
        return results;
    } else {
        const results: InsightDataPoint[] = [];
        const endWeekStart = getWeekStart(endDayId);
        let currentWeekStart = getWeekStart(startDayId);

        while (currentWeekStart.getTime() <= endWeekStart.getTime()) {
            const insight = calculateWeeklyInsight(
                currentWeekStart,
                taskSets,
                dailyLogs,
            );
            results.push({
                bucket: currentWeekStart.toISOString(),
                pointsEarned: insight.pointsEarned,
                totalPossiblePoints: insight.totalPossiblePoints,
                percentage: insight.percentage,
            });
            currentWeekStart = addDaysUtc(currentWeekStart, 7);
        }

        return results;
    }
}
