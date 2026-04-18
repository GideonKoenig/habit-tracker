# Code Guidelines

## Purpose

This file documents the coding standards for this repository and for the upcoming turbo migration.

These guidelines are intended to reduce later cleanup work. New code should follow them by default instead of introducing patterns that need to be refactored afterward.

## Source Of Truth

- `PROJECT.md` is historical planning material and is not the source of truth for current implementation details.
- The current codebase, the actual data model, and explicit decisions made during implementation take precedence over older planning documents.
- When in doubt, prefer the simplest approach that matches the existing code style and avoids unnecessary duplication.

## Core Principles

- Optimize for clarity first.
- Keep data normalized where practical and derive values instead of storing duplicates.
- Use early returns to handle edge cases before the main path.
- Keep the main path easy to read.
- Prefer small, direct, obvious code over clever abstractions.
- Avoid refactors that only move complexity around.

## Naming

- Do not use single-letter abbreviations.
- Prefer descriptive names even for local variables, callback parameters, and temporary values.
- Use names that make intent obvious without requiring comments.

Examples:

- Prefer `currentDate` over `d`
- Prefer `nextLayout` over `l`
- Prefer `event` over `e`
- Prefer `previousTaskSets` over `prev`

## Control Flow

- Prefer early returns whenever they simplify the happy path.
- If an `if` statement can be written as a single-line return without braces, do that.
- Avoid deep nesting when a guard clause makes the flow clearer.

Examples:

- Prefer `if (!context) return;`
- Prefer `if (!taskResult.success) return;`

## React And Component Style

- Do not add manual memoization by default.
- Do not introduce `useMemo`, `useCallback`, or `React.memo` unless there is a very specific, verified reason that cannot be handled by the React Compiler.
- Write normal, idiomatic React and let the compiler do the work.
- This applies to web code immediately.
- For React Native, keep the same default unless a concrete technical limitation is verified during implementation.

- Prefer named function components.
- Prefer `export function MyComponent(...)` over anonymous component expressions.
- Do not destructure props in the function header.
- Do not destructure props into locals in the function body.
- Define component props inline in the function signature by default.
- Only extract a named props type when it is reused or materially improves clarity.
- Access props as `props.someValue`.

Preferred pattern:

```tsx
export function ExampleComponent(props: { currentDate: Date; disabled: boolean }) {
    if (props.disabled) return null;

    return <div>{props.currentDate.toISOString()}</div>;
}
```

Avoid:

```tsx
export function ExampleComponent({ currentDate, disabled }: Props) {
    const { somethingElse } = props;
    const memoizedValue = useMemo(() => computeValue(currentDate), [currentDate]);
}
```

## File Organization

- Put the most important code nearest to the top of the file.
- Types, interfaces, and important constants should be near the top.
- The main exported component or function should appear before secondary helpers.
- Small local utilities should live near the bottom of the file.
- Organize files so that a reader sees the primary API and main flow first.

Typical order:

1. Imports
2. Important types and constants
3. Main exported function or component
4. Secondary components or helpers
5. Small local utilities

## Data Modeling

- Avoid data duplication where possible.
- If something can be derived reliably from existing data, derive it instead of persisting another copy.
- Prefer one clear representation of a concept over multiple partially overlapping representations.
- Shared business logic should live in reusable modules instead of being reimplemented in multiple UI layers.

## Comments

- Do not add code comments by default.
- Prefer code that explains itself through naming and structure.
- If a comment is truly necessary, keep it short and high-signal.

## TypeScript

- Prefer explicit, descriptive types over vague shorthand.
- Keep types close to the code they support when that improves readability.
- Use inline type imports where appropriate.
- Avoid introducing types that only mirror data that can already be inferred clearly.

## Formatting

- Use Prettier.
- Use `tabWidth: 4`.
- Use a `printWidth` of `120`.
- Keep formatting consistent with the repository rather than hand-formatting one-off exceptions.

## Migration Guidance

- Preserve these standards during the turbo migration.
- Shared packages should prioritize derivation over duplication.
- Do not use the migration as an excuse to add speculative abstractions.
- Keep shared logic truly shared and keep platform-specific UI concerns separated.
- When porting web code to mobile, preserve domain behavior first and adapt presentation second.
