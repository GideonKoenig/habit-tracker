import { redirect } from "next/navigation";
import { getUser } from "@/server/auth";
import AppHeader from "@/components/app-header";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ProtectedLayout(props: Readonly<{ children: React.ReactNode }>) {
    const user = await getUser();
    if (!user) redirect("/login");

    return (
        <ScrollArea className="h-full w-full">
            <div className="mx-auto h-dvh w-full max-w-5xl">
                <AppHeader />
                <main className="flex flex-col gap-10 px-8 py-12">{props.children}</main>
            </div>
        </ScrollArea>
    );
}
