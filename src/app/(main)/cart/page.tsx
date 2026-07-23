import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>سبد خرید</CardTitle>
                    <CardDescription>محصولات اضافه شده به سبد خرید</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">سبد خرید فعلا نمونه است و به API متصل نشده.</p>
                </CardContent>
            </Card>
        </main>
    );
}
