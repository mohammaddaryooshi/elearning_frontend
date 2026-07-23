import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/admin", label: "داشبورد" },
    { href: "/admin/courses", label: "دوره ها" },
    { href: "/admin/users", label: "کاربران" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="container space-y-6 py-8">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
                {navItems.map((item) => (
                    <Button key={item.href} variant="ghost" asChild>
                        <Link href={item.href}>{item.label}</Link>
                    </Button>
                ))}
            </div>
            {children}
        </div>
    );
}
