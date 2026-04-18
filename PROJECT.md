# v0 BUILD PROMPT — HABIT / POINTS TRACKER APP

## 0. High-level Product Summary

Build a small multi-user web app where each signed-in user can:

1. Define personal tasks/habits with point values and schedules.
2. Log daily progress for those tasks (including going back in time).
3. See simple performance charts over time.

Important design constraints:

- This is **not** a public SaaS. It's just for me and a few friends.
- Tasks and logs are always **private** and **per-user**.
- There is **no social layer** and no sharing.
- I will self-host this on a Coolify VPS.
- The app should feel like “quantified self meets gamified routine,” not like corporate productivity software.

## 1. Tech Stack (Hard Requirements)

### Framework / runtime

- **Next.js** (latest stable).
- Use **React Compiler**.
    - Do not manually optimize with `useMemo` or `useCallback`.
    - Write idiomatic React; let the compiler handle perf.

### Styling / UI

- **Tailwind CSS**.
- **shadcn/ui** for components (buttons, toggles, dialogs, nav, etc.).

### Data / backend

- **Drizzle ORM** with **Postgres**.
- **tRPC** for backend <-> frontend communication:
    - All domain logic is exposed through tRPC routers/procedures.
    - Frontend calls tRPC hooks for reads/mutations instead of REST.
- **BetterAuth** with **Google Sign-In** for authentication.
    - A user must be logged in to see anything (no anonymous mode).

### Environment

- Use **t3-oss/env** (e.g. `@t3-oss/env-nextjs`) for environment variable validation on both server and client where appropriate.
    - All secrets (DB URL, Google OAuth client ID/secret, etc.) must be validated in this env layer.
    - Server-only vs client-exposed vars should be handled like in `create-t3-app`.

### Charts

- Use **Recharts** for data visualization in the analytics view.

### Package manager

- Use **pnpm** for dependency management and scripts.
    - The repo should assume pnpm (lockfile, docs, etc.).
    - Do not assume npm or yarn.

### Project structure

- The app should **either:**
    - Be bootstrapped using `create-t3-app` (preferred), **OR**
    - Recreate the same general structure and conventions of a `create-t3-app` setup (Next.js + tRPC + auth + env + DB), including:
        - tRPC router(s) in `src/server/api`
        - Drizzle schema in `src/server/db/schema`
        - env validation in `src/env.ts`
        - auth logic in `src/server/auth`
        - etc.

### Deployment

- The whole app runs on a simple VPS via Coolify.
- No distributed infra assumptions.
- No need for production-grade rate limiting or tenant isolation beyond scoping queries by user.

## 2. Auth / Multi-User Model

- Use BetterAuth with Google login.
- After login, we have `user.id` and `user.email`.

Rules:

- Each logged-in user can only see + edit:
    - their own tasks,
    - their own daily logs,
    - their own stats.

- There is **no data sharing or visibility across users**.
- You **must** scope all queries and mutations by `session.user.id`.

We do not need heavy security hardening beyond:

- Auth gate on all pages.
- tRPC procedures that always filter by `user_id === currentUser.id` to avoid leaking data.

## 3. Time / "Shifted Day" Logic (Critical)

We do **not** assume the day resets at 00:00. Instead we have a **cutoff hour**.

- Each user has a `cutoff_hour` (integer 0–23). Default is `3`.
    - Example: cutoff_hour = 3 means:  
      "The day of Oct 25" runs from **Oct 25 03:00 → Oct 26 02:59**.

- This matters because I often log things at 01:00 in the morning and I still want them to count as “yesterday.”

- The frontend is responsible for:
    - Figuring out “what is the current logical day?” based on local time and the user’s `cutoff_hour`.
    - Generating a `day_id` (a date string like `2025-10-25`) that represents that shifted logical day.
    - Doing the same calculation for past/future navigation.

- The backend will trust that `day_id`.  
  We store `day_id` as a real `DATE` column in Postgres, but interpret it as a logical bucket that already took `cutoff_hour` into account on the client.

- We assume local time for the user’s browser. We are **not** storing per-user timezone in this version.

## 4. Data Model (Drizzle + Postgres)

### `users`

Represents an authenticated user and their preferences.

Fields:

- `id` (primary key; should correspond to the auth layer user ID)
- `email` (string, unique)
- `created_at` (timestamp)
- `cutoff_hour` (integer, default 3)
    - Integer hour 0–23 indicating when the "logical day" rolls over.
- `layout_config` (jsonb, nullable)
    - Per-user dashboard layout for the Tracking view.
    - Stores task panel order and panel sizes.
    - Shape example:
        ```json
        {
            "panels": [
                { "task_id": "task_abc", "w": 1, "h": 1, "x": 0, "y": 0 },
                { "task_id": "task_def", "w": 2, "h": 1, "x": 1, "y": 0 }
            ]
        }
        ```
    - Exact shape is flexible, but must support drag+resize per task panel.

Notes:

- We are **not** storing timezone per user. Assume browser local time + cutoff_hour.

### `task_definitions`

Each row is a snapshot of a task's configuration at a point in time.

Important rule:  
Tasks are immutable historically. If I “edit” a task (change label, weekdays, points, etc.), the app actually creates a **new** task_definitions row and soft-deletes the old one. Past days keep using the old definition.

Fields:

- `id` (pk, uuid or cuid)
- `user_id` (fk → users.id)
- `label` (text)
    - e.g. "Workout", "No Sugar", "Pushups"
- `type` (enum: `"single" | "multi"`)
    - `"single"`: boolean toggle for the day (on/off)
    - `"multi"`: integer counter with +/– buttons
- `points_per_unit` (numeric)
    - For `"single"`: how many points I get if I toggled it ON.
    - For `"multi"`: how many points each unit is worth.
- `target_per_day` (int, nullable)
    - Only relevant for `"multi"`.
    - Cap for daily scoring.  
      Example: if `target_per_day = 50` and I logged 60 reps, score is still capped at 50 \* `points_per_unit`.
- `active_weekdays` (array of 7 booleans, Mon..Sun, OR an integer bitmask)
    - Which weekdays this task should be considered active for scoring.
    - This is like “repeat M T W Th F Sa Su” in an alarm.
- `created_at` (timestamp)
    - The moment this task definition becomes active.
    - The task only appears on or after this logical day.
- `deleted_at` (timestamp, nullable)
    - Soft-delete marker.
    - When set, the task stops appearing starting with that logical day going forward.
    - Historical data still includes it pre-deletion.

Optional display niceties:

- You may include:
    - `display_color` (text, nullable)
    - `display_icon` (text, nullable, could be an emoji string like "💪")
- BUT even cosmetic edits should follow the same clone+retire rule. We never truly mutate historical rows except setting `deleted_at`.

Editing model:

- “Edit task” in the UI should:
    - Clone (create a new row with updated config, `created_at = now()`, no `deleted_at`)
    - Mark the old row as deleted by setting `deleted_at = now()`

Retiring:

- “Retire” just sets `deleted_at = now()` on that row.
- Retired tasks should not show up for future logical days, but should still show in analytics/history up to their deletion day.

### `daily_logs`

Stores what the user actually logged for a given task on a given logical day.

Fields:

- `id` (pk)
- `user_id` (fk → users.id)
- `task_id` (fk → task_definitions.id)
- `day_id` (date)
    - Represents the logical “shifted day” according to cutoff_hour, NOT necessarily the calendar midnight day.
    - The frontend passes this value to the backend when creating/updating.
- `value` (int)
    - For `"single"` tasks: `0` or `1`.
    - For `"multi"` tasks: an integer count (`0, 1, 2, ...`).
- (Optional) `points_earned` (numeric, denormalized cache)
    - This can be calculated from `value`, `points_per_unit`, and `target_per_day`.
    - Formula:

        ```text
        single task:
          points_earned = (value === 1 ? points_per_unit : 0)

        multi task:
          raw_points = value * points_per_unit
          max_points = target_per_day * points_per_unit
          points_earned = min(raw_points, max_points)
        ```

Rules:

- Historical data is **always editable**.
- User can create or update `daily_logs` for ANY `day_id` in the past (or today).
- If there is no log row yet for a given `(task_id, day_id)`, toggling/incrementing creates it.

## 5. Task Visibility for a Given Day

The frontend must decide which tasks to render for a selected `day_id`.

A task is considered **active for that day** if ALL of these are true:

1. The `day_id` is **on or after** the task's `created_at` logical day.
2. `deleted_at` is `null`, OR the `day_id` is strictly **before** the logical day at which `deleted_at` happened.
3. The weekday of that `day_id` (Mon..Sun) is enabled in `active_weekdays`.

If a task is NOT active for that `day_id`, it should **not appear at all** in the Tracking view for that day.

We do **not** persist `is_active_today` in the DB.  
It is always computed client-side using:

- `created_at`
- `deleted_at`
- weekday schedule
- cutoff_hour (to know what `day_id` means)
- the selected `day_id`

This keeps the UI clean:

- Tasks that didn’t exist yet aren’t shown when I jump to an older day.
- Deleted tasks don’t show in future days.
- Tasks that aren’t scheduled that weekday aren’t shown for that day.

## 6. Main UI Surfaces

We need 3 primary views/routes:

### A. Tracking View (Daily Logging Screen)

Purpose:

- Quickly log progress for the selected logical day.

Header controls:

- Show the currently selected logical day (`day_id`) and maybe a human-readable label like “Oct 25, 2025 (ends 03:00)”.
- Navigation:
    - “← Day” / “Day →” (move selected day by ±1 logical day)
    - “← Week” / “Week →” (move selected day by ±7 logical days)
    - A mini calendar picker to jump directly to a date

Main content:

- A grid of “task panels”.
- Each panel represents one active task for that `day_id`.

Panel behavior:

- **Normal mode (logging mode)**
    - For `"single"` tasks:
        - Show task label.
        - Show a large toggle button.
            - Clicking toggles between 0 and 1 for that `day_id`.
            - Upsert into `daily_logs` through tRPC.
    - For `"multi"` tasks:
        - Show task label.
        - Show current count for that `day_id` (from `daily_logs`, default 0).
        - “+” button increments the value and persists.
        - “–” button decrements (but not below 0) and persists.
        - Show target hint like `32 / 50`.
            - 32 is current logged count.
            - 50 is `target_per_day`.

- These updates should be optimistic in the UI and then sync via tRPC mutation.

- **Layout edit mode ("resize mode")**
    - Toggle a “Layout mode” switch somewhere in the UI.
    - In layout mode:
        - Panels become draggable + resizable.
        - Disable logging interactions (no toggles, no +/-).
        - On drag/resize end, update `users.layout_config` via tRPC.
    - Layout info (position, w/h per task panel) is persisted per-user.

Rules:

- Past data is ALWAYS editable.  
  If I navigate to 2025-10-20, I can still toggle and adjust logs.

- If a `daily_logs` row does not exist yet for `(task_id, day_id)`, incrementing/toggling creates it.

- Only active tasks for that logical day appear. Inactive tasks (either not yet created, already deleted, or not scheduled that weekday) are completely hidden.

### B. Task Management View

Purpose:

- Create new tasks.
- "Edit" tasks (clone new + soft-delete old).
- Retire tasks.

Sections:

1. **Task List**
    - Show all tasks for the user:
        - Active tasks first.
        - Optionally, recently retired tasks after.
    - For each task show:
        - `label`
        - `type` ("single" or "multi")
        - active weekdays (Mon..Sun indicators)
        - `points_per_unit`
        - `target_per_day` (if multi)
        - status: active / retired
    - Actions:
        - **Edit**
            - Opens a form prefilled from this task.
            - On submit:
                - In tRPC:
                    - set `deleted_at = now()` on the old row,
                    - create a brand-new `task_definitions` row with updated values (`created_at = now()`, `deleted_at = null`).
            - The new row immediately replaces the old one for future logical days.
        - **Retire**
            - Just sets `deleted_at = now()` for that row.
            - The task disappears from future days’ Tracking View.

2. **New Task Form**
    - Fields:
        - `label` (string)
        - `type`: single | multi
        - active weekdays (Mon..Sun toggle buttons)
        - `points_per_unit` (number)
            - single: how many points if toggled ON
            - multi: how many points each increment is worth
        - if `type === multi`: `target_per_day` (int)
            - used to cap scoring
    - When saved:
        - Create a new `task_definitions` row:
            - `user_id` = current user
            - `created_at = now()`
            - `deleted_at = null`
            - set all config fields above
    - This new task shows up for “today” and onward (depending on weekdays and cutoff logic).

No hard delete.  
No editing old rows except setting `deleted_at` on them.

### C. Insights / Analytics View

Purpose:

- Let me see how consistent and effective I’ve been.

Controls at top:

- Range:
    - Last 7 days
    - Last 30 days
    - Last 365 days (1 year)
- Resolution:
    - Daily
    - Weekly
        - Weeks start on Monday (ISO-style Monday week start).
        - Weekly aggregation = sum of the days in that Mon–Sun block.
- Mode:
    - Relative %
    - Absolute

#### Definitions

For a single logical day `D`:

- **daily_total_possible_points**  
  Sum across all tasks that were active on day `D` of that task's max possible points for that day.
    - For `"single"` tasks: `max = points_per_unit`
    - For `"multi"` tasks: `max = target_per_day * points_per_unit`

- **daily_points_earned**  
  For each task:
    - `"single"`:
        - if `value === 1` → earn `points_per_unit`
        - else 0
    - `"multi"`:
        - `raw_points = value * points_per_unit`
        - `cap = target_per_day * points_per_unit`
        - earned = `min(raw_points, cap)`
          Then sum over all tasks.

For a single week:

- The week runs Monday → Sunday.
- `weekly_total_possible_points` = sum of `daily_total_possible_points` for each day in that week.
- `weekly_points_earned` = sum of `daily_points_earned` for each day in that week.

This is done after we already know each day's `day_id`.  
(We do not need to re-interpret cutoff for the week. The cutoff only affects how `day_id` is assigned to each log.)

#### Mode: Relative %

- For each bucket (day or week):
    - Compute `% = (points_earned / total_possible_points) * 100`.
    - If total_possible_points = 0, treat it as 0%.
- Visualize as either a bar chart or line chart.
- Tooltip should show:
    - Earned
    - Possible
    - %
    - Bucket label (day or week starting Monday)

#### Mode: Absolute

- For each bucket (day or week):
    - Display `points_earned` vs `total_possible_points`.
- Render as bars where:
    - Background bar height = total_possible_points.
    - Filled foreground = points_earned.
- Tooltip should show both numbers.

#### Range presets

- "Last 7 days" = the last 7 logical `day_id`s ending with "today" (today = current logical day based on cutoff).
- "Last 30 days" = same, 30-day window.
- "Last 365 days" = same, 365-day window.

There is no breakdown by individual task in these charts.  
We are always aggregating across all tasks for that user.

## 7. Navigation / App Shell

After login, provide a simple app shell with nav items:

- `/track` (default landing after login)
- `/insights`
- `/tasks`
- `/settings`

Settings page should allow:

- Viewing and updating `cutoff_hour` (0–23 integer).
    - When updated:
        - Persist to `users.cutoff_hour` via tRPC.
        - This only affects how the frontend computes logical `day_id` going forward.
        - We do **not** rewrite past `day_id` values in the DB.
- (Optional) Reset layout to default (clears `layout_config`).

## 8. tRPC API Surface

All business logic must be done via tRPC routers, not ad-hoc fetch calls.

Suggested routers / procedures (names are examples, not strict):

### `user` router

- `getSettings`
    - returns `cutoff_hour` and `layout_config` for the current user.
- `updateCutoffHour(hour: number)`
    - updates `users.cutoff_hour`.
- `updateLayoutConfig(layoutJson: any)`
    - updates `users.layout_config`.

All procedures must infer `user_id` from the session; client does not pass `user_id` manually.

### `tasks` router

- `listTasks()`
    - returns all task_definitions for the current user.
    - include active vs retired status (based on `deleted_at`).
- `createTask(input)`
    - input: `label`, `type`, `active_weekdays`, `points_per_unit`, (optional) `target_per_day`.
    - behavior:
        - insert new task_definitions with `created_at = now()`, `deleted_at = null`, tied to this user.
- `retireTask(taskId)`
    - sets `deleted_at = now()` for that task, if it belongs to the current user.
- `editTask(taskId, newValues)`
    - Fetch the old task (ensure same user).
    - Set old task’s `deleted_at = now()`.
    - Create a new task_definitions row with:
        - same user_id
        - `created_at = now()`
        - `deleted_at = null`
        - values from `newValues` (label, weekdays, etc.).
    - Return the new task.

This enforces the “clone + retire old task” model so that edits only apply going forward, not historically.

### `tracking` router

- `getTasksForDay(day_id: string)`
    - Returns only the tasks that should be active for that logical `day_id`:
        - Filter:
            - `created_at` <= `day_id`
            - (`deleted_at` is null OR `deleted_at` > `day_id`)
            - weekday(`day_id`) is enabled in `active_weekdays`
        - Scopes by current `user_id`.
    - Also return the `daily_logs.value` for each of those tasks for that `day_id` if it exists, so the UI can render current values.
- `upsertDailyLog({ task_id, day_id, value })`
    - Check that `task_id` belongs to current user.
    - Upsert `(user_id, task_id, day_id)` in `daily_logs` with new `value`.
    - Return the updated record.

This backs the Tracking View:

- Daily toggles
- Increment/decrement
- Historical edit
- Layout mode persists layout via `user.updateLayoutConfig`

### `analytics` router

- `getRangeSummary({ range: "7d" | "30d" | "365d", resolution: "daily" | "weekly" })`
    - Server should:
        1. Determine "today" for this user using their `cutoff_hour`.
            - The client CAN also pass "endDayId" and the server can trust it, but the server should still verify user_id scoping.
        2. Compute the list of `day_id`s in range (7, 30, or 365 days).
        3. Fetch all relevant `daily_logs` and `task_definitions` that overlap those days (filter by user_id).
        4. For each day:
            - Determine which tasks were active that day using the rules in Section 5.
            - Compute `daily_points_earned` and `daily_total_possible_points`.
        5. If `resolution === "weekly"`:
            - Group by ISO week starting Monday:
                - `weekly_points_earned` = sum of that week’s daily earned
                - `weekly_total_possible_points` = sum of that week’s daily possible
        6. Return an array of buckets, where each bucket has:
            - bucket label (day_id or week label)
            - points_earned
            - total_possible_points
            - percentage = points_earned / total_possible_points \* 100 (0 if denom is 0)

The frontend will use this data to render:

- Relative % mode (percentage line/bar)
- Absolute mode (earned vs possible bars)

## 9. Env Handling

- Use `@t3-oss/env` (e.g. `@t3-oss/env-nextjs`) to define a central `env` module that validates:
    - `DATABASE_URL` (for Postgres)
    - Google OAuth credentials for BetterAuth
    - Any other secrets needed by Next.js server / tRPC routers
- All server code (Drizzle init, BetterAuth config, tRPC context) must import from that validated env module, not `process.env` directly.

This mirrors `create-t3-app` patterns:

- env validation fails loudly if required vars are missing.
- split between server-only and client-exposed env vars.

## 10. Project Structure / Conventions

This project should either literally be bootstrapped using `create-t3-app` (with pnpm), or replicate the same conventions:

- `src/env.ts`: env validation using `t3-oss/env`.
- `src/server/db`:
    - Drizzle client init
    - schema definitions (`task_definitions`, `daily_logs`, `users`)
- `src/server/auth`:
    - BetterAuth configuration and helpers to get the current session/user
- `src/server/api/trpc.ts`:
    - tRPC context creation
    - middleware that injects `session.user.id`
- `src/server/api/routers/...`:
    - Routers: `user`, `tasks`, `tracking`, `analytics`
- `src/app/...` (Next.js app router pages):
    - `/track`
    - `/insights`
    - `/tasks`
    - `/settings`
    - Login redirect / protected layout wrapper
- Reusable UI components under `src/components/...`, styled with shadcn + Tailwind:
    - TaskPanel (single vs multi variants)
    - DateNavigator (day/week nav + calendar picker)
    - LayoutModeToggle
    - AnalyticsChart (switchable Relative / Absolute / Daily / Weekly)
    - OverlayBar component for Absolute mode

## 11. Interaction Details (Must-Haves)

### Daily navigation

- The Tracking view needs:
    - Day -1 / +1
    - Week -1 / +1 (±7 days)
    - Calendar picker for arbitrary jump

### Layout mode

- A toggle to switch between:
    - Logging mode (normal interaction)
    - Layout edit mode:
        - Drag panels around
        - Resize panels
        - Persist `layout_config` for this user via tRPC when exiting edit mode or after changes
- While in layout mode:
    - Disable the logging controls (`+`, `–`, toggle ON/OFF)

### Logging

- `"single"` tasks:
    - Tapping the toggle should call `tracking.upsertDailyLog({ task_id, day_id, value: 1 or 0 })`
- `"multi"` tasks:
    - `+` increments local value then calls `upsertDailyLog` with the new value
    - `–` decrements (no lower than 0) and calls `upsertDailyLog`
- If no row exists yet for `(task_id, day_id)`, first interaction should create it.

### Edit task flow = clone + retire

- In the Task Management view:
    - Clicking “Edit” opens a form similar to “New Task” with fields pre-loaded.
    - On submit:
        - Call `tasks.editTask()` which:
            - sets `deleted_at = now()` on the old task
            - creates a new row with updated values and `created_at = now()`
- Retire = simply set `deleted_at = now()`.

### Historical editing

- The user can browse to any past `day_id` and still edit logs there.
- There is no lockout. Past is always editable.

### Cutoff hour updates

- In Settings:
    - User can change their `cutoff_hour` (0–23 integer).
    - Call `user.updateCutoffHour()` through tRPC.
    - This only affects how the frontend computes logical `day_id` from now on.
    - Historical `day_id` rows in the DB are **not** rewritten.

## 12. Analytics View Visualization Rules

### Resolution: Daily

- X-axis = each `day_id` in range.
- Y-axis = either:
    - percentage (Relative mode), or
    - points_earned / total_possible_points (Absolute mode bars).

### Resolution: Weekly

- X-axis = week label (e.g. "2025-W43").
- Weeks start Monday (ISO).
- Each bucket aggregates Mon→Sun of those `day_id`s.
- Y-axis logic is the same, just using weekly totals.

### Relative Mode

- Show % = `points_earned / total_possible_points * 100`.
- If total_possible_points = 0, show 0%.

### Absolute Mode

- Show total_possible_points vs points_earned per bucket.
- Use two-layer/overlay bars in Recharts:
    - background bar height = total_possible_points
    - foreground/filled portion = points_earned

### Tooltip

- Hovering a bar/point shows:
    - date or week
    - points_earned
    - total_possible_points
    - percentage

## 13. Style / UX Notes

- Use shadcn/ui components:
    - Buttons, toggles, segmented controls, dialogs, calendar/date picker, etc.
- Use Tailwind utility classes for spacing, flex/grid, rounded corners.
- Panels in the Tracking view:
    - Should look like cards:
        - rounded-lg
        - subtle border
        - slight shadow
        - task label as header text
        - large central control (toggle button or counter UI)
- Keep visual hierarchy calm/clean, dashboard-like.
- The app is for a handful of nerds tracking habits, not for marketing.

## 14. Non-Goals / Out of Scope

- No leaderboard or “friends view.”
- No sharing tasks across users.
- No public feed.
- No notifications / reminders / emails.
- No mobile app beyond responsive web.
- No dark mode unless trivial.
- No organization/team model.
- No admin dashboard.
- No hard delete (everything is soft delete).
- No rewriting of historical days if settings change.
- No fancy rate limiting or advanced tenant hardening.

## 15. Summary of Critical Behaviors (Do Not Lose These)

1. **Cutoff hour (default 03:00) defines what “today” means.**  
   A logical "day" runs from cutoff_hour on Day X to cutoff_hour on Day X+1.  
   The frontend computes this and generates a `day_id` string like `2025-10-25` for all logging actions.

2. **Historical data is always editable.**  
   I can go to any past `day_id` and still toggle / increment tasks.

3. **Tasks appear only on days they’re active.**  
   A task is active for a `day_id` only if:
    - The `day_id` is on/after `created_at`.
    - The `day_id` is before `deleted_at` (if any).
    - The weekday of that `day_id` is enabled in `active_weekdays`.
      If inactive, it’s not shown at all for that day.

4. **Two task types:**
    - `"single"`: boolean toggle for that day, worth a fixed point amount if ON.
    - `"multi"`: counter with `+` / `–`, worth `value * points_per_unit` but capped by `target_per_day * points_per_unit`.

5. **Task edits create a new task_definitions row.**
    - We never retroactively change an old task.
    - Editing = clone new row with new config and soft-delete the old row (set `deleted_at` on old).
    - Retiring = just set `deleted_at`.

6. **Analytics has two modes (Relative %, Absolute) and two resolutions (Daily, Weekly).**
    - Weekly starts Monday.
    - Charts aggregate total points earned vs total possible points across all tasks, not per task.
    - Ranges: last 7 / 30 / 365 days.

7. **tRPC is the interface.**
    - Frontend calls tRPC hooks.
    - Routers (`user`, `tasks`, `tracking`, `analytics`) encapsulate all logic.
    - All procedures infer `user_id` from auth context.
    - No unauthenticated access.

8. **Env validation uses `t3-oss/env`.**
    - All secrets/env vars must go through validated env.
    - Structure and conventions should match `create-t3-app`.

9. **React Compiler is assumed.**
    - Don’t manually sprinkle `useMemo` / `useCallback`.  
      The compiler handles memoization.

10. **Package manager is pnpm.**
    - The repo should be pnpm-native (pnpm-lock.yaml etc.).

11. **App shell:**
    - `/track` (default)
    - `/insights`
    - `/tasks`
    - `/settings`

This is the full spec. Build this as a Next.js + tRPC + Drizzle + BetterAuth + Tailwind + shadcn + Recharts app, using `create-t3-app`-style conventions, `t3-oss/env` validation, **pnpm** as the package manager, and all of the behaviors above.
