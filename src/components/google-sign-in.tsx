"use client";
import { authClient } from "@/lib/auth-client";
import { tryCatch } from "@/lib/try-catch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@assets/google-icon";
import { Loader2 } from "lucide-react";

export default function GoogleSignIn() {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        const result = await tryCatch(
            authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
            }),
        );
        if (!result.success) console.error("Google sign-in failed");
        setLoading(false);
    };

    return (
        <Button className="w-full gap-3 text-sm" onClick={handleSignIn} variant="outline" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
    );
}
