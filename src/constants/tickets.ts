import { TicketStatus, TicketPriority, TicketCategory } from "@/features/admin/tickets/types/tickets.type";


export const STATUS_LABELS: Record<TicketStatus, string> = {
    open: "باز",
    in_progress: "در حال بررسی",
    resolved: "حل شده",
    closed: "بسته",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
    open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    closed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    urgent: "فوری",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
    low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    high: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    urgent: "bg-red-500/10 text-red-600 border-red-500/20",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
    technical: "فنی",
    billing: "مالی",
    course: "دوره آموزشی",
    account: "حساب کاربری",
    other: "سایر",
};
