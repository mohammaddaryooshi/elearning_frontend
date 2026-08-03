"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Plus,
    Search,
    Shield,
    ShieldCheck,
    ShieldOff,
    Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { RolesTable, type AdminRoleRow, type Permission } from "@/features/admin/role-and-permissions/components/RolesTable/roles-table";

// ─── all permissions (grouped) ───────────────────────────────────────────────
const ALL_PERMISSIONS: Permission[] = [
    // کاربران
    { key: "users.view", label: "مشاهده کاربران", group: "کاربران" },
    { key: "users.create", label: "ایجاد کاربر", group: "کاربران" },
    { key: "users.edit", label: "ویرایش کاربر", group: "کاربران" },
    { key: "users.delete", label: "حذف کاربر", group: "کاربران" },
    // دوره‌ها
    { key: "courses.view", label: "مشاهده دوره‌ها", group: "دوره‌ها" },
    { key: "courses.create", label: "ایجاد دوره", group: "دوره‌ها" },
    { key: "courses.edit", label: "ویرایش دوره", group: "دوره‌ها" },
    { key: "courses.delete", label: "حذف دوره", group: "دوره‌ها" },
    { key: "courses.publish", label: "انتشار دوره", group: "دوره‌ها" },
    // مالی
    { key: "finance.view", label: "مشاهده تراکنش‌ها", group: "مالی" },
    { key: "finance.refund", label: "بازگشت وجه", group: "مالی" },
    { key: "finance.export", label: "خروجی مالی", group: "مالی" },
    // محتوا
    { key: "blog.view", label: "مشاهده مقالات", group: "محتوا" },
    { key: "blog.create", label: "ایجاد مقاله", group: "محتوا" },
    { key: "blog.edit", label: "ویرایش مقاله", group: "محتوا" },
    { key: "blog.delete", label: "حذف مقاله", group: "محتوا" },
    // تنظیمات
    { key: "settings.view", label: "مشاهده تنظیمات", group: "تنظیمات" },
    { key: "settings.edit", label: "ویرایش تنظیمات", group: "تنظیمات" },
    // پشتیبانی
    { key: "tickets.view", label: "مشاهده تیکت‌ها", group: "پشتیبانی" },
    { key: "tickets.reply", label: "پاسخ به تیکت", group: "پشتیبانی" },
    { key: "tickets.close", label: "بستن تیکت", group: "پشتیبانی" },
];

const permissionGroups = [...new Set(ALL_PERMISSIONS.map((p) => p.group))];

// ─── mock data ────────────────────────────────────────────────────────────────
const initialRoles: AdminRoleRow[] = [
    {
        id: "1",
        name: "super_admin",
        label: "مدیر ارشد",
        description: "دسترسی کامل به تمام بخش‌های سیستم",
        permissions: ALL_PERMISSIONS.map((p) => p.key),
        users_count: 1,
        is_system: true,
        created_at: "1404/01/01",
    },
    {
        id: "2",
        name: "admin",
        label: "مدیر",
        description: "دسترسی به اکثر بخش‌ها به جز تنظیمات حساس",
        permissions: [
            "users.view", "users.edit",
            "courses.view", "courses.create", "courses.edit", "courses.publish",
            "blog.view", "blog.create", "blog.edit",
            "tickets.view", "tickets.reply", "tickets.close",
            "finance.view",
        ],
        users_count: 3,
        is_system: true,
        created_at: "1404/01/01",
    },
    {
        id: "3",
        name: "instructor",
        label: "مدرس",
        description: "مدیریت دوره‌های خود و مشاهده آمار",
        permissions: [
            "courses.view", "courses.create", "courses.edit",
            "blog.view", "blog.create", "blog.edit",
        ],
        users_count: 12,
        is_system: false,
        created_at: "1404/03/15",
    },
    {
        id: "4",
        name: "support",
        label: "پشتیبانی",
        description: "پاسخ به تیکت‌ها و مشاهده اطلاعات کاربران",
        permissions: [
            "users.view",
            "tickets.view", "tickets.reply", "tickets.close",
        ],
        users_count: 5,
        is_system: false,
        created_at: "1404/06/20",
    },
    {
        id: "5",
        name: "content_manager",
        label: "مدیر محتوا",
        description: "مدیریت مقالات و محتوای سایت",
        permissions: [
            "blog.view", "blog.create", "blog.edit", "blog.delete",
        ],
        users_count: 2,
        is_system: false,
        created_at: "1404/08/10",
    },
];

// ─── types ────────────────────────────────────────────────────────────────────
interface RoleFormValues {
    name: string;
    label: string;
    description: string;
    permissions: string[];
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
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

// ─── permission group selector ────────────────────────────────────────────────
function PermissionGroupSelector({
    group,
    permissions,
    selected,
    onChange,
}: {
    group: string;
    permissions: Permission[];
    selected: string[];
    onChange: (keys: string[]) => void;
}) {
    const groupKeys = permissions.map((p) => p.key);
    const selectedInGroup = groupKeys.filter((k) => selected.includes(k));
    const allChecked = selectedInGroup.length === groupKeys.length;
    const someChecked = selectedInGroup.length > 0 && !allChecked;

    const toggleAll = () => {
        if (allChecked) {
            onChange(selected.filter((k) => !groupKeys.includes(k)));
        } else {
            onChange([...new Set([...selected, ...groupKeys])]);
        }
    };

    const toggleOne = (key: string) => {
        if (selected.includes(key)) {
            onChange(selected.filter((k) => k !== key));
        } else {
            onChange([...selected, key]);
        }
    };

    return (
        <div className="rounded-lg border bg-muted/30 p-4">
            {/* group header */}
            <div className="mb-3 flex items-center gap-2">
                <Checkbox
                    id={`group-${group}`}
                    checked={allChecked}
                    // indeterminate state via data attribute for styling
                    data-state={someChecked ? "indeterminate" : allChecked ? "checked" : "unchecked"}
                    onCheckedChange={toggleAll}
                />
                <Label
                    htmlFor={`group-${group}`}
                    className="cursor-pointer font-semibold text-sm"
                >
                    {group}
                </Label>
                <Badge variant="secondary" className="mr-auto text-xs">
                    {selectedInGroup.length}/{groupKeys.length}
                </Badge>
            </div>
            <Separator className="mb-3" />
            {/* individual permissions */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {permissions.map((perm) => (
                    <div key={perm.key} className="flex items-center gap-2">
                        <Checkbox
                            id={perm.key}
                            checked={selected.includes(perm.key)}
                            onCheckedChange={() => toggleOne(perm.key)}
                        />
                        <Label htmlFor={perm.key} className="cursor-pointer text-sm">
                            {perm.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function AdminRolesPage() {
    const [roles, setRoles] = useState<AdminRoleRow[]>(initialRoles);
    const [search, setSearch] = useState("");
    const [editTarget, setEditTarget] = useState<AdminRoleRow | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminRoleRow | null>(null);

    // sheet open = edit OR create
    const sheetOpen = !!editTarget || isCreating;

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
        useForm<RoleFormValues>({
            defaultValues: { name: "", label: "", description: "", permissions: [] },
        });

    const selectedPermissions = watch("permissions");

    // ─── open edit ────────────────────────────────────────────────────────────
    const handleEdit = (role: AdminRoleRow) => {
        setEditTarget(role);
        reset({
            name: role.name,
            label: role.label,
            description: role.description ?? "",
            permissions: role.permissions,
        });
    };

    // ─── open create ──────────────────────────────────────────────────────────
    const handleCreate = () => {
        setIsCreating(true);
        reset({ name: "", label: "", description: "", permissions: [] });
    };

    // ─── close sheet ──────────────────────────────────────────────────────────
    const handleSheetClose = () => {
        setEditTarget(null);
        setIsCreating(false);
        reset();
    };

    // ─── submit (create / edit) ───────────────────────────────────────────────
    const onSubmit = (values: RoleFormValues) => {
        if (editTarget) {
            setRoles((prev) =>
                prev.map((r) =>
                    r.id === editTarget.id
                        ? { ...r, ...values }
                        : r
                )
            );
        } else {
            const newRole: AdminRoleRow = {
                id: String(Date.now()),
                name: values.name,
                label: values.label,
                description: values.description,
                permissions: values.permissions,
                users_count: 0,
                is_system: false,
                created_at: new Date().toLocaleDateString("fa-IR"),
            };
            setRoles((prev) => [...prev, newRole]);
        }
        handleSheetClose();
    };

    // ─── delete ───────────────────────────────────────────────────────────────
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    // ─── select all / none permissions ───────────────────────────────────────
    const handleSelectAllPerms = () =>
        setValue("permissions", ALL_PERMISSIONS.map((p) => p.key));
    const handleClearPerms = () => setValue("permissions", []);

    // ─── filtered ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return roles;
        return roles.filter(
            (r) =>
                r.label.toLowerCase().includes(q) ||
                r.name.toLowerCase().includes(q) ||
                (r.description ?? "").toLowerCase().includes(q)
        );
    }, [search, roles]);

    // ─── stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: roles.length,
        system: roles.filter((r) => r.is_system).length,
        custom: roles.filter((r) => !r.is_system).length,
    }), [roles]);

    const isEditingSystem = editTarget?.is_system ?? false;

    return (
        <div className="space-y-6">
            {/* header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت رول‌ها</h2>
                <p className="text-sm text-muted-foreground">
                    تعریف رول‌ها و مدیریت دسترسی‌های هر رول در سیستم.
                </p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="کل رول‌ها" value={stats.total} icon={<Shield className="h-5 w-5" />} />
                <StatCard label="رول‌های سیستمی" value={stats.system} icon={<ShieldCheck className="h-5 w-5" />} />
                <StatCard label="رول‌های سفارشی" value={stats.custom} icon={<ShieldOff className="h-5 w-5" />} />
            </div>

            {/* table card */}
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>لیست رول‌ها</CardTitle>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو در نام یا توضیحات..."
                                className="w-full pr-9 sm:w-64"
                            />
                        </div>
                        {/* create button */}
                        <Button onClick={handleCreate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            رول جدید
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <RolesTable
                        data={filtered}
                        allPermissions={ALL_PERMISSIONS}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── edit / create sheet ──────────────────────────────────────── */}
            <Sheet open={sheetOpen} onOpenChange={(open) => !open && handleSheetClose()}>
                <SheetContent
                    side="left"
                    className="flex w-full flex-col sm:max-w-xl overflow-y-auto"
                >
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            {isCreating ? "ایجاد رول جدید" : `ویرایش رول: ${editTarget?.label}`}
                        </SheetTitle>
                        <SheetDescription>
                            {isCreating
                                ? "اطلاعات و دسترسی‌های رول جدید را تعریف کنید."
                                : isEditingSystem
                                    ? "رول‌های سیستمی را می‌توانید فقط از نظر دسترسی‌ها ویرایش کنید."
                                    : "اطلاعات و دسترسی‌های این رول را ویرایش کنید."}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 py-4">
                        {/* basic info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                اطلاعات پایه
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* label */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="label">
                                        نام نمایشی <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="label"
                                        placeholder="مثال: مدرس"
                                        disabled={isEditingSystem}
                                        {...register("label", { required: "نام نمایشی الزامی است" })}
                                    />
                                    {errors.label && (
                                        <p className="text-xs text-destructive">{errors.label.message}</p>
                                    )}
                                </div>

                                {/* name (slug) */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">
                                        نام سیستمی <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="مثال: instructor"
                                        dir="ltr"
                                        disabled={isEditingSystem}
                                        {...register("name", {
                                            required: "نام سیستمی الزامی است",
                                            pattern: {
                                                value: /^[a-z_]+$/,
                                                message: "فقط حروف لاتین کوچک و underscore",
                                            },
                                        })}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description">توضیحات</Label>
                                <Input
                                    id="description"
                                    placeholder="توضیح کوتاهی درباره این رول..."
                                    disabled={isEditingSystem}
                                    {...register("description")}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* permissions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    دسترسی‌ها
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAllPerms}
                                        className="h-7 text-xs"
                                    >
                                        همه
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearPerms}
                                        className="h-7 text-xs"
                                    >
                                        هیچکدام
                                    </Button>
                                </div>
                            </div>

                            {/* summary badge */}
                            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <span className="text-sm">
                                    {selectedPermissions.length} از {ALL_PERMISSIONS.length} دسترسی انتخاب شده
                                </span>
                            </div>

                            {/* groups */}
                            <div className="space-y-3">
                                {permissionGroups.map((group) => (
                                    <PermissionGroupSelector
                                        key={group}
                                        group={group}
                                        permissions={ALL_PERMISSIONS.filter((p) => p.group === group)}
                                        selected={selectedPermissions}
                                        onChange={(keys) => setValue("permissions", keys)}
                                    />
                                ))}
                            </div>
                        </div>

                        <SheetFooter className="mt-auto pt-4">
                            <Button type="submit" className="w-full sm:w-auto">
                                {isCreating ? "ایجاد رول" : "ذخیره تغییرات"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSheetClose}
                                className="w-full sm:w-auto"
                            >
                                انصراف
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* ─── delete confirm dialog ────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            حذف رول
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف رول{" "}
                            <span className="font-semibold text-foreground">
                                «{deleteTarget?.label}»
                            </span>{" "}
                            مطمئن هستید؟ این عملیات قابل بازگشت نیست و{" "}
                            <span className="font-semibold text-destructive">
                                {deleteTarget?.users_count} کاربر
                            </span>{" "}
                            این رول را از دست می‌دهند.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleConfirmDelete}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            بله، حذف شود
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
