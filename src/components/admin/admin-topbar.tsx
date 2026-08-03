"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Settings, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebarContent } from "@/components/admin/admin-sidebar-content";
import { useAppSelector } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";

interface AdminTopbarProps {
    mobileOpen: boolean;
    onMobileOpenChange: (open: boolean) => void;
    sidebarCollapsed: boolean;
    onToggleSidebarCollapsed: () => void;
}

function getInitials(name?: string | null) {
    if (!name) return "کا";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`;
}

export function AdminTopbar({
    mobileOpen,
    onMobileOpenChange,
    sidebarCollapsed,
    onToggleSidebarCollapsed,
}: AdminTopbarProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const user = useAppSelector((state) => state.auth.user);
    const fullName = user?.fullName ?? "مدیر سیستم";

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 lg:hidden"
                    aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
                    onClick={() => onMobileOpenChange(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
                <SheetContent side="right" className="w-72 p-0 sm:max-w-xs">
                    <SheetHeader className="sr-only">
                        <SheetTitle>منوی پنل مدیریت</SheetTitle>
                    </SheetHeader>
                    <AdminSidebarContent onNavigate={() => onMobileOpenChange(false)} />
                </SheetContent>
            </Sheet>

            <Button
                variant="outline"
                size="sm"
                className="hidden h-9 w-9 p-0 lg:flex"
                aria-label={sidebarCollapsed ? "باز کردن ساید بار" : "بستن ساید بار"}
                onClick={onToggleSidebarCollapsed}
            >
                <Menu className="h-4 w-4" />
            </Button>

            <div className="min-w-0 flex-1">
                <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
                    پنل مدیریت آکادمی آنلاین
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="relative h-9 w-9 p-0"
                    aria-label="اعلان ها"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        3
                    </span>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-full border border-transparent p-0.5 transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="منوی کاربر"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card flex flex-col items-end">
                        <DropdownMenuLabel className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{fullName}</span>
                            <span className="text-xs text-muted-foreground">مدیر سیستم</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild >
                            <Link href="/dashboard" className="flex items-center gap-2">
                                پنل کاربری
                                <UserIcon className="h-4 w-4" />
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                            تنظیمات
                            <Settings className="h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                            خروج از حساب
                            <LogOut className="h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
