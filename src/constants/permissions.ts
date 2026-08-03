import type { PermissionResource, PermissionAction } from "@/features/admin/role-and-permissions/types/permission.type";

export const RESOURCE_LABELS: Record<PermissionResource, string> = {
    users: "کاربران",
    roles: "نقش‌ها",
    courses: "دوره‌ها",
    lessons: "درس‌ها",
    categories: "دسته‌بندی‌ها",
    orders: "سفارش‌ها",
    payments: "پرداخت‌ها",
    coupons: "کوپن‌ها",
    comments: "نظرات",
    notifications: "اعلان‌ها",
    settings: "تنظیمات",
    reports: "گزارش‌ها",
};

export const RESOURCE_ICONS: Record<PermissionResource, string> = {
    users: "👤",
    roles: "🛡️",
    courses: "📚",
    lessons: "📖",
    categories: "🗂️",
    orders: "🛒",
    payments: "💳",
    coupons: "🏷️",
    comments: "💬",
    notifications: "🔔",
    settings: "⚙️",
    reports: "📊",
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
    create: "ایجاد",
    read: "مشاهده",
    update: "ویرایش",
    delete: "حذف",
    manage: "مدیریت کامل",
};

export const ACTION_COLORS: Record<PermissionAction, string> = {
    create: "bg-green-100 text-green-700dark:bg-green-900/30dark:text-green-400",
    read: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    update: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    manage: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};
