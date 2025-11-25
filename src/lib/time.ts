export const WEEKDAY_LABELS: string[] = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
];

export const WEEKDAY_LABELS_FULL: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function getWeekdayIndex(date: Date) {
    const day = date.getUTCDay();
    return day === 0 ? 6 : day - 1;
}

export function getWeekday(date: Date) {
    return WEEKDAY_LABELS[getWeekdayIndex(date)];
}

export function getWeekdayFull(date: Date) {
    return WEEKDAY_LABELS_FULL[getWeekdayIndex(date)];
}

export function formatGermanDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}.${month}.${year}`;
}

export function formatGermanDateShort(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
}

export function resolveLogicalDay(now: Date, cutoffHour: number) {
    const local = new Date(now);
    if (local.getHours() < cutoffHour) {
        local.setDate(local.getDate() - 1);
    }
    const year = local.getFullYear();
    const month = local.getMonth();
    const day = local.getDate();
    return new Date(Date.UTC(year, month, day));
}

export function addDaysUtc(date: Date, offset: number) {
    const base = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    base.setUTCDate(base.getUTCDate() + offset);
    return base;
}

export function formatDateDistance(date: Date, today: Date): string {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);

    const diffTime = dateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    }
    if (diffDays === -1) {
        return "Yesterday";
    }
    if (diffDays === 1) {
        return "Tomorrow";
    }

    const absDays = Math.abs(diffDays);
    const weeks = Math.floor(absDays / 7);
    const remainingDays = absDays % 7;

    if (weeks === 0) {
        return diffDays < 0 ? `${absDays} days ago` : `in ${absDays} days`;
    }

    if (remainingDays === 0) {
        return diffDays < 0
            ? `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
            : `in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    }

    if (weeks === 1 && remainingDays <= 3) {
        const totalDays = weeks * 7 + remainingDays;
        return diffDays < 0 ? `${totalDays} days ago` : `in ${totalDays} days`;
    }

    const weekPart = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    const dayPart =
        remainingDays > 0
            ? ` ${remainingDays} ${remainingDays === 1 ? "day" : "days"}`
            : "";
    return diffDays < 0
        ? `${weekPart}${dayPart} ago`
        : `in ${weekPart}${dayPart}`;
}
