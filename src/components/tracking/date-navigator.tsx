"use client";
import { formatGermanDate, formatDateDistance, getWeekdayFull } from "@/lib/time";
import { type Layout } from "react-grid-layout";

export function DateNavigator(props: {
    currentDate: Date;
    today: Date;
    onOffsetChange: (offset: number) => void;
    draftLayout?: Layout[] | null;
    setDraftLayout?: (layout: Layout[] | null) => void;
    activeLayout?: Layout[];
    onSaveLayout?: (layout: Layout[]) => void;
}) {
    const editLayout = props.draftLayout !== null;
    const canEditLayout =
        props.draftLayout !== undefined &&
        props.setDraftLayout !== undefined &&
        props.activeLayout !== undefined &&
        props.onSaveLayout !== undefined;

    const handleToggleLayoutMode = () => {
        if (props.setDraftLayout && props.activeLayout) {
            props.setDraftLayout(props.draftLayout === null ? props.activeLayout : null);
        }
    };

    const handleSaveLayout = () => {
        if (!props.draftLayout) return;
        if (!props.onSaveLayout) return;
        if (!props.setDraftLayout) return;
        props.onSaveLayout(props.draftLayout);
        props.setDraftLayout(null);
    };

    const handleCancelLayout = () => {
        if (props.setDraftLayout) {
            props.setDraftLayout(null);
        }
    };

    const todayOffset = Math.round((props.today.getTime() - props.currentDate.getTime()) / (1000 * 60 * 60 * 24));

    const navigationButtons = [
        { offset: -7, label: "−7" },
        { offset: -1, label: "−1" },
        { offset: todayOffset, label: "Today" },
        { offset: 1, label: "+1" },
        { offset: 7, label: "+7" },
    ];

    return (
        <div className="border-border bg-bg-elevated/60 sticky top-16 z-30 rounded-lg border backdrop-blur-sm">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-3 items-center gap-6 px-6 py-3">
                <div className="flex w-full items-center justify-start gap-3">
                    <div className="text-text text-lg font-semibold">{getWeekdayFull(props.currentDate)}</div>
                    <span className="bg-accent-pink/20 text-accent-pink inline-flex h-8 min-w-28 items-center justify-center rounded-full px-3 text-xs font-semibold">
                        {formatDateDistance(props.currentDate, props.today)}
                    </span>
                </div>

                <div className="flex w-full items-center justify-center gap-1">
                    {navigationButtons.map((button) => (
                        <button
                            key={button.label}
                            onClick={() => props.onOffsetChange(button.offset)}
                            className="text-text-muted hover:bg-bg-hover hover:text-text rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                <div className="flex w-full items-center justify-end gap-2">
                    <span className="border-border/60 text-text inline-flex h-8 min-w-28 items-center justify-center rounded-full border px-3 text-xs font-medium">
                        {formatGermanDate(props.currentDate)}
                    </span>
                    {canEditLayout && (
                        <>
                            {editLayout ? (
                                <>
                                    <button
                                        onClick={handleCancelLayout}
                                        className="text-text-muted hover:bg-bg-hover hover:text-text rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveLayout}
                                        className="bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleToggleLayoutMode}
                                    className="text-text-muted hover:bg-bg-hover hover:text-text rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
                                >
                                    Layout
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
