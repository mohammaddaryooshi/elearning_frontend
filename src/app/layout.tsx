import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { iranSans } from "@/lib/fonts";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "پنل آموزش آنلاین",
    description: "Next.js + NestJS OTP Auth",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <body className={`${iranSans.variable} font-sans`}>
                <Providers>{children}</Providers>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
