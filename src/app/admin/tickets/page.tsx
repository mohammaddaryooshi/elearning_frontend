"use client";

import { useState } from "react";
import {
    TicketCheck,
    Clock,
    AlertCircle,
    Plus,
    Search,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


import {
    STATUS_LABELS,
    PRIORITY_LABELS,
    CATEGORY_LABELS,
} from "@/constants/tickets";
import { AdminTicketRow, TicketCategory, TicketDetail, TicketPriority, TicketStatus } from "@/features/admin/tickets/types/tickets.type";
import { TicketsTable } from "@/features/admin/tickets/components/ticketsTable";
import { TicketReplySheet } from "@/features/admin/tickets/components/TicketReplySheet";

// ─── Mock Data ──────────────────────────────────────────────
const MOCK_MESSAGES = [
    {
        id: "m1",
        ticket_id: "t1",
        sender_id: "u1",
        sender_name: "علی رضایی",
        sender_role: "user" as const,
        body: "سلام، مشکلی در پخش ویدیو دوره دارم.",
        created_at: "۱۴۰۵/۰۴/۱۰",
    },
    {
        id: "m2",
        ticket_id: "t1",
        sender_id: "a1",
        sender_name: "پشتیبانی",
        sender_role: "admin" as const,
        body: "سلام، لطفاً مرورگر خود را آپدیت کنید.",
        created_at: "۱۴۰۵/۰۴/۱۱",
    },
];

const MOCK_TICKETS: AdminTicketRow[] = [
    {
        id: "t1",
        subject: "مشکل در پخش ویدیو دوره React",
        status: "open",
        priority: "high",
        category: "technical",
        user_id: "u1",
        user_name: "علی رضایی",
        user_email: "ali@example.com",
        messages_count: 2,
        last_message_at: "۱۴۰۵/۰۴/۱۱",
        created_at: "۱۴۰۵/۰۴/۱۰",
    },
    {
        id: "t2",
        subject: "سوال درباره فاکتور خرید",
        status: "in_progress",
        priority: "medium",
        category: "billing",
        user_id: "u2",
        user_name: "مریم احمدی",
        user_email: "maryam@example.com",
        messages_count: 5,
        last_message_at: "۱۴۰۵/۰۴/۱۲",
        created_at: "۱۴۰۵/۰۴/۰۹",
    },
    {
        id: "t3",
        subject: "درخواست ریست رمز عبور",
        status: "resolved",
        priority: "low",
        category: "account",
        user_id: "u3",
        user_name: "حسین کریمی",
        user_email: "hosein@example.com",
        messages_count: 3,
        last_message_at: "۱۴۰۵/۰۴/۰۸",
        created_at: "۱۴۰۵/۰۴/۰۷",
    },
];
// ────────────────────────────────────────────────────────────

const STATS = [
    {
        label: "باز",
        value: 12,
        icon: AlertCircle,
        color: "text-blue-600",
        bg: "bg-blue-500/10",
    },
    {
        label: "در حال بررسی",
        value: 5,
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
    },
    {
        label: "حل شده",
        value: 38,
        icon: TicketCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
    },
];

export default function AdminTicketsPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
    const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
    const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");

    const [replyTicket, setReplyTicket] = useState<TicketDetail | null>(null);
    const [replyOpen, setReplyOpen] = useState(false);
    const [deleteTicket, setDeleteTicket] = useState<AdminTicketRow | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filtered = MOCK_TICKETS.filter((t) => {
        const matchSearch =
            !search ||
            t.subject.includes(search) ||
            t.user_name.includes(search) ||
            t.user_email.includes(search);
        const matchStatus = filterStatus === "all" || t.status === filterStatus;
        const matchPriority =
            filterPriority === "all" || t.priority === filterPriority;
        const matchCategory =
            filterCategory === "all" || t.category === filterCategory;
        return matchSearch && matchStatus && matchPriority && matchCategory;
    });

    const handleView = (t: AdminTicketRow) => {
        setReplyTicket({ ...t, messages: MOCK_MESSAGES });
        setReplyOpen(true);
    };

    const handleReply = (t: AdminTicketRow) => {
        setReplyTicket({ ...t, messages: MOCK_MESSAGES });
        setReplyOpen(true);
    };

    const handleReplySubmit = async (
        ticketId: string,
        values: { body: string; status: TicketStatus; priority: TicketPriority }
    ) => {
        setIsSubmitting(true);
        // TODO: API call
        await new Promise((r) => setTimeout(r, 800));
        console.log("Reply:", ticketId, values);
        setIsSubmitting(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTicket) return;
        // TODO: API call
        console.log("Delete:", deleteTicket.id);
        setDeleteTicket(null);
    };

    return (
        <div className="flex flex-col gap-6 p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">مدیریت تیکت‌ها</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        پاسخ‌دهی و مدیریت درخواست‌های پشتیبانی
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    تیکت جدید
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {STATS.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl border bg-card p-4 flex items-center gap-4"
                    >
                        <div className={`${s.bg} ${s.color} p-2.5 rounded-lg`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="جستجو موضوع، نام یا ایمیل..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9"
                        dir="rtl"
                    />
                </div>

                <Select
                    value={filterStatus}
                    onValueChange={(v) => setFilterStatus(v as TicketStatus | "all")}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                        {(Object.entries(STATUS_LABELS) as [TicketStatus, string][]).map(
                            ([val, label]) => (
                                <SelectItem key={val} value={val}>
                                    {label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                <Select
                    value={filterPriority}
                    onValueChange={(v) => setFilterPriority(v as TicketPriority | "all")}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="اولویت" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه اولویت‌ها</SelectItem>
                        {(Object.entries(PRIORITY_LABELS) as [TicketPriority, string][]).map(
                            ([val, label]) => (
                                <SelectItem key={val} value={val}>
                                    {label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                <Select
                    value={filterCategory}
                    onValueChange={(v) => setFilterCategory(v as TicketCategory | "all")}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه دسته‌ها</SelectItem>
                        {(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(
                            ([val, label]) => (
                                <SelectItem key={val} value={val}>
                                    {label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                {(filterStatus !== "all" ||
                    filterPriority !== "all" ||
                    filterCategory !== "all" ||
                    search) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-muted-foreground"
                            onClick={() => {
                                setSearch("");
                                setFilterStatus("all");
                                setFilterPriority("all");
                                setFilterCategory("all");
                            }}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            پاک کردن فیلترها
                        </Button>
                    )}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card">
                <TicketsTable
                    data={filtered}
                    onView={handleView}
                    onReply={handleReply}
                    onDelete={(t) => setDeleteTicket(t)}
                />
            </div>

            {/* Reply Sheet */}
            <TicketReplySheet
                ticket={replyTicket}
                open={replyOpen}
                onOpenChange={setReplyOpen}
                onSubmit={handleReplySubmit}
                isSubmitting={isSubmitting}
            />

            {/* Delete Dialog */}
            <Dialog
                open={!!deleteTicket}
                onOpenChange={(open) => !open && setDeleteTicket(null)}
            >
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>حذف تیکت</DialogTitle>
                        <DialogDescription>
                            آیا از حذف تیکت{" "}
                            <span className="font-medium text-foreground">
                                «{deleteTicket?.subject}»
                            </span>{" "}
                            مطمئن هستید؟ این عمل قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row-reverse gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleDeleteConfirm}
                        >
                            حذف
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTicket(null)}
                        >
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
