import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { taskSet } from "@/server/db/schema";
import { taskSetSchema, taskLayoutSchema, findActiveTaskSetForDate } from "@/lib/tasks";

export const taskSetRouter = createTRPCRouter({
    getForUser: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const rows = await ctx.db
            .select()
            .from(taskSet)
            .where(eq(taskSet.userId, userId))
            .orderBy(asc(taskSet.activeFrom));
        return rows;
    }),

    getLatestForUser: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const row = await ctx.db
            .select()
            .from(taskSet)
            .where(eq(taskSet.userId, userId))
            .orderBy(desc(taskSet.activeFrom))
            .limit(1);
        return row[0] ?? null;
    }),

    getForDate: protectedProcedure.input(z.object({ date: z.date() })).query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const rows = await ctx.db
            .select()
            .from(taskSet)
            .where(and(eq(taskSet.userId, userId), eq(taskSet.activeFrom, input.date)))
            .limit(1);
        return rows[0] ?? null;
    }),

    upsertForDate: protectedProcedure
        .input(
            z.object({
                date: z.date(),
                taskSet: taskSetSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const existing = await ctx.db
                .select()
                .from(taskSet)
                .where(eq(taskSet.userId, userId))
                .orderBy(desc(taskSet.activeFrom))
                .limit(1);

            const latest = existing[0];
            const hasLatest = latest !== undefined;
            const isSameDate = hasLatest && latest.activeFrom.getTime() === input.date.getTime();

            if (isSameDate) {
                const result = await ctx.db
                    .update(taskSet)
                    .set({
                        tasks: input.taskSet.tasks,
                        layout: input.taskSet.layout,
                    })
                    .where(eq(taskSet.id, latest.id))
                    .returning({ id: taskSet.id });
                return { id: result[0]!.id };
            }

            if (hasLatest) {
                const dayBefore = new Date(input.date);
                dayBefore.setDate(dayBefore.getDate() - 1);
                await ctx.db.update(taskSet).set({ activeTo: dayBefore }).where(eq(taskSet.id, latest.id));
            }

            const result = await ctx.db
                .insert(taskSet)
                .values({
                    userId,
                    tasks: input.taskSet.tasks,
                    layout: input.taskSet.layout,
                    activeFrom: input.date,
                    activeTo: null,
                })
                .returning({ id: taskSet.id });
            return { id: result[0]!.id };
        }),

    updateLayoutForDate: protectedProcedure
        .input(z.object({ date: z.date(), layout: taskLayoutSchema }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const allTaskSets = await ctx.db
                .select()
                .from(taskSet)
                .where(eq(taskSet.userId, userId))
                .orderBy(desc(taskSet.activeFrom));

            const activeTaskSet = findActiveTaskSetForDate(allTaskSets, input.date);

            if (activeTaskSet) {
                const result = await ctx.db
                    .update(taskSet)
                    .set({ layout: input.layout })
                    .where(eq(taskSet.id, activeTaskSet.id))
                    .returning({ id: taskSet.id });
                return { id: result[0]!.id };
            }

            const latest = allTaskSets[0];
            if (latest) {
                const dayBefore = new Date(input.date);
                dayBefore.setDate(dayBefore.getDate() - 1);
                await ctx.db.update(taskSet).set({ activeTo: dayBefore }).where(eq(taskSet.id, latest.id));
            }

            if (!latest) {
                throw new Error("No task set found. Please create a task set first.");
            }

            const result = await ctx.db
                .insert(taskSet)
                .values({
                    userId,
                    tasks: latest.tasks,
                    layout: input.layout,
                    activeFrom: input.date,
                    activeTo: null,
                })
                .returning({ id: taskSet.id });
            return { id: result[0]!.id };
        }),
});
