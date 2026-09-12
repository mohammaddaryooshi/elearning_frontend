import type { LucideIcon } from "lucide-react";
import {
    LayoutDashboard, GraduationCap, Users, FileText,
    MessagesSquare, FolderPlus, ListOrdered, ChartColumnStacked,
    UserPen, UserRoundKey, ContactRound, BadgePercent,
    ShoppingBag, BellRing, Settings,
    FolderUp,
    Tickets,
} from "lucide-react";

export interface AdminNavLink {
    type: "link";
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
    roles?: string[];
    permissions?: string[];
}

export interface AdminNavGroup {
    type: "group";
    label: string;
    icon: LucideIcon;
    permissions?: string[];
    roles?: string[];
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
        roles: ["Admin"],
        permissions: ["admin.Dashboard"],

    },
    {
        type: "group",
        label: "مدیریت مقالات",
        icon: FileText,
        roles: ["Admin", "PostManagment"],
        items: [
            {
                href: "/admin/articles/categories",
                label: "دسته‌بندی مقالات",
                icon: FileText,
                permissions: ["admin.PostCategoryList"],
            },
            {
                href: "/admin/articles/list",
                label: "لیست مقالات",
                icon: ListOrdered,
                permissions: ["admin.PostList"],
            },
            {
                href: "/admin/articles/create",
                label: "افزودن مقاله جدید",
                icon: FolderPlus,
                permissions: ["admin.PostCreate"],
            },
            {
                href: "/admin/articles/comments",
                label: "کامنت های مقالات",
                icon: MessagesSquare,
                permissions: ["admin.PostCommentList"],
            },
        ],
    },
    {
        type: "group",
        label: "مدیریت دوره ها",
        icon: GraduationCap,
        roles: ["Admin", "CourseManagment"],
        items: [
            {
                href: "/admin/courses/categories",
                label: "دسته‌بندی دوره ها",
                icon: ChartColumnStacked,
                permissions: ["admin.CourseCategoryList"],
            },
            {
                href: "/admin/courses/list",
                label: "لیست دوره ها",
                icon: ListOrdered,
                permissions: ["admin.CourseList"],
            },
            {
                href: "/admin/courses/create",
                label: "افزودن دوره جدید",
                icon: FolderPlus,
                permissions: ["admin.CourseCreate"],
            },
            {
                href: "/admin/courses/instructors",
                label: "مدرس ها",
                icon: UserPen,
                permissions: ["admin.CourseInstructorList"],
            },
            {
                href: "/admin/courses/comments",
                label: "کامنت های دوره ها",
                icon: MessagesSquare,
                permissions: ["admin.CourseCommentList"],
            },
        ],
    },
    {
        type: "link",
        href: "/admin/discount-codes",
        label: "مدیریت کد های تخفیف",
        icon: BadgePercent,
        permissions: ["admin.DiscountCodeList"],
    },
    {
        type: "link",
        href: "/admin/orders",
        label: "مدیریت سفارشات",
        icon: ShoppingBag,
        permissions: ["admin.OrderList"],
    },
    {
        type: "link",
        href: "/admin/users",
        label: "مدیریت کاربران",
        icon: Users,
        permissions: ["admin.UserList"],
    },
    {
        type: "group",
        label: "مدیریت سطوح دسترسی",
        icon: UserRoundKey,
        roles: ["Admin"],
        permissions: ["admin.AccessControl"],
        items: [
            {
                href: "/admin/roles",
                label: "مدیریت رول ها",
                icon: UserRoundKey,
                permissions: ["admin.RoleList"],
            },
            {
                href: "/admin/permissions",
                label: "مدیریت پرمیشن ها",
                icon: UserRoundKey,
                permissions: ["admin.PermissionList"],
            },
        ],
    },
    {
        type: "link",
        href: "/admin/media",
        label: "مدیریت فایل ها",
        icon: FolderUp,
        roles: ["Admin", "MediaManagment", "CourseManagment", "PostManagment"],
        permissions: ["admin.MediaList"],
    },
    {
        type: "link",
        href: "/admin/tickets",
        label: "مدیریت تیکت ها",
        icon: Tickets,
        roles: ["Admin", "TicketManagment"],
        permissions: ["admin.TicketList"],
    },
    {
        type: "link",
        href: "/admin/notifications",
        label: "مدیریت اعلان های کاربران",
        roles: ["Admin"],
        icon: BellRing,
        permissions: ["admin.NotificationList"],
    },
    {
        type: "link",
        href: "/admin/contact-us-messages",
        label: "مدیریت پیغام های ارتباط با ما",
        icon: ContactRound,
        roles: ["Admin"],
        permissions: ["admin.ContactMessageList"],
    },
    {
        type: "link",
        href: "/admin/site-settings",
        label: "مدیریت تنظیمات سایت",
        icon: Settings,
        roles: ["Admin"],
        permissions: ["admin.SiteSetting"],
    },
];
