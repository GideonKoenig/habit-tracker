"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useUser, authClient } from "@/lib/auth-client";
import { tryCatch } from "@/lib/try-catch";

const NAV_ITEMS = [
    { href: "/", label: "Tracking" },
    { href: "/insights", label: "Insights" },
    { href: "/tasks", label: "Tasks" },
    { href: "/settings", label: "Settings" },
] as const;

export default function AppHeader() {
    const user = useUser();
    const pathname = usePathname();
    const router = useRouter();

    const initials = getInitials(user?.name);

    const handleLogout = async () => {
        const result = await tryCatch(authClient.signOut());
        if (result.success) {
            router.push("/login");
        }
    };

    return (
        <header className="border-border bg-bg-elevated/60 sticky top-0 z-40 rounded-b-lg border-b backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-3">
                <nav className="flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "rounded-lg px-5 py-2 text-sm font-medium",
                                    isActive
                                        ? "bg-accent-pink/20 text-accent-pink"
                                        : "text-text-muted hover:bg-bg-hover hover:text-text",
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <button
                    onClick={handleLogout}
                    className="focus-visible:ring-accent-pink focus-visible:ring-offset-bg cursor-pointer rounded-full hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Avatar className="border-border bg-bg-elevated h-9 w-9 border">
                        {user?.image && (
                            <AvatarImage
                                src={user.image}
                                alt={user.name ?? "Avatar"}
                            />
                        )}
                        <AvatarFallback className="text-text text-xs font-semibold uppercase">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </div>
        </header>
    );
}
