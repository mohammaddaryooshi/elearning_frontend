import { GraduationCap, ShoppingBag, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";

const stats = [
    {
        title: "تعداد کل کاربران",
        value: "۱٬۲۴۰",
        icon: Users,
        trend: { value: "۱۲٪ نسبت به ماه قبل", direction: "up" as const },
    },
    {
        title: "تعداد دوره ها",
        value: "۳۶",
        icon: GraduationCap,
        trend: { value: "۲ دوره جدید", direction: "up" as const },
    },
    {
        title: "تعداد کل سفارشات",
        value: "۸۹۲",
        icon: ShoppingBag,
        trend: { value: "۵٪ نسبت به ماه قبل", direction: "up" as const },
    },
    {
        title: "درآمد این ماه",
        value: "۴۲۳٬۰۰۰٬۰۰۰ تومان",
        icon: Wallet,
        trend: { value: "۳٪ کاهش", direction: "down" as const },
    },
];

const recentOrders = [
    { id: "1024", user: "مریم احمدی", course: "Next.js پیشرفته", amount: "۱٬۲۰۰٬۰۰۰", status: "پرداخت شده" },
    { id: "1023", user: "علی شفیعی", course: "Redux Toolkit در عمل", amount: "۸۵۰٬۰۰۰", status: "در انتظار پرداخت" },
    { id: "1022", user: "رضا محمدی", course: "NestJS برای فرانت اند", amount: "۹۹۰٬۰۰۰", status: "پرداخت شده" },
    { id: "1021", user: "سارا کریمی", course: "TypeScript کاربردی", amount: "۶۵۰٬۰۰۰", status: "لغو شده" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    "پرداخت شده": "default",
    "در انتظار پرداخت": "secondary",
    "لغو شده": "outline",
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">داشبورد مدیریت</h2>
                <p className="text-sm text-muted-foreground">وضعیت کلی آکادمی را از این‌جا زیر نظر بگیرید.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>آخرین سفارش ها</CardTitle>
                    <CardDescription>جدیدترین سفارش های ثبت شده در سایت</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                                <div className="flex min-w-0 flex-col gap-1">
                                    <span className="text-sm font-medium text-foreground">{order.user}</span>
                                    <span className="truncate text-xs text-muted-foreground">{order.course}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-foreground">{order.amount} تومان</span>
                                    <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
