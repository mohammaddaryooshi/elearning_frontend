import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { sanitizePendingOtpContact } from "@/lib/auth/contact";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type RegisterPageProps = {
    searchParams: Promise<{
        channel?: string | string[];
        identifier?: string | string[];
        redirect?: string | string[];
    }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const params = await searchParams;

    const channelParam = Array.isArray(params.channel)
        ? params.channel[0]
        : params.channel;
    const identifierParam = Array.isArray(params.identifier)
        ? params.identifier[0]
        : params.identifier;
    const redirectParam = Array.isArray(params.redirect)
        ? params.redirect[0]
        : params.redirect;

    const otpContact = sanitizePendingOtpContact({
        channel: channelParam,
        identifier: identifierParam,
    });

    if (!otpContact) {
        redirect("/login");
    }

    return (
        <main className="container flex min-h-screen items-center py-8">
            <RegisterForm
                channel={otpContact.channel}
                identifier={otpContact.identifier}
                redirect={getSafeRedirectPath(redirectParam)}
            />
        </main>
    );
}
