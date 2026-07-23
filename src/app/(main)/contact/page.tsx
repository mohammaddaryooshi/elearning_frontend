import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>تماس با ما</CardTitle>
                    <CardDescription>راه های ارتباطی با تیم پشتیبانی</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        برای ارتباط با ما می توانید از فرم تماس یا اطلاعات پشتیبانی استفاده کنید.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
