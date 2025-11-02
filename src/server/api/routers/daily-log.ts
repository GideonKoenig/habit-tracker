import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { dailyLog } from "@/server/db/schema";
import { dailyLogSchema } from "@/lib/daily-logs";

export const dailyLogRouter = createTRPCRouter({
    getForUser: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const rows = await ctx.db
            .select()
            .from(dailyLog)
            .where(eq(dailyLog.userId, userId));
        return rows;
    }),

    getForDate: protectedProcedure
        .input(z.object({ date: z.date() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const row = await ctx.db
                .select()
                .from(dailyLog)
                .where(
                    and(
                        eq(dailyLog.userId, userId),
                        eq(dailyLog.date, input.date),
                    ),
                )
                .limit(1);
            const entry = row[0];
            if (!entry) return null;
            return entry;
        }),

    upsertForDate: protectedProcedure
        .input(z.object({ date: z.date(), data: dailyLogSchema }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const result = await ctx.db
                .insert(dailyLog)
                .values({
                    userId,
                    date: input.date,
                    data: input.data,
                })
                .onConflictDoUpdate({
                    target: [dailyLog.userId, dailyLog.date],
                    set: { data: input.data },
                })
                .returning({ id: dailyLog.id });
            return { id: result[0]!.id };
        }),
});
