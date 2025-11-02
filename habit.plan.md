# Implementation Plan — task_set + JSON daily_log (with RGL + optimistic UI)

## Constraints
- Use db:push; skip migrations/seeding here
- Non-overlap: new set today → previous active_to = yesterday
- Panels update optimistically
- Layout via react-grid-layout; versioned with tasks in task_set
- All dates/times are client-local; client computes dayId using cutoff_hour
- Weeks start Monday (ISO)

## Backend
- Keep schema: task_set (tasks/layout + active_from/active_to), daily_log (per user/date, data map), settings (cutoff_hour)
- tRPC routers: settings, taskSet, dailyLog, analytics (weekday filtering + ISO weeks)

## Frontend
- Protected layout redirects to /login when unauthenticated
- /track: RGL grid, layout mode, weekday filtering, optimistic logging, CTA when no task set
- /tasks: clone-via-new-set create/retire/edit using upsertForToday
- /settings: view/update cutoff hour
- /insights: range (7/30/365), resolution (daily/weekly), modes (Relative/Absolute) using Recharts

## Utilities
- src/lib/time.ts: getLogicalDayId, shiftDayId, weekdayIndex, isoWeekLabel

## Styling
- Rework palette in src/styles/globals.css later for cohesive look

## Status
- Auth/tRPC/settings/taskSet/dailyLog wired
- Time helpers added; analytics cutoff-aware + weekday filter + ISO weeks
- Protected layout added; /track built with RGL + optimistic updates
- Remaining: /tasks polish, /settings UI, /insights charts, color pass
