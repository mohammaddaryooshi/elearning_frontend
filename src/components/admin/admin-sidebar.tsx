"use client";

import { cn } from "@/lib/utils/cn";
import { AdminSidebarContent } from "@/components/admin/admin-sidebar-content";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AdminSidebarProps {
    collapsed: boolean;
}

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
    return (
        <TooltipProvider>
            <aside
                className={cn(
                    "sticky top-0 hidden h-screen shrink-0 border-l bg-card transition-[width] duration-200 lg:block",
                    collapsed ? "w-[76px]" : "w-64"
                )}
            >
                <AdminSidebarContent collapsed={collapsed} />
            </aside>
        </TooltipProvider>
    );
}
