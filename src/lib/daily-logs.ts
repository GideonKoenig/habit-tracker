import { z } from "zod";
import type { RouterOutputs } from "@/trpc/react";

export const dailyLogSchema = z.record(z.string(), z.number().int().min(0));

export type DailyLog = z.infer<typeof dailyLogSchema>;

export type DailyLogEntry = RouterOutputs["dailyLog"]["getForUser"][number];

export type DailyLogOptimisticContext = {
    previousAll: DailyLogEntry[] | undefined;
    previousForDate: DailyLogEntry | null | undefined;
};
