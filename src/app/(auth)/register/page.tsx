import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { sanitizePendingOtpContact } from "@/lib/auth/contact";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type RegisterPageProps = {
    searchParams: Promise<{
        identifier?: string | string[];
        redirect?: string | string[];
    }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const params = await searchParams;

    const identifierParam = Array.isArray(params.identifier)
        ? params.identifier[0]
        : params.identifier;
    const redirectParam = Array.isArray(params.redirect)
        ? params.redirect[0]
        : params.redirect;

    const otpContact = sanitizePendingOtpContact({
        identifier: identifierParam,
    });

    if (!otpContact) {
        redirect("/login");
    }

    return (
        <main className="container flex min-h-screen items-center py-8">
            <RegisterForm
                identifier={otpContact.identifier}
                redirect={getSafeRedirectPath(redirectParam)}
            />
        </main>
    );
}
