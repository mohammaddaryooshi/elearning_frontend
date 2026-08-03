import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { iranSans } from "@/lib/fonts";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
        <html lang="fa" dir="rtl" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <body className={`${iranSans.variable} font-sans`}>
                <Providers>{children}</Providers>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
