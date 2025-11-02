"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
    "inline-flex items-center justify-center gap-1.5 rounded-md border text-xs font-medium disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "border-border bg-bg-elevated text-text-muted hover:text-text hover:bg-bg-hover data-[state=on]:border-transparent data-[state=on]:bg-accent-pink data-[state=on]:text-text",
                outline:
                    "border-border bg-transparent text-text-muted hover:text-text data-[state=on]:border-accent-pink data-[state=on]:text-text data-[state=on]:bg-accent-pink/20",
            },
            size: {
                default: "h-8 px-3 min-w-10",
                sm: "h-7 px-2.5 min-w-9",
                lg: "h-9 px-3.5 min-w-12 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Toggle({
    className,
    variant,
    size,
    ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>) {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Toggle, toggleVariants };
