"use client";

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/layout/admin-topbar";

const COLLAPSE_STORAGE_KEY = "admin-sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
}

function getServerSnapshot() {
    return false;
}

function setCollapsedPreference(next: boolean) {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
    listeners.forEach((listener) => listener());
}

export function AdminShell({ children }: { children: ReactNode }) {
    const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleCollapsed = useCallback(() => {
        setCollapsedPreference(!collapsed);
    }, [collapsed]);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar collapsed={collapsed} />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <AdminTopbar
                    mobileOpen={mobileOpen}
                    onMobileOpenChange={setMobileOpen}
                    sidebarCollapsed={collapsed}
                    onToggleSidebarCollapsed={toggleCollapsed}
                />
                <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
