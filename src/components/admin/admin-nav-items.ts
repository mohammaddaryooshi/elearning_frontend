import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, GraduationCap, Users, FileText } from "lucide-react";

export interface AdminNavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
}

export interface AdminNavGroup {
    label: string;
    icon: LucideIcon;
    items: AdminNavItem[];
}

export const adminNavItems: AdminNavItem[] = [
    {
        href: "/admin",
        label: "داشبورد",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: "/admin/users",
        label: "مدیریت کاربران",
        icon: Users,
    },
    {
        href: "/admin/courses",
        label: "مدیریت دوره ها",
        icon: GraduationCap,
    },
];

export const adminNavGroups: AdminNavGroup[] = [
    {
        label: "مدیریت مقالات",
        icon: FileText,
        items: [
            {
                href: "/admin/articles/categories",
                label: "دسته‌بندی مقالات",
                icon: FileText,
            },
            {
                href: "/admin/articles/list",
                label: "لیست مقالات",
                icon: FileText,
            },
            {
                href: "/admin/articles/create",
                label: "افزودن مقاله جدید",
                icon: FileText,
            },
        ],
    },
];
