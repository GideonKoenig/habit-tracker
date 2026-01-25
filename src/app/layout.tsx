import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { env } from "@/env";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
    title: "Habit Tracker",
    description:
        "A simple app to track your habits and see your progress over time.",
    icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout(
    props: Readonly<{ children: React.ReactNode }>,
) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geist.variable}`}
        >
            <head>
                <PlausibleProvider
                    domain={new URL(env.NEXT_PUBLIC_APP_URL).hostname}
                />
            </head>
            <body className="bg-bg relative h-dvh w-dvw">
                <TRPCReactProvider>{props.children}</TRPCReactProvider>
            </body>
        </html>
    );
}
