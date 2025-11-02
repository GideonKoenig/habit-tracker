import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { settings } from "@/server/db/schema";
import { DEFAULT_CUTOFF_HOUR } from "@/lib/settings";

export const settingsRouter = createTRPCRouter({
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const row = await db
            .select()
            .from(settings)
            .where(eq(settings.userId, userId))
            .limit(1);

        const entry = row[0];

        if (!entry) {
            await db
                .insert(settings)
                .values({ userId, cutoffHour: DEFAULT_CUTOFF_HOUR });
            return { cutoffHour: DEFAULT_CUTOFF_HOUR };
        }
        return { cutoffHour: entry.cutoffHour };
    }),

    updateCutoffHour: protectedProcedure
        .input(z.object({ hour: z.number().int().min(0).max(23) }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            await db
                .insert(settings)
                .values({ userId, cutoffHour: input.hour })
                .onConflictDoUpdate({
                    target: settings.userId,
                    set: { cutoffHour: input.hour },
                });
        }),
});
