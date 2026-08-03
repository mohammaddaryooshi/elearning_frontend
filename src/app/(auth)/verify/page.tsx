import { Suspense } from "react";
import { OtpVerifyForm } from "@/features/auth/components/OtpVerifyForm";

export default function VerifyPage() {
    return (
        <main className="container flex min-h-screen items-center py-8">
            <Suspense fallback={null}>
                <OtpVerifyForm />
            </Suspense>
        </main>
    );
}
