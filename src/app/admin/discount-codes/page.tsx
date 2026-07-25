"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    BadgePercent,
    CalendarClock,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { showBackendError } from "@/lib/api/error-handler";

type DiscountCodeType = "PERCENTAGE" | "FIXED_AMOUNT";
type DiscountCodeScope = "ENTIRE_CART" | "COURSE" | "CATEGORY" | "USER";
type DiscountCodeStatus = "active" | "inactive" | "expired" | "scheduled";

interface SelectOption {
    id: string;
    title: string;
}

interface DiscountCodeRecord {
    id: string;
    code: string;
    title: string;
    description: string;
    type: DiscountCodeType;
    scope: DiscountCodeScope;
    value: number;
    minimum_order_amount: number | null;
    maximum_discount_amount: number | null;
    max_total_usage: number | null;
    used_count: number;
    max_usage_per_user: number | null;
    is_active: boolean;
    allow_on_discounted_courses: boolean;
    starts_at: string | null;
    expires_at: string | null;
    assigned_user_id: number | null;
    course_id: number | null;
    category_id: number | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

interface DiscountCodeApiItem {
    id?: string | number;
    _id?: string;
    code?: string;
    title?: string;
    description?: string;
    type?: string;
    scope?: string;
    value?: number | string;
    minimum_order_amount?: number | string | null;
    maximum_discount_amount?: number | string | null;
    max_total_usage?: number | string | null;
    used_count?: number | string;
    max_usage_per_user?: number | string | null;
    is_active?: boolean;
    allow_on_discounted_courses?: boolean;
    starts_at?: string | null;
    expires_at?: string | null;
    assigned_user_id?: number | string | null;
    course_id?: number | string | null;
    category_id?: number | string | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string;
    createdAt?: string;
}

interface DiscountCodeListResponse {
    data?: DiscountCodeApiItem[];
    items?: DiscountCodeApiItem[];
    discount_codes?: DiscountCodeApiItem[];
}

interface DiscountCodeFormState {
    code: string;
    title: string;
    description: string;
    type: DiscountCodeType;
    scope: DiscountCodeScope;
    value: string;
    minimum_order_amount: string;
    maximum_discount_amount: string;
    max_total_usage: string;
    used_count: string;
    max_usage_per_user: string;
    is_active: boolean;
    allow_on_discounted_courses: boolean;
    starts_at: string;
    expires_at: string;
    assigned_user_id: string;
    course_id: string;
    category_id: string;
    metadata_json: string;
}

const SCOPE_LABELS: Record<DiscountCodeScope, string> = {
    ENTIRE_CART: "کل سبد خرید",
    COURSE: "روی یک دوره",
    CATEGORY: "روی دسته بندی",
    USER: "اختصاصی کاربر",
};

const TYPE_LABELS: Record<DiscountCodeType, string> = {
    PERCENTAGE: "درصدی",
    FIXED_AMOUNT: "مبلغ ثابت",
};

const MOCK_USERS: SelectOption[] = [
    { id: "101", title: "محمد رضایی" },
    { id: "102", title: "الهام احمدی" },
    { id: "103", title: "امین صالحی" },
];

const MOCK_COURSES: SelectOption[] = [
    { id: "11", title: "آموزش جامع Next.js" },
    { id: "12", title: "آموزش React پیشرفته" },
    { id: "13", title: "آموزش TypeScript کاربردی" },
];

const MOCK_CATEGORIES: SelectOption[] = [
    { id: "1", title: "برنامه نویسی" },
    { id: "2", title: "UI/UX" },
    { id: "3", title: "DevOps" },
];

const initialForm: DiscountCodeFormState = {
    code: "",
    title: "",
    description: "",
    type: "PERCENTAGE",
    scope: "ENTIRE_CART",
    value: "",
    minimum_order_amount: "",
    maximum_discount_amount: "",
    max_total_usage: "",
    used_count: "0",
    max_usage_per_user: "",
    is_active: true,
    allow_on_discounted_courses: false,
    starts_at: "",
    expires_at: "",
    assigned_user_id: "",
    course_id: "",
    category_id: "",
    metadata_json: "",
};

const localSeedData: DiscountCodeRecord[] = [
    {
        id: "dc-1",
        code: "WELCOME20",
        title: "خوش آمدگویی 20 درصد",
        description: "برای اولین خرید کاربران جدید",
        type: "PERCENTAGE",
        scope: "ENTIRE_CART",
        value: 20,
        minimum_order_amount: 300000,
        maximum_discount_amount: 200000,
        max_total_usage: 500,
        used_count: 113,
        max_usage_per_user: 1,
        is_active: true,
        allow_on_discounted_courses: false,
        starts_at: "2026-07-01T00:00:00.000Z",
        expires_at: "2026-08-01T00:00:00.000Z",
        assigned_user_id: null,
        course_id: null,
        category_id: null,
        metadata: { campaign: "summer" },
        created_at: "2026-07-01T08:00:00.000Z",
    },
    {
        id: "dc-2",
        code: "NEXTJS150",
        title: "تخفیف مبلغی دوره Next.js",
        description: "فقط برای دوره نکست",
        type: "FIXED_AMOUNT",
        scope: "COURSE",
        value: 150000,
        minimum_order_amount: null,
        maximum_discount_amount: null,
        max_total_usage: 100,
        used_count: 26,
        max_usage_per_user: 1,
        is_active: true,
        allow_on_discounted_courses: true,
        starts_at: null,
        expires_at: null,
        assigned_user_id: null,
        course_id: 11,
        category_id: null,
        metadata: null,
        created_at: "2026-07-10T08:00:00.000Z",
    },
];

function toNullableNumber(value: string): number | null {
    const normalized = value.trim();
    if (!normalized) return null;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
}

function toNullableDateTime(value: string): string | null {
    if (!value.trim()) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

function fromIsoToDatetimeLocal(value: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
}

function normalizeRecord(raw: DiscountCodeApiItem, index: number): DiscountCodeRecord | null {
    const code = String(raw.code ?? "").trim();
    if (!code) return null;

    const type = (String(raw.type ?? "PERCENTAGE").toUpperCase() as DiscountCodeType);
    const scope = (String(raw.scope ?? "ENTIRE_CART").toUpperCase() as DiscountCodeScope);

    return {
        id: String(raw.id ?? raw._id ?? `discount-${index}`),
        code,
        title: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        type: type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
        scope: ["COURSE", "CATEGORY", "USER", "ENTIRE_CART"].includes(scope)
            ? scope
            : "ENTIRE_CART",
        value: Number(raw.value ?? 0),
        minimum_order_amount:
            raw.minimum_order_amount === null || raw.minimum_order_amount === undefined
                ? null
                : Number(raw.minimum_order_amount),
        maximum_discount_amount:
            raw.maximum_discount_amount === null || raw.maximum_discount_amount === undefined
                ? null
                : Number(raw.maximum_discount_amount),
        max_total_usage:
            raw.max_total_usage === null || raw.max_total_usage === undefined
                ? null
                : Number(raw.max_total_usage),
        used_count: Number(raw.used_count ?? 0),
        max_usage_per_user:
            raw.max_usage_per_user === null || raw.max_usage_per_user === undefined
                ? null
                : Number(raw.max_usage_per_user),
        is_active: Boolean(raw.is_active ?? true),
        allow_on_discounted_courses: Boolean(raw.allow_on_discounted_courses ?? false),
        starts_at: raw.starts_at ?? null,
        expires_at: raw.expires_at ?? null,
        assigned_user_id:
            raw.assigned_user_id === null || raw.assigned_user_id === undefined
                ? null
                : Number(raw.assigned_user_id),
        course_id:
            raw.course_id === null || raw.course_id === undefined ? null : Number(raw.course_id),
        category_id:
            raw.category_id === null || raw.category_id === undefined
                ? null
                : Number(raw.category_id),
        metadata: raw.metadata ?? null,
        created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    };
}

function toForm(record: DiscountCodeRecord): DiscountCodeFormState {
    return {
        code: record.code,
        title: record.title,
        description: record.description,
        type: record.type,
        scope: record.scope,
        value: String(record.value),
        minimum_order_amount: record.minimum_order_amount?.toString() ?? "",
        maximum_discount_amount: record.maximum_discount_amount?.toString() ?? "",
        max_total_usage: record.max_total_usage?.toString() ?? "",
        used_count: String(record.used_count),
        max_usage_per_user: record.max_usage_per_user?.toString() ?? "",
        is_active: record.is_active,
        allow_on_discounted_courses: record.allow_on_discounted_courses,
        starts_at: fromIsoToDatetimeLocal(record.starts_at),
        expires_at: fromIsoToDatetimeLocal(record.expires_at),
        assigned_user_id: record.assigned_user_id?.toString() ?? "",
        course_id: record.course_id?.toString() ?? "",
        category_id: record.category_id?.toString() ?? "",
        metadata_json: record.metadata ? JSON.stringify(record.metadata, null, 2) : "",
    };
}

function detectStatus(record: DiscountCodeRecord): DiscountCodeStatus {
    const now = Date.now();

    if (!record.is_active) return "inactive";

    if (record.starts_at) {
        const startsAt = new Date(record.starts_at).getTime();
        if (Number.isFinite(startsAt) && startsAt > now) return "scheduled";
    }

    if (record.expires_at) {
        const expiresAt = new Date(record.expires_at).getTime();
        if (Number.isFinite(expiresAt) && expiresAt < now) return "expired";
    }

    return "active";
}

function statusBadgeConfig(status: DiscountCodeStatus): { label: string; variant: "default" | "secondary" | "outline" } {
    if (status === "active") return { label: "فعال", variant: "default" };
    if (status === "scheduled") return { label: "زمان‌بندی شده", variant: "secondary" };
    if (status === "expired") return { label: "منقضی", variant: "outline" };
    return { label: "غیرفعال", variant: "outline" };
}

function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    return value.toLocaleString("fa-IR");
}

function formatDateTime(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function resolveScopeTarget(record: DiscountCodeRecord): string {
    if (record.scope === "USER") {
        return MOCK_USERS.find((user) => Number(user.id) === record.assigned_user_id)?.title ?? "کاربر خاص";
    }
    if (record.scope === "COURSE") {
        return MOCK_COURSES.find((course) => Number(course.id) === record.course_id)?.title ?? "دوره خاص";
    }
    if (record.scope === "CATEGORY") {
        return MOCK_CATEGORIES.find((category) => Number(category.id) === record.category_id)?.title ?? "دسته خاص";
    }
    return "همه کاربران";
}

async function fetchDiscountCodes(): Promise<DiscountCodeRecord[]> {
    const response = await api.get<DiscountCodeListResponse | DiscountCodeApiItem[]>(
        endpoints.admin.discountCodes.list
    );

    const payload = response.data;
    let rawItems: DiscountCodeApiItem[] = [];

    if (Array.isArray(payload)) {
        rawItems = payload;
    } else if (Array.isArray(payload?.items)) {
        rawItems = payload.items;
    } else if (Array.isArray(payload?.discount_codes)) {
        rawItems = payload.discount_codes;
    } else if (Array.isArray(payload?.data)) {
        rawItems = payload.data;
    }

    return rawItems
        .map((item, index) => normalizeRecord(item, index))
        .filter((item): item is DiscountCodeRecord => item !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default function AdminDiscountCodesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | DiscountCodeStatus>("all");
    const [scopeFilter, setScopeFilter] = useState<"all" | DiscountCodeScope>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DiscountCodeRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DiscountCodeRecord | null>(null);
    const [form, setForm] = useState<DiscountCodeFormState>(initialForm);

    const discountCodesQuery = useQuery({
        queryKey: ["admin-discount-codes"],
        queryFn: fetchDiscountCodes,
        retry: false,
    });

    const codes = useMemo(() => {
        if (discountCodesQuery.data && discountCodesQuery.data.length > 0) {
            return discountCodesQuery.data;
        }

        if (discountCodesQuery.isError) {
            return localSeedData;
        }

        return discountCodesQuery.data ?? [];
    }, [discountCodesQuery.data, discountCodesQuery.isError]);

    const createMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            await api.post(endpoints.admin.discountCodes.create, payload);
        },
        onSuccess: async () => {
            toast.success("کد تخفیف با موفقیت ایجاد شد.");
            await discountCodesQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: { id: string; body: Record<string, unknown> }) => {
            await api.patch(endpoints.admin.discountCodes.update(payload.id), payload.body);
        },
        onSuccess: async () => {
            toast.success("کد تخفیف با موفقیت ویرایش شد.");
            await discountCodesQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(endpoints.admin.discountCodes.delete(id));
        },
        onSuccess: async () => {
            toast.success("کد تخفیف حذف شد.");
            await discountCodesQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const stats = useMemo(() => {
        const total = codes.length;
        const active = codes.filter((item) => detectStatus(item) === "active").length;
        const personal = codes.filter((item) => item.scope === "USER").length;
        const totalUsage = codes.reduce((sum, item) => sum + item.used_count, 0);
        return { total, active, personal, totalUsage };
    }, [codes]);

    const filteredCodes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return codes.filter((item) => {
            const status = detectStatus(item);
            if (statusFilter !== "all" && status !== statusFilter) return false;
            if (scopeFilter !== "all" && item.scope !== scopeFilter) return false;

            if (!query) return true;

            return (
                item.code.toLowerCase().includes(query) ||
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        });
    }, [codes, search, scopeFilter, statusFilter]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const openCreateDialog = () => {
        setEditingRecord(null);
        setForm(initialForm);
        setIsDialogOpen(true);
    };

    const openEditDialog = (record: DiscountCodeRecord) => {
        setEditingRecord(record);
        setForm(toForm(record));
        setIsDialogOpen(true);
    };

    const handleScopeChange = (scope: DiscountCodeScope) => {
        setForm((prev) => ({
            ...prev,
            scope,
            assigned_user_id: scope === "USER" ? prev.assigned_user_id : "",
            course_id: scope === "COURSE" ? prev.course_id : "",
            category_id: scope === "CATEGORY" ? prev.category_id : "",
        }));
    };

    const buildPayload = (): Record<string, unknown> | null => {
        const value = toNullableNumber(form.value);
        if (!form.code.trim()) {
            toast.error("وارد کردن کد تخفیف الزامی است.");
            return null;
        }
        if (!value || value <= 0) {
            toast.error("مقدار تخفیف باید بزرگتر از صفر باشد.");
            return null;
        }
        if (form.type === "PERCENTAGE" && value > 100) {
            toast.error("درصد تخفیف نمی‌تواند بیشتر از 100 باشد.");
            return null;
        }

        let metadata: Record<string, unknown> | null = null;
        if (form.metadata_json.trim()) {
            try {
                metadata = JSON.parse(form.metadata_json) as Record<string, unknown>;
            } catch {
                toast.error("فرمت JSON متادیتا معتبر نیست.");
                return null;
            }
        }

        const startsAt = toNullableDateTime(form.starts_at);
        const expiresAt = toNullableDateTime(form.expires_at);
        if (startsAt && expiresAt && new Date(startsAt).getTime() >= new Date(expiresAt).getTime()) {
            toast.error("تاریخ پایان باید بعد از تاریخ شروع باشد.");
            return null;
        }

        const payload = {
            code: form.code.trim().toUpperCase(),
            title: form.title.trim() || null,
            description: form.description.trim() || null,
            type: form.type,
            scope: form.scope,
            value,
            minimum_order_amount: toNullableNumber(form.minimum_order_amount),
            maximum_discount_amount: toNullableNumber(form.maximum_discount_amount),
            max_total_usage: toNullableNumber(form.max_total_usage),
            used_count: toNullableNumber(form.used_count) ?? 0,
            max_usage_per_user: toNullableNumber(form.max_usage_per_user),
            is_active: form.is_active,
            allow_on_discounted_courses: form.allow_on_discounted_courses,
            starts_at: startsAt,
            expires_at: expiresAt,
            assigned_user_id: form.scope === "USER" ? toNullableNumber(form.assigned_user_id) : null,
            course_id: form.scope === "COURSE" ? toNullableNumber(form.course_id) : null,
            category_id: form.scope === "CATEGORY" ? toNullableNumber(form.category_id) : null,
            metadata,
        };

        return payload;
    };

    const handleSubmit = async () => {
        const payload = buildPayload();
        if (!payload) return;

        if (editingRecord) {
            await updateMutation.mutateAsync({ id: editingRecord.id, body: payload });
        } else {
            await createMutation.mutateAsync(payload);
        }

        setIsDialogOpen(false);
        setForm(initialForm);
        setEditingRecord(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">مدیریت کدهای تخفیف</h2>
                    <p className="text-sm text-muted-foreground">
                        لیست کامل کدهای تخفیف، وضعیت فعال/منقضی، نوع اعمال و امکان ساخت یا ویرایش.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => void discountCodesQuery.refetch()}
                        disabled={discountCodesQuery.isFetching}
                    >
                        {discountCodesQuery.isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        بروزرسانی
                    </Button>

                    <Button type="button" className="gap-2" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        ایجاد کد جدید
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">کل کدها</p>
                        <p className="mt-1 text-2xl font-bold">{stats.total.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">کد فعال</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{stats.active.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">کد اختصاصی کاربر</p>
                        <p className="mt-1 text-2xl font-bold">{stats.personal.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">تعداد کل استفاده</p>
                        <p className="mt-1 text-2xl font-bold">{stats.totalUsage.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">فیلتر و جستجو</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="جستجو کد یا عنوان"
                            className="pr-9"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as "all" | DiscountCodeStatus)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="فیلتر وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                            <SelectItem value="active">فعال</SelectItem>
                            <SelectItem value="inactive">غیرفعال</SelectItem>
                            <SelectItem value="expired">منقضی</SelectItem>
                            <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={scopeFilter}
                        onValueChange={(value) => setScopeFilter(value as "all" | DiscountCodeScope)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="فیلتر حوزه اعمال" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه حوزه‌ها</SelectItem>
                            <SelectItem value="ENTIRE_CART">کل سبد خرید</SelectItem>
                            <SelectItem value="COURSE">روی یک دوره</SelectItem>
                            <SelectItem value="CATEGORY">روی دسته بندی</SelectItem>
                            <SelectItem value="USER">اختصاصی کاربر</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">لیست کدهای تخفیف</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>کد</TableHead>
                                    <TableHead>نوع / مقدار</TableHead>
                                    <TableHead>حوزه اعمال</TableHead>
                                    <TableHead>وضعیت</TableHead>
                                    <TableHead>مصرف</TableHead>
                                    <TableHead>زمان اعتبار</TableHead>
                                    <TableHead>عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discountCodesQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                در حال دریافت اطلاعات...
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCodes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            کد تخفیفی با این فیلتر پیدا نشد.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCodes.map((item) => {
                                        const status = detectStatus(item);
                                        const badge = statusBadgeConfig(status);

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="inline-flex items-center gap-2 font-semibold" dir="ltr">
                                                            <BadgePercent className="h-4 w-4" />
                                                            {item.code}
                                                        </div>
                                                        <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                                                            {item.title || "بدون عنوان"}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <Badge variant="outline">{TYPE_LABELS[item.type]}</Badge>
                                                        <p className="text-muted-foreground">
                                                            {item.type === "PERCENTAGE"
                                                                ? `${formatNumber(item.value)}%`
                                                                : `${formatNumber(item.value)} تومان`}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <p>{SCOPE_LABELS[item.scope]}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {resolveScopeTarget(item)}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge variant={badge.variant}>{badge.label}</Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="text-sm">
                                                        {formatNumber(item.used_count)} / {item.max_total_usage ? formatNumber(item.max_total_usage) : "نامحدود"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        هر کاربر: {item.max_usage_per_user ? formatNumber(item.max_usage_per_user) : "نامحدود"}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        <p>شروع: {formatDateTime(item.starts_at)}</p>
                                                        <p>پایان: {formatDateTime(item.expires_at)}</p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(item)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => setDeleteTarget(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "ویرایش کد تخفیف" : "ایجاد کد تخفیف جدید"}</DialogTitle>
                        <DialogDescription>
                            اطلاعات کد تخفیف را بر اساس قوانین انتیتی وارد کنید.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="code">کد تخفیف</Label>
                                <Input
                                    id="code"
                                    value={form.code}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
                                    }
                                    placeholder="WELCOME20"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="title">عنوان</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                    placeholder="عنوان داخلی کد تخفیف"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">توضیحات</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                rows={3}
                                placeholder="توضیح درباره کاربرد کد تخفیف"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label>نوع تخفیف</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({ ...prev, type: value as DiscountCodeType }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">درصدی</SelectItem>
                                        <SelectItem value="FIXED_AMOUNT">مبلغ ثابت</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>حوزه اعمال</Label>
                                <Select value={form.scope} onValueChange={(value) => handleScopeChange(value as DiscountCodeScope)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENTIRE_CART">کل سبد خرید</SelectItem>
                                        <SelectItem value="COURSE">روی یک دوره</SelectItem>
                                        <SelectItem value="CATEGORY">روی دسته بندی</SelectItem>
                                        <SelectItem value="USER">اختصاصی کاربر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="value">مقدار تخفیف</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min={0}
                                    value={form.value}
                                    onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                                    placeholder={form.type === "PERCENTAGE" ? "مثال: 15" : "مثال: 100000"}
                                />
                            </div>
                        </div>

                        {form.scope === "USER" ? (
                            <div className="space-y-1.5">
                                <Label>کاربر هدف</Label>
                                <Select
                                    value={form.assigned_user_id || "none"}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            assigned_user_id: value === "none" ? "" : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب کاربر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">انتخاب نشده</SelectItem>
                                        {MOCK_USERS.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        {form.scope === "COURSE" ? (
                            <div className="space-y-1.5">
                                <Label>دوره هدف</Label>
                                <Select
                                    value={form.course_id || "none"}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            course_id: value === "none" ? "" : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب دوره" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">انتخاب نشده</SelectItem>
                                        {MOCK_COURSES.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        {form.scope === "CATEGORY" ? (
                            <div className="space-y-1.5">
                                <Label>دسته بندی هدف</Label>
                                <Select
                                    value={form.category_id || "none"}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category_id: value === "none" ? "" : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب دسته بندی" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">انتخاب نشده</SelectItem>
                                        {MOCK_CATEGORIES.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="min-order">حداقل مبلغ سفارش</Label>
                                <Input
                                    id="min-order"
                                    type="number"
                                    min={0}
                                    value={form.minimum_order_amount}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, minimum_order_amount: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="max-discount">سقف مبلغ تخفیف</Label>
                                <Input
                                    id="max-discount"
                                    type="number"
                                    min={0}
                                    value={form.maximum_discount_amount}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, maximum_discount_amount: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="max-total">حداکثر دفعات استفاده</Label>
                                <Input
                                    id="max-total"
                                    type="number"
                                    min={0}
                                    value={form.max_total_usage}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, max_total_usage: event.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="used-count">تعداد استفاده فعلی</Label>
                                <Input
                                    id="used-count"
                                    type="number"
                                    min={0}
                                    value={form.used_count}
                                    onChange={(event) => setForm((prev) => ({ ...prev, used_count: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="max-user">حداکثر برای هر کاربر</Label>
                                <Input
                                    id="max-user"
                                    type="number"
                                    min={0}
                                    value={form.max_usage_per_user}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, max_usage_per_user: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="starts-at">تاریخ شروع</Label>
                                <Input
                                    id="starts-at"
                                    type="datetime-local"
                                    value={form.starts_at}
                                    onChange={(event) => setForm((prev) => ({ ...prev, starts_at: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="expires-at">تاریخ پایان</Label>
                                <Input
                                    id="expires-at"
                                    type="datetime-local"
                                    value={form.expires_at}
                                    onChange={(event) => setForm((prev) => ({ ...prev, expires_at: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="metadata">Metadata (JSON)</Label>
                                <Textarea
                                    id="metadata"
                                    value={form.metadata_json}
                                    onChange={(event) => setForm((prev) => ({ ...prev, metadata_json: event.target.value }))}
                                    rows={4}
                                    placeholder='{"campaign":"summer"}'
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="text-sm font-medium">فعال بودن کد</p>
                                    <p className="text-xs text-muted-foreground">اگر خاموش باشد کد قابل استفاده نیست.</p>
                                </div>
                                <Switch
                                    checked={form.is_active}
                                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="text-sm font-medium">اعمال روی دوره تخفیف‌دار</p>
                                    <p className="text-xs text-muted-foreground">روی دوره‌ای که خودش تخفیف دارد اعمال شود.</p>
                                </div>
                                <Switch
                                    checked={form.allow_on_discounted_courses}
                                    onCheckedChange={(checked) =>
                                        setForm((prev) => ({ ...prev, allow_on_discounted_courses: checked }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setEditingRecord(null);
                                setForm(initialForm);
                            }}
                        >
                            انصراف
                        </Button>
                        <Button type="button" className="gap-2" onClick={() => void handleSubmit()} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                            {editingRecord ? "ثبت ویرایش" : "ایجاد کد تخفیف"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>حذف کد تخفیف</DialogTitle>
                        <DialogDescription>
                            آیا از حذف کد <span className="font-semibold" dir="ltr">{deleteTarget?.code}</span> مطمئن هستید؟
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                        این عملیات قابل بازگشت نیست و تاریخچه استفاده‌های ثبت‌شده باید در بک‌اند مدیریت شود.
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={async () => {
                                if (!deleteTarget) return;
                                await deleteMutation.mutateAsync(deleteTarget.id);
                                setDeleteTarget(null);
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            حذف نهایی
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {discountCodesQuery.isError ? (
                <Card>
                    <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                            ارتباط با API برقرار نشد؛ داده نمونه برای ادامه کار نمایش داده می‌شود.
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => void discountCodesQuery.refetch()}>
                            تلاش مجدد
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
