import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string | undefined | null): string {
    if (!name) return "??";
    const firstLetter = name.charAt(0).toUpperCase();
    const secondLetter = name.charAt(1).toLowerCase();
    return `${firstLetter}${secondLetter}`;
}
