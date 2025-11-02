"use client";
import { Button } from "@/components/ui/button";
import { formatGermanDate } from "@/lib/time";

export function DateNavigator(props: {
    dayId: Date;
    onOffsetChange: (offset: number) => void;
    editLayout: boolean;
    onEditLayoutChange: (editing: boolean) => void;
    onSaveLayout: () => void;
    onCancelLayout: () => void;
}) {
    const {
        dayId,
        onOffsetChange,
        editLayout,
        onEditLayoutChange,
        onSaveLayout,
        onCancelLayout,
    } = props;
    return (
        <div className="border-border/68 bg-bg-elevated/90 sticky top-16 z-10 border-y shadow-lg backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-2 py-4">
                <div className="flex min-w-55 justify-start text-xs">
                    <span className="pill-outline bg-bg-elevated/40 text-text">
                        {formatGermanDate(dayId)}
                    </span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2 text-sm">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOffsetChange(-7)}
                    >
                        −7
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOffsetChange(-1)}
                    >
                        −1
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOffsetChange(0)}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOffsetChange(1)}
                    >
                        +1
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOffsetChange(7)}
                    >
                        +7
                    </Button>
                </div>
                <div className="flex min-w-[220px] items-center justify-end gap-2">
                    <div className="flex items-center gap-2">
                        {editLayout ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCancelLayout}
                                >
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={onSaveLayout}>
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditLayoutChange(true)}
                                >
                                    Layout
                                </Button>
                                <Button size="sm" className="invisible">
                                    Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
