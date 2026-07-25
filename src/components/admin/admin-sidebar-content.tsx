"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";
import { adminNavItems, adminNavGroups } from "@/components/admin/admin-nav-items";
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

            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" aria-label="منوی پنل مدیریت">
                {adminNavItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    const link = (
                        <Link
                            key={item.href}
                            href={item.href}
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
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );

                    if (!collapsed) {
                        return link;
                    }

                    return (
                        <Tooltip key={item.href} delayDuration={200}>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="left">{item.label}</TooltipContent>
                        </Tooltip>
                    );
                })}

                {/* آکاردئون گروه‌ها */}
                {!collapsed && adminNavGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const isGroupActive = group.items.some(item => 
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                    );

                    return (
                        <Accordion key={group.label} type="single" collapsible defaultValue={isGroupActive ? group.label : undefined}>
                            <AccordionItem value={group.label} className="border-none">
                                <AccordionTrigger className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:no-underline",
                                    isGroupActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <GroupIcon className="h-5 w-5 shrink-0" />
                                        <span className="truncate">{group.label}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-0 pt-1">
                                    <div className="mr-4 space-y-1 border-r pr-2">
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href;
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
                                                    <span className="truncate">{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    );
                })}
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
