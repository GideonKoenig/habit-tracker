import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { taskSetRouter } from "@/server/api/routers/task-set";
import { dailyLogRouter } from "@/server/api/routers/daily-log";
import { settingsRouter } from "@/server/api/routers/settings";

export const appRouter = createTRPCRouter({
    taskSet: taskSetRouter,
    dailyLog: dailyLogRouter,
    settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
