import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "placeholder:text-text-muted border-border bg-bg-elevated text-text selection:bg-accent-pink/30 selection:text-text file:text-text h-9 w-full min-w-0 rounded-md border px-3 text-sm file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-3 file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-accent-pink focus-visible:bg-bg-hover",
                "aria-invalid:border-error aria-invalid:ring-error/30",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
