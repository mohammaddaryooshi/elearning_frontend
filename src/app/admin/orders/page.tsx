"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    BadgeCheck,
    Ban,
    Eye,
    Loader2,
    Pencil,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type OrderStatus =
    | "PENDING"
    | "AWAITING_PAYMENT"
    | "PAID"
    | "COMPLETED"
    | "CANCELLED"
    | "FAILED"
    | "EXPIRED"
    | "REFUNDED";

type OrderPaymentStatus =
    | "UNPAID"
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIAL_REFUNDED";

type PaymentGatewayName = "ZARINPAL" | "IDPAY" | "ZIBAL" | "NEXTPAY" | "UNKNOWN";

type PaymentAttemptStatus =
    | "INITIATED"
    | "REDIRECTED"
    | "CALLBACK_RECEIVED"
    | "VERIFIED"
    | "FAILED"
    | "CANCELLED";

interface OrderItem {
    id: string;
    course_id: number | null;
    course_title_snapshot: string;
    course_slug_snapshot: string | null;
    quantity: number;
    base_unit_price: number;
    discounted_unit_price: number | null;
    coupon_discount_amount: number;
    final_unit_price: number;
    line_total_amount: number;
    has_course_discount: boolean;
}

interface PaymentAttempt {
    id: string;
    gateway: PaymentGatewayName;
    status: PaymentAttemptStatus;
    amount: number;
    authority: string | null;
    reference_id: string | null;
    payment_url: string | null;
    error_message: string | null;
    attempted_at: string | null;
    verified_at: string | null;
}

interface OrderRecord {
    id: string;
    order_number: string;
    user_id: number | null;
    cart_id: number | null;
    status: OrderStatus;
    payment_status: OrderPaymentStatus;
    currency: string;
    subtotal_amount: number;
    course_discount_amount: number;
    coupon_discount_amount: number;
    total_discount_amount: number;
    payable_amount: number;
    discount_code_id: number | null;
    discount_code_snapshot: string | null;
    customer_first_name: string | null;
    customer_last_name: string | null;
    customer_email: string | null;
    customer_phone_number: string | null;
    payment_gateway: PaymentGatewayName | null;
    payment_authority: string | null;
    payment_reference_id: string | null;
    payment_url: string | null;
    payment_attempts_count: number;
    last_payment_error: string | null;
    paid_at: string | null;
    payment_verified_at: string | null;
    expires_at: string | null;
    cancelled_at: string | null;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    items: OrderItem[];
    payment_attempts: PaymentAttempt[];
}

interface ApiOrderItem {
    id?: string | number;
    course_id?: number | string | null;
    course_title_snapshot?: string;
    course_slug_snapshot?: string | null;
    quantity?: number | string;
    base_unit_price?: number | string;
    discounted_unit_price?: number | string | null;
    coupon_discount_amount?: number | string;
    final_unit_price?: number | string;
    line_total_amount?: number | string;
    has_course_discount?: boolean;
}

interface ApiPaymentAttempt {
    id?: string | number;
    gateway?: string;
    status?: string;
    amount?: number | string;
    authority?: string | null;
    reference_id?: string | null;
    payment_url?: string | null;
    error_message?: string | null;
    attempted_at?: string | null;
    verified_at?: string | null;
}

interface ApiOrder {
    id?: string | number;
    _id?: string;
    order_number?: string;
    user_id?: number | string | null;
    cart_id?: number | string | null;
    status?: string;
    payment_status?: string;
    currency?: string;
    subtotal_amount?: number | string;
    course_discount_amount?: number | string;
    coupon_discount_amount?: number | string;
    total_discount_amount?: number | string;
    payable_amount?: number | string;
    discount_code_id?: number | string | null;
    discount_code_snapshot?: string | null;
    customer_first_name?: string | null;
    customer_last_name?: string | null;
    customer_email?: string | null;
    customer_phone_number?: string | null;
    payment_gateway?: string | null;
    payment_authority?: string | null;
    payment_reference_id?: string | null;
    payment_url?: string | null;
    payment_attempts_count?: number | string;
    last_payment_error?: string | null;
    paid_at?: string | null;
    payment_verified_at?: string | null;
    expires_at?: string | null;
    cancelled_at?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string;
    createdAt?: string;
    items?: ApiOrderItem[];
    order_items?: ApiOrderItem[];
    payment_attempts?: ApiPaymentAttempt[];
    attempts?: ApiPaymentAttempt[];
}

interface OrdersListResponse {
    data?: ApiOrder[];
    items?: ApiOrder[];
    orders?: ApiOrder[];
}

interface OrderUpdateFormState {
    status: OrderStatus;
    payment_status: OrderPaymentStatus;
    payment_gateway: PaymentGatewayName | "";
    payment_reference_id: string;
    notes: string;
    last_payment_error: string;
}

const defaultUpdateForm: OrderUpdateFormState = {
    status: "PENDING",
    payment_status: "UNPAID",
    payment_gateway: "",
    payment_reference_id: "",
    notes: "",
    last_payment_error: "",
};

const mockOrders: OrderRecord[] = [
    {
        id: "ord-1",
        order_number: "ORD-2026-0001",
        user_id: 41,
        cart_id: 801,
        status: "PAID",
        payment_status: "PAID",
        currency: "IRR",
        subtotal_amount: 2400000,
        course_discount_amount: 200000,
        coupon_discount_amount: 300000,
        total_discount_amount: 500000,
        payable_amount: 1900000,
        discount_code_id: 9,
        discount_code_snapshot: "WELCOME20",
        customer_first_name: "محمد",
        customer_last_name: "رضایی",
        customer_email: "m.rezaei@example.com",
        customer_phone_number: "09120000001",
        payment_gateway: "ZARINPAL",
        payment_authority: "A000111222",
        payment_reference_id: "REF119922",
        payment_url: null,
        payment_attempts_count: 1,
        last_payment_error: null,
        paid_at: "2026-07-22T09:18:00.000Z",
        payment_verified_at: "2026-07-22T09:19:10.000Z",
        expires_at: null,
        cancelled_at: null,
        notes: "تکمیل سفارش بدون مشکل",
        metadata: { source: "web" },
        created_at: "2026-07-22T09:11:00.000Z",
        items: [
            {
                id: "item-1",
                course_id: 12,
                course_title_snapshot: "آموزش React پیشرفته",
                course_slug_snapshot: "advanced-react",
                quantity: 1,
                base_unit_price: 1200000,
                discounted_unit_price: 1000000,
                coupon_discount_amount: 150000,
                final_unit_price: 850000,
                line_total_amount: 850000,
                has_course_discount: true,
            },
            {
                id: "item-2",
                course_id: 14,
                course_title_snapshot: "آموزش Next.js جامع",
                course_slug_snapshot: "nextjs-complete",
                quantity: 1,
                base_unit_price: 1200000,
                discounted_unit_price: 1200000,
                coupon_discount_amount: 150000,
                final_unit_price: 1050000,
                line_total_amount: 1050000,
                has_course_discount: false,
            },
        ],
        payment_attempts: [
            {
                id: "att-1",
                gateway: "ZARINPAL",
                status: "VERIFIED",
                amount: 1900000,
                authority: "A000111222",
                reference_id: "REF119922",
                payment_url: null,
                error_message: null,
                attempted_at: "2026-07-22T09:13:30.000Z",
                verified_at: "2026-07-22T09:19:10.000Z",
            },
        ],
    },
    {
        id: "ord-2",
        order_number: "ORD-2026-0002",
        user_id: 72,
        cart_id: 802,
        status: "AWAITING_PAYMENT",
        payment_status: "PENDING",
        currency: "IRR",
        subtotal_amount: 980000,
        course_discount_amount: 0,
        coupon_discount_amount: 0,
        total_discount_amount: 0,
        payable_amount: 980000,
        discount_code_id: null,
        discount_code_snapshot: null,
        customer_first_name: "سارا",
        customer_last_name: "کریمی",
        customer_email: "sara@example.com",
        customer_phone_number: "09121110002",
        payment_gateway: "IDPAY",
        payment_authority: "AUTH-7788",
        payment_reference_id: null,
        payment_url: "https://gateway.example/pay/7788",
        payment_attempts_count: 2,
        last_payment_error: "Timeout from gateway",
        paid_at: null,
        payment_verified_at: null,
        expires_at: "2026-07-26T08:00:00.000Z",
        cancelled_at: null,
        notes: null,
        metadata: null,
        created_at: "2026-07-24T08:10:00.000Z",
        items: [
            {
                id: "item-3",
                course_id: 21,
                course_title_snapshot: "آموزش DevOps مقدماتی",
                course_slug_snapshot: "devops-starter",
                quantity: 1,
                base_unit_price: 980000,
                discounted_unit_price: null,
                coupon_discount_amount: 0,
                final_unit_price: 980000,
                line_total_amount: 980000,
                has_course_discount: false,
            },
        ],
        payment_attempts: [
            {
                id: "att-2",
                gateway: "IDPAY",
                status: "FAILED",
                amount: 980000,
                authority: "AUTH-7788",
                reference_id: null,
                payment_url: null,
                error_message: "Timeout",
                attempted_at: "2026-07-24T08:11:00.000Z",
                verified_at: null,
            },
            {
                id: "att-3",
                gateway: "IDPAY",
                status: "REDIRECTED",
                amount: 980000,
                authority: "AUTH-7790",
                reference_id: null,
                payment_url: "https://gateway.example/pay/7790",
                error_message: null,
                attempted_at: "2026-07-24T09:05:00.000Z",
                verified_at: null,
            },
        ],
    },
    {
        id: "ord-3",
        order_number: "ORD-2026-0003",
        user_id: 88,
        cart_id: 803,
        status: "CANCELLED",
        payment_status: "UNPAID",
        currency: "IRR",
        subtotal_amount: 620000,
        course_discount_amount: 0,
        coupon_discount_amount: 0,
        total_discount_amount: 0,
        payable_amount: 620000,
        discount_code_id: null,
        discount_code_snapshot: null,
        customer_first_name: "مینا",
        customer_last_name: "جعفری",
        customer_email: "mina@example.com",
        customer_phone_number: "09123334444",
        payment_gateway: null,
        payment_authority: null,
        payment_reference_id: null,
        payment_url: null,
        payment_attempts_count: 0,
        last_payment_error: null,
        paid_at: null,
        payment_verified_at: null,
        expires_at: null,
        cancelled_at: "2026-07-24T14:00:00.000Z",
        notes: "لغو توسط کاربر",
        metadata: null,
        created_at: "2026-07-24T10:00:00.000Z",
        items: [
            {
                id: "item-4",
                course_id: 10,
                course_title_snapshot: "TypeScript کاربردی",
                course_slug_snapshot: "practical-typescript",
                quantity: 1,
                base_unit_price: 620000,
                discounted_unit_price: null,
                coupon_discount_amount: 0,
                final_unit_price: 620000,
                line_total_amount: 620000,
                has_course_discount: false,
            },
        ],
        payment_attempts: [],
    },
];

function toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOrderStatus(status: string | undefined): OrderStatus {
    const normalized = String(status ?? "PENDING").toUpperCase();
    const valid: OrderStatus[] = [
        "PENDING",
        "AWAITING_PAYMENT",
        "PAID",
        "COMPLETED",
        "CANCELLED",
        "FAILED",
        "EXPIRED",
        "REFUNDED",
    ];
    return valid.includes(normalized as OrderStatus) ? (normalized as OrderStatus) : "PENDING";
}

function normalizePaymentStatus(status: string | undefined): OrderPaymentStatus {
    const normalized = String(status ?? "UNPAID").toUpperCase();
    const valid: OrderPaymentStatus[] = [
        "UNPAID",
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIAL_REFUNDED",
    ];
    return valid.includes(normalized as OrderPaymentStatus)
        ? (normalized as OrderPaymentStatus)
        : "UNPAID";
}

function normalizeGateway(gateway: string | undefined | null): PaymentGatewayName | null {
    if (!gateway) return null;
    const normalized = gateway.toUpperCase();
    const valid: PaymentGatewayName[] = ["ZARINPAL", "IDPAY", "ZIBAL", "NEXTPAY", "UNKNOWN"];
    return valid.includes(normalized as PaymentGatewayName)
        ? (normalized as PaymentGatewayName)
        : "UNKNOWN";
}

function normalizeAttemptStatus(status: string | undefined): PaymentAttemptStatus {
    const normalized = String(status ?? "INITIATED").toUpperCase();
    const valid: PaymentAttemptStatus[] = [
        "INITIATED",
        "REDIRECTED",
        "CALLBACK_RECEIVED",
        "VERIFIED",
        "FAILED",
        "CANCELLED",
    ];
    return valid.includes(normalized as PaymentAttemptStatus)
        ? (normalized as PaymentAttemptStatus)
        : "INITIATED";
}

function normalizeOrder(raw: ApiOrder, index: number): OrderRecord | null {
    const orderNumber = String(raw.order_number ?? "").trim();
    if (!orderNumber) return null;

    const itemsRaw = Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.order_items)
            ? raw.order_items
            : [];

    const attemptsRaw = Array.isArray(raw.payment_attempts)
        ? raw.payment_attempts
        : Array.isArray(raw.attempts)
            ? raw.attempts
            : [];

    return {
        id: String(raw.id ?? raw._id ?? `order-${index}`),
        order_number: orderNumber,
        user_id: toNullableNumber(raw.user_id),
        cart_id: toNullableNumber(raw.cart_id),
        status: normalizeOrderStatus(raw.status),
        payment_status: normalizePaymentStatus(raw.payment_status),
        currency: String(raw.currency ?? "IRR"),
        subtotal_amount: toNumber(raw.subtotal_amount),
        course_discount_amount: toNumber(raw.course_discount_amount),
        coupon_discount_amount: toNumber(raw.coupon_discount_amount),
        total_discount_amount: toNumber(raw.total_discount_amount),
        payable_amount: toNumber(raw.payable_amount),
        discount_code_id: toNullableNumber(raw.discount_code_id),
        discount_code_snapshot: raw.discount_code_snapshot ?? null,
        customer_first_name: raw.customer_first_name ?? null,
        customer_last_name: raw.customer_last_name ?? null,
        customer_email: raw.customer_email ?? null,
        customer_phone_number: raw.customer_phone_number ?? null,
        payment_gateway: normalizeGateway(raw.payment_gateway),
        payment_authority: raw.payment_authority ?? null,
        payment_reference_id: raw.payment_reference_id ?? null,
        payment_url: raw.payment_url ?? null,
        payment_attempts_count: toNumber(raw.payment_attempts_count),
        last_payment_error: raw.last_payment_error ?? null,
        paid_at: raw.paid_at ?? null,
        payment_verified_at: raw.payment_verified_at ?? null,
        expires_at: raw.expires_at ?? null,
        cancelled_at: raw.cancelled_at ?? null,
        notes: raw.notes ?? null,
        metadata: raw.metadata ?? null,
        created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
        items: itemsRaw.map((item, itemIndex) => ({
            id: String(item.id ?? `${index}-item-${itemIndex}`),
            course_id: toNullableNumber(item.course_id),
            course_title_snapshot: String(item.course_title_snapshot ?? "درس/دوره نامشخص"),
            course_slug_snapshot: item.course_slug_snapshot ?? null,
            quantity: toNumber(item.quantity, 1),
            base_unit_price: toNumber(item.base_unit_price),
            discounted_unit_price: toNullableNumber(item.discounted_unit_price),
            coupon_discount_amount: toNumber(item.coupon_discount_amount),
            final_unit_price: toNumber(item.final_unit_price),
            line_total_amount: toNumber(item.line_total_amount),
            has_course_discount: Boolean(item.has_course_discount),
        })),
        payment_attempts: attemptsRaw.map((attempt, attemptIndex) => ({
            id: String(attempt.id ?? `${index}-attempt-${attemptIndex}`),
            gateway: normalizeGateway(attempt.gateway) ?? "UNKNOWN",
            status: normalizeAttemptStatus(attempt.status),
            amount: toNumber(attempt.amount),
            authority: attempt.authority ?? null,
            reference_id: attempt.reference_id ?? null,
            payment_url: attempt.payment_url ?? null,
            error_message: attempt.error_message ?? null,
            attempted_at: attempt.attempted_at ?? null,
            verified_at: attempt.verified_at ?? null,
        })),
    };
}

function formatCurrency(value: number, currency = "IRR"): string {
    return `${value.toLocaleString("fa-IR")} ${currency}`;
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

function getCustomerName(order: OrderRecord): string {
    const fullName = `${order.customer_first_name ?? ""} ${order.customer_last_name ?? ""}`.trim();
    return fullName || "بدون نام";
}

function orderStatusBadge(status: OrderStatus): { label: string; variant: "default" | "secondary" | "outline" } {
    if (status === "PAID" || status === "COMPLETED") return { label: "تکمیل شده", variant: "default" };
    if (status === "AWAITING_PAYMENT" || status === "PENDING") {
        return { label: "در انتظار پرداخت", variant: "secondary" };
    }
    if (status === "FAILED") return { label: "ناموفق", variant: "outline" };
    if (status === "EXPIRED") return { label: "منقضی", variant: "outline" };
    if (status === "REFUNDED") return { label: "عودت وجه", variant: "outline" };
    return { label: "لغو شده", variant: "outline" };
}

function paymentStatusBadge(status: OrderPaymentStatus): { label: string; variant: "default" | "secondary" | "outline" } {
    if (status === "PAID") return { label: "پرداخت شده", variant: "default" };
    if (status === "PENDING") return { label: "پرداخت در جریان", variant: "secondary" };
    if (status === "FAILED") return { label: "خطا در پرداخت", variant: "outline" };
    if (status === "REFUNDED" || status === "PARTIAL_REFUNDED") {
        return { label: "عودت وجه", variant: "outline" };
    }
    return { label: "پرداخت نشده", variant: "outline" };
}

async function fetchOrders(): Promise<OrderRecord[]> {
    const response = await api.get<OrdersListResponse | ApiOrder[]>(endpoints.admin.orders.list);
    const payload = response.data;

    let rawItems: ApiOrder[] = [];
    if (Array.isArray(payload)) {
        rawItems = payload;
    } else if (Array.isArray(payload?.items)) {
        rawItems = payload.items;
    } else if (Array.isArray(payload?.orders)) {
        rawItems = payload.orders;
    } else if (Array.isArray(payload?.data)) {
        rawItems = payload.data;
    }

    return rawItems
        .map((item, index) => normalizeOrder(item, index))
        .filter((item): item is OrderRecord => item !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default function AdminOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [paymentFilter, setPaymentFilter] = useState<"all" | OrderPaymentStatus>("all");
    const [gatewayFilter, setGatewayFilter] = useState<"all" | PaymentGatewayName>("all");
    const [discountFilter, setDiscountFilter] = useState<"all" | "with" | "without">("all");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [detailTarget, setDetailTarget] = useState<OrderRecord | null>(null);
    const [editTarget, setEditTarget] = useState<OrderRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<OrderRecord | null>(null);
    const [updateForm, setUpdateForm] = useState<OrderUpdateFormState>(defaultUpdateForm);

    const ordersQuery = useQuery({
        queryKey: ["admin-orders"],
        queryFn: fetchOrders,
        retry: false,
    });

    const orders = useMemo(() => {
        if (ordersQuery.data && ordersQuery.data.length > 0) return ordersQuery.data;
        if (ordersQuery.isError) return mockOrders;
        return ordersQuery.data ?? [];
    }, [ordersQuery.data, ordersQuery.isError]);

    const updateOrderMutation = useMutation({
        mutationFn: async (payload: { id: string; body: Record<string, unknown> }) => {
            await api.patch(endpoints.admin.orders.update(payload.id), payload.body);
        },
        onSuccess: async () => {
            toast.success("سفارش با موفقیت بروزرسانی شد.");
            await ordersQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const markPaidMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(endpoints.admin.orders.markAsPaid(id));
        },
        onSuccess: async () => {
            toast.success("سفارش به عنوان پرداخت شده ثبت شد.");
            await ordersQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(endpoints.admin.orders.cancel(id));
        },
        onSuccess: async () => {
            toast.success("سفارش لغو شد.");
            await ordersQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(endpoints.admin.orders.delete(id));
        },
        onSuccess: async () => {
            toast.success("سفارش حذف شد.");
            await ordersQuery.refetch();
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        const min = minAmount.trim() ? Number(minAmount) : null;
        const max = maxAmount.trim() ? Number(maxAmount) : null;
        const fromTime = fromDate ? new Date(fromDate).getTime() : null;
        const toTime = toDate ? new Date(toDate).getTime() : null;

        return orders.filter((order) => {
            if (statusFilter !== "all" && order.status !== statusFilter) return false;
            if (paymentFilter !== "all" && order.payment_status !== paymentFilter) return false;
            if (gatewayFilter !== "all" && (order.payment_gateway ?? "UNKNOWN") !== gatewayFilter) return false;
            if (discountFilter === "with" && !order.discount_code_snapshot) return false;
            if (discountFilter === "without" && order.discount_code_snapshot) return false;
            if (min !== null && Number.isFinite(min) && order.payable_amount < min) return false;
            if (max !== null && Number.isFinite(max) && order.payable_amount > max) return false;

            const createdTime = new Date(order.created_at).getTime();
            if (fromTime !== null && Number.isFinite(fromTime) && createdTime < fromTime) return false;
            if (toTime !== null && Number.isFinite(toTime) && createdTime > toTime) return false;

            if (!q) return true;

            return (
                order.order_number.toLowerCase().includes(q) ||
                getCustomerName(order).toLowerCase().includes(q) ||
                (order.customer_email ?? "").toLowerCase().includes(q) ||
                (order.customer_phone_number ?? "").toLowerCase().includes(q) ||
                (order.discount_code_snapshot ?? "").toLowerCase().includes(q) ||
                (order.payment_reference_id ?? "").toLowerCase().includes(q)
            );
        });
    }, [
        orders,
        search,
        statusFilter,
        paymentFilter,
        gatewayFilter,
        discountFilter,
        minAmount,
        maxAmount,
        fromDate,
        toDate,
    ]);

    const stats = useMemo(() => {
        const total = orders.length;
        const paid = orders.filter((o) => o.payment_status === "PAID").length;
        const pending = orders.filter((o) => o.payment_status === "PENDING" || o.payment_status === "UNPAID").length;
        const revenue = orders
            .filter((o) => o.payment_status === "PAID")
            .reduce((sum, order) => sum + order.payable_amount, 0);
        return { total, paid, pending, revenue };
    }, [orders]);

    const openEditDialog = (order: OrderRecord) => {
        setEditTarget(order);
        setUpdateForm({
            status: order.status,
            payment_status: order.payment_status,
            payment_gateway: order.payment_gateway ?? "",
            payment_reference_id: order.payment_reference_id ?? "",
            notes: order.notes ?? "",
            last_payment_error: order.last_payment_error ?? "",
        });
    };

    const saveOrderUpdate = async () => {
        if (!editTarget) return;
        const payload = {
            status: updateForm.status,
            payment_status: updateForm.payment_status,
            payment_gateway: updateForm.payment_gateway || null,
            payment_reference_id: updateForm.payment_reference_id.trim() || null,
            notes: updateForm.notes.trim() || null,
            last_payment_error: updateForm.last_payment_error.trim() || null,
        };

        await updateOrderMutation.mutateAsync({
            id: editTarget.id,
            body: payload,
        });

        setEditTarget(null);
        setUpdateForm(defaultUpdateForm);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">مدیریت سفارشات</h2>
                    <p className="text-sm text-muted-foreground">
                        مشاهده، فیلتر، بررسی جزئیات سفارش، مدیریت پرداخت و وضعیت نهایی سفارشات.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void ordersQuery.refetch()}
                    disabled={ordersQuery.isFetching}
                >
                    {ordersQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    بروزرسانی
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">کل سفارشات</p>
                        <p className="mt-1 text-2xl font-bold">{stats.total.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">پرداخت شده</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{stats.paid.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">در انتظار پرداخت</p>
                        <p className="mt-1 text-2xl font-bold">{stats.pending.toLocaleString("fa-IR")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">درآمد قطعی</p>
                        <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">فیلتر سفارشات</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative xl:col-span-2">
                        <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pr-9"
                            placeholder="جستجو بر اساس شماره سفارش، نام، ایمیل، موبایل، کد تخفیف یا ref"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as "all" | OrderStatus)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت سفارش" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه وضعیت سفارش</SelectItem>
                            <SelectItem value="PENDING">در انتظار</SelectItem>
                            <SelectItem value="AWAITING_PAYMENT">منتظر پرداخت</SelectItem>
                            <SelectItem value="PAID">پرداخت شده</SelectItem>
                            <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                            <SelectItem value="FAILED">ناموفق</SelectItem>
                            <SelectItem value="CANCELLED">لغو شده</SelectItem>
                            <SelectItem value="EXPIRED">منقضی</SelectItem>
                            <SelectItem value="REFUNDED">عودت وجه</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={paymentFilter}
                        onValueChange={(value) => setPaymentFilter(value as "all" | OrderPaymentStatus)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت پرداخت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه وضعیت پرداخت</SelectItem>
                            <SelectItem value="UNPAID">پرداخت نشده</SelectItem>
                            <SelectItem value="PENDING">پرداخت در جریان</SelectItem>
                            <SelectItem value="PAID">پرداخت شده</SelectItem>
                            <SelectItem value="FAILED">خطا در پرداخت</SelectItem>
                            <SelectItem value="REFUNDED">عودت وجه کامل</SelectItem>
                            <SelectItem value="PARTIAL_REFUNDED">عودت وجه جزئی</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={gatewayFilter}
                        onValueChange={(value) => setGatewayFilter(value as "all" | PaymentGatewayName)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="درگاه پرداخت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه درگاه‌ها</SelectItem>
                            <SelectItem value="ZARINPAL">Zarinpal</SelectItem>
                            <SelectItem value="IDPAY">IDPay</SelectItem>
                            <SelectItem value="ZIBAL">Zibal</SelectItem>
                            <SelectItem value="NEXTPAY">NextPay</SelectItem>
                            <SelectItem value="UNKNOWN">نامشخص</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={discountFilter}
                        onValueChange={(value) => setDiscountFilter(value as "all" | "with" | "without")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="کد تخفیف" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه سفارشات</SelectItem>
                            <SelectItem value="with">دارای کد تخفیف</SelectItem>
                            <SelectItem value="without">بدون کد تخفیف</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        value={minAmount}
                        onChange={(event) => setMinAmount(event.target.value)}
                        placeholder="حداقل مبلغ پرداختی"
                        type="number"
                        min={0}
                    />

                    <Input
                        value={maxAmount}
                        onChange={(event) => setMaxAmount(event.target.value)}
                        placeholder="حداکثر مبلغ پرداختی"
                        type="number"
                        min={0}
                    />

                    <Input
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                        placeholder="از تاریخ"
                        type="date"
                    />

                    <Input
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                        placeholder="تا تاریخ"
                        type="date"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">لیست سفارشات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>سفارش</TableHead>
                                    <TableHead>وضعیت</TableHead>
                                    <TableHead>مبالغ</TableHead>
                                    <TableHead>کد تخفیف</TableHead>
                                    <TableHead>پرداخت</TableHead>
                                    <TableHead>تاریخ ثبت</TableHead>
                                    <TableHead>عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordersQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                در حال دریافت سفارشات...
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            سفارشی با این فیلتر پیدا نشد.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const orderStatus = orderStatusBadge(order.status);
                                        const paymentStatus = paymentStatusBadge(order.payment_status);

                                        return (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-semibold" dir="ltr">{order.order_number}</p>
                                                        <p className="text-xs text-muted-foreground">{getCustomerName(order)}</p>
                                                        <p className="text-xs text-muted-foreground" dir="ltr">{order.customer_phone_number ?? "—"}</p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
                                                        <Badge variant={paymentStatus.variant}>{paymentStatus.label}</Badge>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1 text-xs">
                                                        <p>جمع: {formatCurrency(order.subtotal_amount, order.currency)}</p>
                                                        <p>تخفیف: {formatCurrency(order.total_discount_amount, order.currency)}</p>
                                                        <p className="font-semibold">قابل پرداخت: {formatCurrency(order.payable_amount, order.currency)}</p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="text-sm" dir="ltr">{order.discount_code_snapshot ?? "—"}</p>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        <p>{order.payment_gateway ?? "—"}</p>
                                                        <p dir="ltr">Ref: {order.payment_reference_id ?? "—"}</p>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDateTime(order.created_at)}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => setDetailTarget(order)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditDialog(order)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={async () => {
                                                                await markPaidMutation.mutateAsync(order.id);
                                                            }}
                                                            disabled={markPaidMutation.isPending}
                                                        >
                                                            <BadgeCheck className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={async () => {
                                                                await cancelMutation.mutateAsync(order.id);
                                                            }}
                                                            disabled={cancelMutation.isPending}
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => setDeleteTarget(order)}
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

            <Dialog open={Boolean(detailTarget)} onOpenChange={(open) => !open && setDetailTarget(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>جزئیات سفارش</DialogTitle>
                        <DialogDescription>
                            شماره سفارش: <span className="font-semibold" dir="ltr">{detailTarget?.order_number}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {detailTarget ? (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                    <CardContent className="p-3 text-sm">
                                        <p className="text-muted-foreground">مشتری</p>
                                        <p className="font-medium">{getCustomerName(detailTarget)}</p>
                                        <p dir="ltr" className="text-xs text-muted-foreground">{detailTarget.customer_email ?? "—"}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3 text-sm">
                                        <p className="text-muted-foreground">درگاه/رفرنس</p>
                                        <p>{detailTarget.payment_gateway ?? "—"}</p>
                                        <p dir="ltr" className="text-xs text-muted-foreground">{detailTarget.payment_reference_id ?? "—"}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3 text-sm">
                                        <p className="text-muted-foreground">زمان‌ها</p>
                                        <p className="text-xs">ثبت: {formatDateTime(detailTarget.created_at)}</p>
                                        <p className="text-xs">پرداخت: {formatDateTime(detailTarget.paid_at)}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3 text-sm">
                                        <p className="text-muted-foreground">مبالغ</p>
                                        <p className="text-xs">جمع: {formatCurrency(detailTarget.subtotal_amount, detailTarget.currency)}</p>
                                        <p className="text-xs">تخفیف: {formatCurrency(detailTarget.total_discount_amount, detailTarget.currency)}</p>
                                        <p className="font-semibold text-xs">نهایی: {formatCurrency(detailTarget.payable_amount, detailTarget.currency)}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="mb-2 text-sm font-semibold">آیتم‌های سفارش</h4>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>دوره</TableHead>
                                                <TableHead>تعداد</TableHead>
                                                <TableHead>قیمت پایه</TableHead>
                                                <TableHead>تخفیف کوپن</TableHead>
                                                <TableHead>قیمت نهایی</TableHead>
                                                <TableHead>جمع سطر</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detailTarget.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium">{item.course_title_snapshot}</p>
                                                            <p className="text-xs text-muted-foreground" dir="ltr">/{item.course_slug_snapshot ?? "-"}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.quantity.toLocaleString("fa-IR")}</TableCell>
                                                    <TableCell>{formatCurrency(item.base_unit_price, detailTarget.currency)}</TableCell>
                                                    <TableCell>{formatCurrency(item.coupon_discount_amount, detailTarget.currency)}</TableCell>
                                                    <TableCell>{formatCurrency(item.final_unit_price, detailTarget.currency)}</TableCell>
                                                    <TableCell>{formatCurrency(item.line_total_amount, detailTarget.currency)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-2 text-sm font-semibold">تلاش‌های پرداخت</h4>
                                <div className="space-y-2">
                                    {detailTarget.payment_attempts.length === 0 ? (
                                        <p className="rounded-md border p-3 text-sm text-muted-foreground">
                                            تلاش پرداختی برای این سفارش ثبت نشده است.
                                        </p>
                                    ) : (
                                        detailTarget.payment_attempts.map((attempt) => (
                                            <div key={attempt.id} className="rounded-md border p-3 text-sm">
                                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                                    <p><span className="text-muted-foreground">درگاه:</span> {attempt.gateway}</p>
                                                    <p><span className="text-muted-foreground">وضعیت:</span> {attempt.status}</p>
                                                    <p><span className="text-muted-foreground">مبلغ:</span> {formatCurrency(attempt.amount, detailTarget.currency)}</p>
                                                    <p dir="ltr"><span className="text-muted-foreground">Ref:</span> {attempt.reference_id ?? "—"}</p>
                                                </div>
                                                <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                                                    <p>شروع: {formatDateTime(attempt.attempted_at)}</p>
                                                    <p>تایید: {formatDateTime(attempt.verified_at)}</p>
                                                </div>
                                                {attempt.error_message ? (
                                                    <p className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                                                        {attempt.error_message}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {detailTarget.notes || detailTarget.last_payment_error ? (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">یادداشت / خطای پرداخت</h4>
                                    {detailTarget.notes ? (
                                        <p className="rounded-md border bg-muted/20 p-3 text-sm">{detailTarget.notes}</p>
                                    ) : null}
                                    {detailTarget.last_payment_error ? (
                                        <p className="rounded-md border bg-destructive/10 p-3 text-sm text-destructive">{detailTarget.last_payment_error}</p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>ویرایش سفارش</DialogTitle>
                        <DialogDescription>
                            بروزرسانی وضعیت سفارش، وضعیت پرداخت، ref پرداخت و یادداشت‌ها.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>وضعیت سفارش</Label>
                            <Select
                                value={updateForm.status}
                                onValueChange={(value) =>
                                    setUpdateForm((prev) => ({ ...prev, status: value as OrderStatus }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">در انتظار</SelectItem>
                                    <SelectItem value="AWAITING_PAYMENT">منتظر پرداخت</SelectItem>
                                    <SelectItem value="PAID">پرداخت شده</SelectItem>
                                    <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                                    <SelectItem value="FAILED">ناموفق</SelectItem>
                                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                                    <SelectItem value="EXPIRED">منقضی</SelectItem>
                                    <SelectItem value="REFUNDED">عودت وجه</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>وضعیت پرداخت</Label>
                            <Select
                                value={updateForm.payment_status}
                                onValueChange={(value) =>
                                    setUpdateForm((prev) => ({ ...prev, payment_status: value as OrderPaymentStatus }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNPAID">پرداخت نشده</SelectItem>
                                    <SelectItem value="PENDING">در جریان</SelectItem>
                                    <SelectItem value="PAID">پرداخت شده</SelectItem>
                                    <SelectItem value="FAILED">ناموفق</SelectItem>
                                    <SelectItem value="REFUNDED">عودت کامل</SelectItem>
                                    <SelectItem value="PARTIAL_REFUNDED">عودت جزئی</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>درگاه پرداخت</Label>
                            <Select
                                value={updateForm.payment_gateway || "NONE"}
                                onValueChange={(value) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        payment_gateway: value === "NONE" ? "" : (value as PaymentGatewayName),
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">انتخاب نشده</SelectItem>
                                    <SelectItem value="ZARINPAL">Zarinpal</SelectItem>
                                    <SelectItem value="IDPAY">IDPay</SelectItem>
                                    <SelectItem value="ZIBAL">Zibal</SelectItem>
                                    <SelectItem value="NEXTPAY">NextPay</SelectItem>
                                    <SelectItem value="UNKNOWN">نامشخص</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="payment-ref">کد رهگیری پرداخت</Label>
                            <Input
                                id="payment-ref"
                                value={updateForm.payment_reference_id}
                                onChange={(event) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        payment_reference_id: event.target.value,
                                    }))
                                }
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="notes">یادداشت سفارش</Label>
                            <Textarea
                                id="notes"
                                rows={3}
                                value={updateForm.notes}
                                onChange={(event) =>
                                    setUpdateForm((prev) => ({ ...prev, notes: event.target.value }))
                                }
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="error-message">آخرین خطای پرداخت</Label>
                            <Textarea
                                id="error-message"
                                rows={3}
                                value={updateForm.last_payment_error}
                                onChange={(event) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        last_payment_error: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                            انصراف
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void saveOrderUpdate()}
                            disabled={updateOrderMutation.isPending}
                            className="gap-2"
                        >
                            {updateOrderMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            ذخیره تغییرات
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>حذف سفارش</DialogTitle>
                        <DialogDescription>
                            آیا از حذف سفارش <span dir="ltr" className="font-semibold">{deleteTarget?.order_number}</span> مطمئن هستید؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                        <Button
                            type="button"
                            className="gap-2"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                                if (!deleteTarget) return;
                                await deleteMutation.mutateAsync(deleteTarget.id);
                                setDeleteTarget(null);
                            }}
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            حذف نهایی
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {ordersQuery.isError ? (
                <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                        اتصال به API سفارشات برقرار نشد؛ داده نمونه برای ادامه مدیریت نمایش داده می‌شود.
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
