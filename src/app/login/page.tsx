import GoogleSignIn from "@/components/google-sign-in";

export default function LoginPage() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <GoogleSignIn />
            </div>
        </div>
    );
}
