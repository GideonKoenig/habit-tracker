import GoogleSignIn from "@/components/google-sign-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="bg-bg-elevated/60 w-full max-w-md backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                </CardHeader>
                <CardContent>
                    <GoogleSignIn />
                </CardContent>
            </Card>
        </div>
    );
}
