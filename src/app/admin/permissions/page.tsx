"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Form, FormField, FormItem,
    FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Shield, Plus, Trash2, RefreshCw,
    Lock, Key, BarChart3,
} from "lucide-react";

import {
    ACTION_LABELS, RESOURCE_LABELS, RESOURCE_ICONS,
    ACTION_COLORS,
} from "@/constants/permissions";
import type {
    Permission, PermissionResource, PermissionAction,
} from "@/features/admin/role-and-permissions/types/permission.type";
import { cn } from "@/lib/utils/cn";
import { PermissionsTable } from "@/components/admin/permissions-table";

// ── mock data ────────────────────────────────────────────────────────────────
const MOCK_PERMISSIONS: Permission[] = [
    { id: 1, name: "users:read", label: "مشاهده کاربران", resource: "users", action: "read", is_system: true, roles_count: 3, created_at: "2025-01-01" },
    { id: 2, name: "users:create", label: "ایجاد کاربر", resource: "users", action: "create", is_system: true, roles_count: 2, created_at: "2025-01-01" },
    { id: 3, name: "users:update", label: "ویرایش کاربر", resource: "users", action: "update", is_system: true, roles_count: 2, created_at: "2025-01-01" },
    { id: 4, name: "users:delete", label: "حذف کاربر", resource: "users", action: "delete", is_system: true, roles_count: 1, created_at: "2025-01-01" },
    { id: 5, name: "courses:read", label: "مشاهده دوره‌ها", resource: "courses", action: "read", is_system: true, roles_count: 4, created_at: "2025-01-01" },
    { id: 6, name: "courses:create", label: "ایجاد دوره", resource: "courses", action: "create", is_system: true, roles_count: 2, created_at: "2025-01-01" },
    { id: 7, name: "courses:update", label: "ویرایش دوره", resource: "courses", action: "update", is_system: true, roles_count: 2, created_at: "2025-01-01" },
    { id: 8, name: "courses:delete", label: "حذف دوره", resource: "courses", action: "delete", is_system: true, roles_count: 1, created_at: "2025-01-01" },
    { id: 9, name: "payments:read", label: "مشاهده پرداخت‌ها", resource: "payments", action: "read", is_system: true, roles_count: 2, created_at: "2025-01-01" },
    { id: 10, name: "payments:manage", label: "مدیریت پرداخت‌ها", resource: "payments", action: "manage", is_system: true, roles_count: 1, created_at: "2025-01-01" },
    { id: 11, name: "settings:read", label: "مشاهده تنظیمات", resource: "settings", action: "read", is_system: true, roles_count: 1, created_at: "2025-01-01" },
    { id: 12, name: "settings:manage", label: "مدیریت تنظیمات", resource: "settings", action: "manage", is_system: true, roles_count: 1, created_at: "2025-01-01" },
    { id: 13, name: "reports:read", label: "مشاهده گزارش‌ها", resource: "reports", action: "read", is_system: false, roles_count: 2, created_at: "2025-03-01" },
    { id: 14, name: "comments:manage", label: "مدیریت نظرات", resource: "comments", action: "manage", is_system: false, roles_count: 1, created_at: "2025-03-01" },
];

// ── validation schema ─────────────────────────────────────────────────────────
const permissionSchema = z.object({
    name: z
        .string()
        .min(3, "حداقل ۳ کاراکتر")
        .regex(/^[a-z_]+:[a-z_]+$/, "فرمت باید resource:action باشد"),
    label: z.string().min(2, "حداقل ۲ کاراکتر"),
    description: z.string().optional(),
    resource: z.string().min(1, "منبع الزامی است"),
    action: z.string().min(1, "عملیات الزامی است"),
    is_system: z.boolean(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

// ── page──────────────────────────────────────────────────────────────────────
export default function AdminPermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Permission | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
    const [autoSlug, setAutoSlug] = useState(true);

    // ── stats ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const resources = new Set(permissions.map((p) => p.resource));
        const system = permissions.filter((p) => p.is_system).length;
        const custom = permissions.length - system;
        return { total: permissions.length, resources: resources.size, system, custom };
    }, [permissions]);

    // ── form ───────────────────────────────────────────────────────────────
    const form = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            name: "",
            label: "",
            description: "",
            resource: "",
            action: "",
            is_system: false,
        },
    });

    const watchResource = form.watch("resource");
    const watchAction = form.watch("action");

    // auto-generate slug
    const handleResourceOrActionChange = () => {
        if (!autoSlug || editTarget?.is_system) return;
        const r = form.getValues("resource");
        const a = form.getValues("action");
        if (r && a) form.setValue("name", `${r}:${a}`);
    };

    // ── handlers ───────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        form.reset({
            name: "", label: "", description: "",
            resource: "", action: "", is_system: false,
        });
        setAutoSlug(true);
        setSheetOpen(true);
    };

    const openEdit = (perm: Permission) => {
        setEditTarget(perm);
        form.reset({
            name: perm.name,
            label: perm.label,
            description: perm.description ?? "",
            resource: perm.resource,
            action: perm.action,
            is_system: perm.is_system,
        });
        setAutoSlug(false);
        setSheetOpen(true);
    };

    const onSubmit = (values: PermissionFormValues) => {
        if (editTarget) {
            setPermissions((prev) =>
                prev.map((p) =>
                    p.id === editTarget.id
                        ? {
                            ...p,
                            ...values,
                            resource: values.resource as PermissionResource,
                            action: values.action as PermissionAction,
                        }
                        : p
                )
            );
        } else {
            const newPerm: Permission = {
                id: Date.now(),
                roles_count: 0,
                created_at: new Date().toISOString(),
                ...values,
                resource: values.resource as PermissionResource,
                action: values.action as PermissionAction,
            };
            setPermissions((prev) => [...prev, newPerm]);
        }
        setSheetOpen(false);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setPermissions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 p-6">
            {/* ── header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Key className="h-6 w-6 text-primary" />
                        مدیریت دسترسی‌ها
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        تعریف و مدیریت Permission‌های سیستم
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    دسترسی جدید
                </Button>
            </div>

            {/* ── stats cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "کل دسترسی‌ها", value: stats.total, icon: Key, color: "text-primary" },
                    { label: "منابع", value: stats.resources, icon: BarChart3, color: "text-blue-500" },
                    { label: "سیستمی", value: stats.system, icon: Lock, color: "text-orange-500" },
                    { label: "سفارشی", value: stats.custom, icon: Shield, color: "text-green-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="border rounded-xl p-4 flex items-center gap-3 bg-card"
                    >
                        <div className={`p-2 rounded-lg bg-muted ${color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── table ───────────────────────────────────────────────── */}
            <PermissionsTable
                permissions={permissions}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
            />

            {/* ── sheet: create / edit ─────────────────────────────────── */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            {editTarget ? "ویرایش دسترسی" : "دسترسی جدید"}
                        </SheetTitle>
                        <SheetDescription>
                            {editTarget
                                ? `ویرایش Permission: ${editTarget.name}`
                                : "تعریف یک Permission جدید برای سیستم"}
                        </SheetDescription>
                    </SheetHeader><Separator className="my-4" />

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            {/* resource */}
                            <FormField
                                control={form.control}
                                name="resource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>منبع (Resource)</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(v) => {
                                                field.onChange(v);
                                                setTimeout(handleResourceOrActionChange, 0);
                                            }}
                                            disabled={Boolean(editTarget?.is_system)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="انتخاب منبع..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(RESOURCE_LABELS).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {RESOURCE_ICONS[key as PermissionResource]} {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* action */}
                            <FormField
                                control={form.control}
                                name="action"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>عملیات (Action)</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(v) => {
                                                field.onChange(v);
                                                setTimeout(handleResourceOrActionChange, 0);
                                            }}
                                            disabled={Boolean(editTarget?.is_system)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="انتخاب عملیات..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* auto slug */}
                            {!editTarget?.is_system && (
                                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                                    <div>
                                        <p className="text-sm font-medium">تولید خودکار کلید</p>
                                        <p className="text-xs text-muted-foreground">
                                            کلید بر اساس منبع و عملیات ساخته می‌شود
                                        </p>
                                    </div>
                                    <Switch
                                        checked={autoSlug}
                                        onCheckedChange={setAutoSlug}
                                    />
                                </div>
                            )}

                            {/* name/slug */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>کلید (Slug)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="users:read"
                                                disabled={autoSlug || Boolean(editTarget?.is_system)}
                                                dir="ltr"
                                                className="font-mono"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            فرمت: <code className="bg-muted px-1 rounded text-xs">resource:action</code>
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* label */}
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>عنوان نمایشی</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="مثال: مشاهده کاربران"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>توضیحات <span className="text-muted-foreground">(اختیاری)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="توضیح کوتاهی درباره این دسترسی..."
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* is_system — only visible in edit mode */}
                            {editTarget && (
                                <FormField
                                    control={form.control}
                                    name="is_system"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <FormLabel className="cursor-pointer">دسترسی سیستمی</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        دسترسی‌های سیستمی قابل حذف نیستند
                                                    </FormDescription>
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={Boolean(editTarget?.is_system)}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* preview badge */}
                            {watchResource && watchAction && (
                                <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
                                    <p className="text-xs text-muted-foreground">پیش‌نمایش:</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <code className="text-xs bg-background border px-2 py-0.5 rounded font-mono">
                                            {form.watch("name") || `${watchResource}:${watchAction}`}
                                        </code>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                ACTION_COLORS[watchAction as PermissionAction]
                                            )}
                                        >
                                            {ACTION_LABELS[watchAction as PermissionAction]}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <SheetFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSheetOpen(false)}
                                    className="gap-2"
                                >
                                    انصراف
                                </Button>
                                <Button type="submit" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    {editTarget ? "ذخیره تغییرات" : "ایجاد دسترسی"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>

            {/* ── delete confirm dialog ─────────────────────────────────── */}
            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            حذف دسترسی
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف دسترسی{" "}
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                                {deleteTarget?.name}
                            </code>{" "}
                            مطمئن هستید؟
                        </DialogDescription>
                    </DialogHeader>

                    {deleteTarget && deleteTarget.roles_count > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-300">
                            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                این دسترسی در{" "}
                                <strong>{deleteTarget.roles_count} نقش</strong>{" "}
                                استفاده شده است و پس از حذف از آن نقش‌ها برداشته می‌شود.
                            </span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleConfirmDelete}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            حذف دسترسی
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
