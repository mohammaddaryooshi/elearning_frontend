"use client";

import { useMemo, useState } from "react";
import {
    CheckCheck,
    Mail,
    MailOpen,
    Search,
    Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ContactMessagesTable,
    type AdminContactMessageRow,
} from "@/features/admin/contact-us-messages/components/ContactUsMessagesTable";

// ─── mock data ────────────────────────────────────────────────────────────────
const initialMessages: AdminContactMessageRow[] = [
    {
        id: "1",
        full_name: "علی رضایی",
        phone: "09121234567",
        email: "ali@example.com",
        message: "سلام، می‌خواستم بدانم آیا دوره‌های جدیدی در حوزه هوش مصنوعی اضافه خواهد شد؟",
        is_read: false,
        created_at: "1405/05/01",
    },
    {
        id: "2",
        full_name: "مریم کریمی",
        phone: "09139876543",
        email: "maryam@example.com",
        message: "مشکلی در پرداخت آنلاین داشتم. لطفاً راهنمایی کنید.",
        is_read: false,
        created_at: "1405/05/03",
    },
    {
        id: "3",
        full_name: "حسین محمدی",
        phone: "09154443322",
        email: "hossein@example.com",
        message: "آیا امکان صدور گواهینامه برای دوره‌های تکمیل شده وجود دارد؟",
        is_read: true,
        created_at: "1405/05/05",
    },
    {
        id: "4",
        full_name: "زهرا احمدی",
        phone: "09167778899",
        email: "zahra@example.com",
        message: "قیمت‌های دوره‌ها کمی بالاست. آیا تخفیفی برای دانشجویان در نظر گرفته‌اید؟",
        is_read: true,
        created_at: "1405/05/07",
    },
    {
        id: "5",
        full_name: "امیر حسینی",
        phone: "09101112233",
        email: "amir@example.com",
        message: "وبسایت روی موبایل درست نمایش داده نمی‌شود.",
        is_read: false,
        created_at: "1405/05/10",
    },
];

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function AdminContactMessagesPage() {
    const [messages, setMessages] =
        useState<AdminContactMessageRow[]>(initialMessages);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all");
    const [viewTarget, setViewTarget] = useState<AdminContactMessageRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminContactMessageRow | null>(null);

    // ─── mark as read ─────────────────────────────────────────────────────────
    const handleMarkRead = (msg: AdminContactMessageRow) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
    };

    // ─── view → auto mark read ────────────────────────────────────────────────
    const handleView = (msg: AdminContactMessageRow) => {
        setViewTarget(msg);
        if (!msg.is_read) handleMarkRead(msg);
    };

    // ─── delete ───────────────────────────────────────────────────────────────
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    // ─── mark all read ────────────────────────────────────────────────────────
    const handleMarkAllRead = () => {
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
    };

    // ─── filtered ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = messages;

        if (statusFilter === "read") result = result.filter((m) => m.is_read);
        if (statusFilter === "unread") result = result.filter((m) => !m.is_read);

        const q = search.trim().toLowerCase();
        if (!q) return result;

        return result.filter(
            (m) =>
                m.full_name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.phone.includes(q) ||
                m.message.toLowerCase().includes(q)
        );
    }, [search, statusFilter, messages]);

    // ─── stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(
        () => ({
            total: messages.length,
            unread: messages.filter((m) => !m.is_read).length,
            read: messages.filter((m) => m.is_read).length,
        }),
        [messages]
    );

    return (
        <div className="space-y-6">
            {/* header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">پیام‌های تماس با ما</h2>
                <p className="text-sm text-muted-foreground">
                    مشاهده و مدیریت پیام‌های دریافتی از فرم تماس با ما.
                </p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="کل پیام‌ها" value={stats.total} icon={<Mail className="h-5 w-5" />} />
                <StatCard label="خوانده نشده" value={stats.unread} icon={<Mail className="h-5 w-5" />} />
                <StatCard label="خوانده شده" value={stats.read} icon={<MailOpen className="h-5 w-5" />} />
            </div>

            {/* table card */}
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>لیست پیام‌ها</CardTitle>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو در نام، ایمیل یا پیام..."
                                className="w-full pr-9 sm:w-64"
                            />
                        </div>

                        {/* status filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) =>
                                setStatusFilter(v as "all" | "read" | "unread")
                            }
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه</SelectItem>
                                <SelectItem value="unread">خوانده نشده</SelectItem>
                                <SelectItem value="read">خوانده شده</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* mark all read */}
                        {stats.unread > 0 && (
                            <Button variant="outline" onClick={handleMarkAllRead} className="gap-2">
                                <CheckCheck className="h-4 w-4" />
                                علامت همه خوانده
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <ContactMessagesTable
                        data={filtered}
                        onView={handleView}
                        onMarkRead={handleMarkRead}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── view dialog ──────────────────────────────────────────────── */}
            <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MailOpen className="h-5 w-5 text-primary" />
                            پیام از {viewTarget?.full_name}
                        </DialogTitle>
                        <DialogDescription className="flex flex-col gap-1 text-right">
                            <span>ایمیل: {viewTarget?.email}</span>
                            <span>شماره: {viewTarget?.phone}</span>
                            {viewTarget?.created_at && (
                                <span>تاریخ: {viewTarget.created_at}</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-7">
                        {viewTarget?.message}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setViewTarget(null)}>بستن</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── delete confirm dialog ────────────────────────────────────── */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            حذف پیام
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف پیام «{deleteTarget?.full_name}» اطمینان دارید؟ این
                            عملیات قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف پیام
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
