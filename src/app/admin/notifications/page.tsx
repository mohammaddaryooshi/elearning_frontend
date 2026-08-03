"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Bell,
    Globe,
    Plus,
    Search,
    Trash2,
    User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    NotificationsTable,
    type AdminNotificationRow,
} from "@/components/admin/notifications-table";

// ─── mock users برای انتخاب گیرنده ───────────────────────────────────────────
const MOCK_USERS = [
    { id: "1", name: "مریم احمدی" },
    { id: "2", name: "علی شفیعی" },
    { id: "3", name: "رضا محمدی" },
    { id: "4", name: "سارا کریمی" },
];

// ─── mock notifications ───────────────────────────────────────────────────────
const initialNotifications: AdminNotificationRow[] = [
    {
        id: "1",
        title: "بروزرسانی سیستم",
        message: "سیستم در تاریخ ۱۴۰۵/۰۵/۱۵ ساعت ۲ بامداد برای بروزرسانی در دسترس نخواهد بود.",
        is_read: false,
        is_global: true,
        created_at: "1405/05/01",
    },
    {
        id: "2",
        title: "تأیید ثبت‌نام دوره",
        message: "ثبت‌نام شما در دوره React پیشرفته با موفقیت انجام شد.",
        is_read: true,
        is_global: false,
        user_id: "1",
        user_name: "مریم احمدی",
        created_at: "1405/05/03",
    },
    {
        id: "3",
        title: "پیام ویژه",
        message: "حساب کاربری شما با موفقیت تأیید شد.",
        is_read: false,
        is_global: false,
        user_id: "2",
        user_name: "علی شفیعی",
        created_at: "1405/05/05",
    },
];

// ─── form type ────────────────────────────────────────────────────────────────
interface NotificationFormValues {
    title: string;
    message: string;
    is_global: boolean;
    user_id: string;
}

// ─── stats card ───────────────────────────────────────────────────────────────
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
export default function AdminNotificationsPage() {
    const [notifications, setNotifications] =
        useState<AdminNotificationRow[]>(initialNotifications);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminNotificationRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminNotificationRow | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<NotificationFormValues>({
        defaultValues: {
            title: "",
            message: "",
            is_global: true,
            user_id: "",
        },
    });

    const isGlobal = watch("is_global");

    // ─── open create dialog ───────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        reset({ title: "", message: "", is_global: true, user_id: "" });
        setFormOpen(true);
    };

    // ─── open edit dialog ─────────────────────────────────────────────────────
    const openEdit = (n: AdminNotificationRow) => {
        setEditTarget(n);
        reset({
            title: n.title,
            message: n.message,
            is_global: n.is_global,
            user_id: n.user_id ?? "",
        });
        setFormOpen(true);
    };

    // ─── submit ───────────────────────────────────────────────────────────────
    const onSubmit = (values: NotificationFormValues) => {
        const targetUser = !values.is_global
            ? MOCK_USERS.find((u) => u.id === values.user_id)
            : null;

        if (editTarget) {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === editTarget.id
                        ? {
                            ...n,
                            title: values.title,
                            message: values.message,
                            is_global: values.is_global,
                            user_id: values.is_global ? null : values.user_id,
                            user_name: targetUser?.name ?? null,
                        }
                        : n
                )
            );
        } else {
            const newNotification: AdminNotificationRow = {
                id: crypto.randomUUID(),
                title: values.title,
                message: values.message,
                is_read: false,
                is_global: values.is_global,
                user_id: values.is_global ? null : values.user_id,
                user_name: targetUser?.name ?? null,
                created_at: new Date().toLocaleDateString("fa-IR"),
            };
            setNotifications((prev) => [newNotification, ...prev]);
        }

        setFormOpen(false);
        setEditTarget(null);
    };

    // ─── delete ───────────────────────────────────────────────────────────────
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    // ─── filtered ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return notifications;
        return notifications.filter(
            (n) =>
                n.title.toLowerCase().includes(q) ||
                n.message.toLowerCase().includes(q) ||
                (n.user_name ?? "").includes(q)
        );
    }, [search, notifications]);

    // ─── stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(
        () => ({
            total: notifications.length,
            global: notifications.filter((n) => n.is_global).length,
            unread: notifications.filter((n) => !n.is_global && !n.is_read).length,
        }),
        [notifications]
    );

    return (
        <div className="space-y-6">
            {/* header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت اعلان‌ها</h2>
                <p className="text-sm text-muted-foreground">
                    ارسال و مدیریت اعلان‌های عمومی و اختصاصی برای کاربران.
                </p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="کل اعلان‌ها" value={stats.total} icon={<Bell className="h-5 w-5" />} />
                <StatCard label="اعلان عمومی" value={stats.global} icon={<Globe className="h-5 w-5" />} />
                <StatCard label="خوانده نشده" value={stats.unread} icon={<User className="h-5 w-5" />} />
            </div>

            {/* table card */}
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>لیست اعلان‌ها</CardTitle>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو در عنوان، متن یا کاربر..."
                                className="w-full pr-9 sm:w-64"
                            />
                        </div>
                        <Button onClick={openCreate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            اعلان جدید
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <NotificationsTable
                        data={filtered}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── create / edit dialog ─────────────────────────────────────── */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <DialogHeader>
                            <DialogTitle>
                                {editTarget ? "ویرایش اعلان" : "اعلان جدید"}
                            </DialogTitle>
                            <DialogDescription>
                                {editTarget
                                    ? "اطلاعات اعلان را ویرایش کنید."
                                    : "اعلان جدید برای همه کاربران یا یک کاربر خاص تعریف کنید."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                            {/* عنوان */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title">عنوان</Label>
                                <Input
                                    id="title"
                                    placeholder="مثال: بروزرسانی سیستم"
                                    {...register("title", { required: "عنوان الزامی است" })}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title.message}</p>
                                )}
                            </div>

                            {/* متن */}
                            <div className="space-y-1.5">
                                <Label htmlFor="message">متن پیام</Label>
                                <Textarea
                                    id="message"
                                    rows={4}
                                    placeholder="متن اعلان را بنویسید..."
                                    {...register("message", { required: "متن پیام الزامی است" })}
                                />
                                {errors.message && (
                                    <p className="text-xs text-destructive">{errors.message.message}</p>
                                )}
                            </div>

                            {/* اعلان عمومی toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">اعلان عمومی</Label>
                                    <p className="text-xs text-muted-foreground">
                                        برای همه کاربران ارسال شود
                                    </p>
                                </div>
                                <Switch
                                    checked={isGlobal}
                                    onCheckedChange={(val) => {
                                        setValue("is_global", val);
                                        if (val) setValue("user_id", "");
                                    }}
                                />
                            </div>

                            {/* انتخاب کاربر — فقط وقتی عمومی نیست */}
                            {!isGlobal && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="user_id">کاربر</Label>
                                    <select
                                        id="user_id"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        {...register("user_id", {
                                            validate: (v) =>
                                                isGlobal || !!v || "انتخاب کاربر الزامی است",
                                        })}
                                    >
                                        <option value="">کاربر را انتخاب کنید...</option>
                                        {MOCK_USERS.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.user_id.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* preview badge */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>گیرنده:</span>
                                {isGlobal ? (
                                    <Badge variant="secondary" className="gap-1">
                                        <Globe className="h-3 w-3" />
                                        همه کاربران
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="gap-1">
                                        <User className="h-3 w-3" />
                                        {MOCK_USERS.find((u) => u.id === watch("user_id"))?.name ?? "انتخاب نشده"}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="submit">
                                {editTarget ? "ذخیره تغییرات" : "ارسال اعلان"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                            >
                                انصراف
                            </Button>
                        </DialogFooter>
                    </form>
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
                            حذف اعلان
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف اعلان «{deleteTarget?.title}» اطمینان دارید؟ این عملیات
                            قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف اعلان
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
