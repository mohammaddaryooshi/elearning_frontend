import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>داشبورد مدیریت</CardTitle>
                <CardDescription>وضعیت کلی پنل مدیریت</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardDescription>کاربران فعال</CardDescription>
                        <CardTitle className="text-3xl">1,240</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardDescription>فروش این ماه</CardDescription>
                        <CardTitle className="text-3xl">423M</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardDescription>دوره های منتشر شده</CardDescription>
                        <CardTitle className="text-3xl">36</CardTitle>
                    </CardHeader>
                </Card>
            </CardContent>
        </Card>
    );
}
