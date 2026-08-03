import { OtpLoginForm } from "@/features/auth/components/OtpLoginForm";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type LoginPageProps = {
    searchParams: Promise<{ redirect?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const redirectParam = Array.isArray(params.redirect)
        ? params.redirect[0]
        : params.redirect;
    const safeRedirect = getSafeRedirectPath(redirectParam);

    return (
        <main className="container flex min-h-screen items-center py-8">
            <OtpLoginForm redirect={safeRedirect} />
        </main>
    );
}
