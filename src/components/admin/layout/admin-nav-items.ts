import type { LucideIcon } from "lucide-react";
import {
    LayoutDashboard, GraduationCap, Users, FileText,
    MessagesSquare, FolderPlus, ListOrdered, ChartColumnStacked,
    UserPen, UserRoundKey, ContactRound, BadgePercent,
    ShoppingBag, BellRing, Settings,
    FolderUp,
} from "lucide-react";

export interface AdminNavLink {
    type: "link";
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
}

export interface AdminNavGroup {
    type: "group";
    label: string;
    icon: LucideIcon;
    items: Omit<AdminNavLink, "type" | "exact">[];
}

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

export const adminNav: AdminNavEntry[] = [
    {
        type: "link",
        href: "/admin",
        label: "داشبورد",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        type: "group",
        label: "مدیریت مقالات",
        icon: FileText,
        items: [
            { href: "/admin/articles/categories", label: "دسته‌بندی مقالات", icon: FileText },
            { href: "/admin/articles/list", label: "لیست مقالات", icon: ListOrdered },
            { href: "/admin/articles/create", label: "افزودن مقاله جدید", icon: FolderPlus },
            { href: "/admin/articles/comments", label: "کامنت های مقالات", icon: MessagesSquare },
        ],
    },
    {
        type: "group",
        label: "مدیریت دوره ها",
        icon: GraduationCap,
        items: [
            { href: "/admin/courses/categories", label: "دسته‌بندی دوره ها", icon: ChartColumnStacked },
            { href: "/admin/courses/list", label: "لیست دوره ها", icon: ListOrdered },
            { href: "/admin/courses/create", label: "افزودن دوره جدید", icon: FolderPlus },
            { href: "/admin/courses/instructors", label: "مدرس ها", icon: UserPen },
            { href: "/admin/courses/comments", label: "کامنت های دوره ها", icon: MessagesSquare },
        ],
    },
    {
        type: "link",
        href: "/admin/discount-codes",
        label: "مدیریت کد های تخفیف",
        icon: BadgePercent,
    },
    {
        type: "link",
        href: "/admin/orders",
        label: "مدیریت سفارشات",
        icon: ShoppingBag,
    },
    {
        type: "link",
        href: "/admin/users",
        label: "مدیریت کاربران",
        icon: Users,
    },
    {
        type: "group",
        label: "مدیریت سطوح دسترسی",
        icon: UserRoundKey,
        items: [
            { href: "/admin/roles", label: "مدیریت رول ها", icon: UserRoundKey },
            { href: "/admin/permissions", label: "مدیریت پرمیشن ها", icon: UserRoundKey },
        ],
    },
    {
        type: "link",
        href: "/admin/media",
        label: "مدیریت فایل ها",
        icon: FolderUp,
    },
    {
        type: "link",
        href: "/admin/notifications",
        label: "مدیریت اعلان های کاربران",
        icon: BellRing,
    },
    {
        type: "link",
        href: "/admin/contact-us-messages",
        label: "مدیریت پیغام های ارتباط با ما",
        icon: ContactRound,
    },
    {
        type: "link",
        href: "/admin/site-settings",
        label: "مدیریت تنظیمات سایت",
        icon: Settings,
    },
];
