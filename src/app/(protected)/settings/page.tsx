"use client";
import { useRef } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { data, isLoading } = api.settings.getSettings.useQuery();
    const update = api.settings.updateCutoffHour.useMutation();

    if (isLoading) {
        return <div className="text-text-muted flex items-center justify-center py-20 text-sm">Loading…</div>;
    }

    const handleSave = async () => {
        const raw = Number(inputRef.current?.value ?? 3);
        const hour = Math.min(23, Math.max(0, Number.isNaN(raw) ? 3 : raw));
        await update.mutateAsync({ hour });
    };

    return (
        <div className="flex flex-col gap-10">
            <Card className="bg-bg-elevated/60 backdrop-blur-sm">
                <CardHeader className="flex flex-col gap-1">
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription className="text-text-muted">
                        Manage your application preferences and settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-text-muted text-xs font-medium tracking-wider uppercase">
                                Cutoff hour
                            </label>
                            <Input
                                ref={inputRef}
                                type="number"
                                min={0}
                                max={23}
                                defaultValue={data?.cutoffHour ?? 3}
                                disabled={update.isPending}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-text-muted text-xs font-medium tracking-wider uppercase">About</span>
                            <p className="text-text-muted text-sm">
                                The time when your day resets. Activities after midnight count toward the previous day
                                until this hour.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="default"
                            onClick={handleSave}
                            disabled={update.isPending}
                            className="min-w-[140px]"
                        >
                            {update.isPending && (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Saving…
                                </>
                            )}
                            {!update.isPending && "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
