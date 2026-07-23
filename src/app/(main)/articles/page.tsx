import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArticlesPage() {
    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>مقالات</CardTitle>
                    <CardDescription>لیست مقالات آموزشی به زودی اینجا نمایش داده می شود.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">فعلا این بخش در حال آماده سازی است.</p>
                </CardContent>
            </Card>
        </main>
    );
}
