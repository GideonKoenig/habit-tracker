"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({});

export type User = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>["user"];

export function useUser() {
    const { data: session } = authClient.useSession();
    return session?.user ?? null;
}
