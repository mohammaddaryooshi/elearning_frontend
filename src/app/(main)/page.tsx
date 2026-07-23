import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MainHomePage() {
    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>پلتفرم آموزش آنلاین</CardTitle>
                    <CardDescription>ورود با OTP، پنل دانشجو و پنل مدیریت</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/courses">مشاهده دوره ها</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">داشبورد من</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href="/admin">پنل ادمین</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
