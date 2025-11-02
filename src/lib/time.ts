export const WEEKDAY_LABELS: string[] = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
];

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
    local.setHours(0, 0, 0, 0);
    return local;
}
