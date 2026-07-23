"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/common/scroll-progress";
import { ThemeToggle } from "@/components/common/theme-toggle";

const links = [
    { href: "/", label: "خانه" },
    { href: "/courses", label: "دوره های آموزشی" },
    { href: "/articles", label: "مقالات" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس با ما" },
];

const cartCount = 2;

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <div className="container flex h-16 items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1  items-center justify-start gap-2">
                    <Link href="/" className="shrink-0 text-sm font-semibold text-foreground sm:text-base">
                        آکادمی آنلاین
                    </Link>

                    <nav className="flex items-center gap-1" aria-label="منوی اصلی سایت">
                        {links.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Button key={link.href} variant={isActive ? "default" : "ghost"} asChild>
                                    <Link href={link.href}>{link.label}</Link>
                                </Button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Button variant="outline" size="sm" asChild>
                        <Link href="/cart" className="relative">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="sr-only">سبد خرید</span>
                            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
                                {cartCount}
                            </span>
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href="/login">ورود / ثبت نام</Link>
                    </Button>
                </div>
            </div>
            <ScrollProgress />
        </header>
    );
}
