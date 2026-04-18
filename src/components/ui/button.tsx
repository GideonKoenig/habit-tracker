import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-accent-pink focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "border-transparent bg-accent-pink px-4 py-2 text-text shadow-lg hover:bg-accent-pink/90",
                destructive: "border-transparent bg-error px-4 py-2 text-text hover:bg-error/90",
                outline: "border-border bg-bg-elevated px-4 py-2 text-text hover:bg-bg-hover",
                secondary: "border-transparent bg-bg-elevated px-4 py-2 text-text hover:bg-bg-hover",
                task: "border-accent-pink/40 bg-accent-pink/60 px-4 py-4 text-text shadow-lg hover:bg-accent-pink/50 focus-visible:ring-offset-bg",
                taskDone:
                    "border-border bg-bg-elevated px-4 py-4 text-text hover:bg-bg-hover focus-visible:ring-offset-bg",
                ghost: "border-transparent bg-transparent px-3 py-1.5 text-text-muted hover:text-text hover:bg-bg-hover",
                link: "border-transparent bg-transparent px-0 py-0 text-text underline-offset-4 hover:text-accent-pink hover:underline",
            },
            size: {
                default: "h-9 px-4",
                sm: "h-8 px-3 text-xs",
                lg: "h-11 px-6 text-base",
                icon: "h-9 w-9",
                "icon-sm": "h-8 w-8 text-sm",
                "icon-lg": "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
