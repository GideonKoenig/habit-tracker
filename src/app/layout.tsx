import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
    title: "Habit Tracker",
    description:
        "A simple app to track your habits and see your progress over time.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geist.variable}`}
        >
            <body>
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
