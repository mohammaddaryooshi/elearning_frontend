import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>درباره ما</CardTitle>
                    <CardDescription>آشنایی کوتاه با آکادمی آنلاین</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        این صفحه برای معرفی آکادمی آنلاین و مسیر آموزشی آن در نظر گرفته شده است.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
