"use client";
import { Toggle } from "@/components/ui/toggle";
import { WEEKDAY_LABELS } from "@/lib/time";

export function WeekdaySelector(props: {
    weekdays: boolean[];
    onChange: (weekdays: boolean[]) => void;
    disabled?: boolean;
}) {
    const handleToggle = (index: number, pressed: boolean) => {
        props.onChange(props.weekdays.map((v, idx) => (idx === index ? pressed : v)));
    };

    const handleToggleAll = () => {
        const allActive = props.weekdays.every(Boolean);
        props.onChange(props.weekdays.map(() => !allActive));
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-text-muted text-xs uppercase">Days</span>
            {WEEKDAY_LABELS.map((day, index) => (
                <Toggle
                    key={day}
                    pressed={props.weekdays[index]}
                    onPressedChange={(pressed) => handleToggle(index, pressed)}
                    disabled={props.disabled}
                    size="sm"
                    className="hover:bg-accent-pink/40 hover:text-text w-12 justify-center"
                >
                    {day}
                </Toggle>
            ))}
            <span className="bg-border mx-1 h-5 w-px" />
            <Toggle
                pressed={props.weekdays.every(Boolean)}
                onPressedChange={handleToggleAll}
                disabled={props.disabled}
                size="sm"
                className="hover:bg-accent-pink/40 hover:text-text w-12 justify-center"
            >
                All
            </Toggle>
        </div>
    );
}
