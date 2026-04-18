import { user as authUser } from "@/server/db/auth-schema";
import { pgTable, text, timestamp, integer, jsonb, date, index, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { Task, TaskLayout } from "@/lib/tasks";
import type { DailyLog } from "@/lib/daily-logs";

export * from "@/server/db/auth-schema";

export const taskSet = pgTable(
    "task_set",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, { onDelete: "cascade" }),
        tasks: jsonb("tasks").$type<Task[]>().notNull(),
        layout: jsonb("layout").$type<TaskLayout>().notNull(),
        activeFrom: date("active_from", { mode: "date" }).notNull(),
        activeTo: date("active_to", { mode: "date" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => ({
        byUserIdx: index("task_set_user_idx").on(table.userId),
        byUserFromIdx: index("task_set_user_from_idx").on(table.userId, table.activeFrom),
    }),
);

export const dailyLog = pgTable(
    "daily_log",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, { onDelete: "cascade" }),
        date: date("date", { mode: "date" }).notNull(),
        data: jsonb("data").$type<DailyLog>().notNull(),
    },
    (table) => ({
        byUserDateUnique: uniqueIndex("daily_log_user_date_unique").on(table.userId, table.date),
        byUserIdx: index("daily_log_user_idx").on(table.userId),
        byDateIdx: index("daily_log_date_idx").on(table.date),
    }),
);

export const settings = pgTable("settings", {
    userId: text("user_id")
        .primaryKey()
        .references(() => authUser.id, { onDelete: "cascade" }),
    cutoffHour: integer("cutoff_hour").default(3).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});
