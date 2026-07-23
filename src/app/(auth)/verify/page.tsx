import { Suspense } from "react";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";

export default function VerifyPage() {
    return (
        <main className="container flex min-h-screen items-center py-8">
            <Suspense fallback={null}>
                <OtpVerifyForm />
            </Suspense>
        </main>
    );
}
