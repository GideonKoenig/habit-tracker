import { z } from "zod";

export const dailyLogSchema = z.record(z.string(), z.number().int().min(0));

export type DailyLog = z.infer<typeof dailyLogSchema>;
