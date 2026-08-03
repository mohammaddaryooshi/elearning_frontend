"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { adminNav, type AdminNavEntry } from "@/components/admin/layout/admin-nav-items";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSidebarContentProps {
    collapsed?: boolean;
    onNavigate?: () => void;
}

export function AdminSidebarContent({ collapsed = false, onNavigate }: AdminSidebarContentProps) {
    const pathname = usePathname();

    const renderEntry = (entry: AdminNavEntry, index: number) => {
        if (entry.type === "link") {
            const isActive = entry.exact
                ? pathname === entry.href
                : pathname === entry.href || pathname?.startsWith(`${entry.href}/`);
            const Icon = entry.icon;

            const link = (
                <Link
                    key={entry.href}
                    href={entry.href}
                    onClick={onNavigate}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-2",
                        isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{entry.label}</span>}
                </Link>
            );

            if (!collapsed) return link;

            return (
                <Tooltip key={entry.href} delayDuration={200}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="left">{entry.label}</TooltipContent>
                </Tooltip>
            );
        }

        if (entry.type === "group") {
            if (collapsed) return null;

            const GroupIcon = entry.icon;
            const isGroupActive = entry.items.some(
                (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
            );

            return (
                <Accordion
                    key={`group-${index}`}
                    type="single"
                    collapsible
                    defaultValue={isGroupActive ? entry.label : undefined}
                >
                    <AccordionItem value={entry.label} className="border-none">
                        <AccordionTrigger
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:no-underline",
                                isGroupActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <GroupIcon className="h-5 w-5 shrink-0" />
                                <span className="truncate">{entry.label}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pt-1">
                            <div className="mr-4 space-y-1.5 border-r pr-2">
                                {entry.items.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                                    const ItemIcon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onNavigate}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <ItemIcon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        }

        return null;
    };

    return (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    "flex h-16 items-center gap-2 border-b px-4",
                    collapsed && "justify-center px-2"
                )}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5" />
                </div>
                {!collapsed && (
                    <div className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-sm font-semibold text-foreground">پنل مدیریت</span>
                        <span className="truncate text-xs text-muted-foreground">آکادمی آنلاین</span>
                    </div>
                )}
            </div>

            <nav
                className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
                aria-label="منوی پنل مدیریت"
            >
                {adminNav.map((entry, index) => renderEntry(entry, index))}
            </nav>

            {!collapsed && (
                <div className="border-t p-4">
                    <p className="text-center text-xs text-muted-foreground">
                        نسخه پنل مدیریت ۱٫۰
                    </p>
                </div>
            )}
        </div>
    );
}
