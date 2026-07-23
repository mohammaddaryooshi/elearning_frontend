import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="container flex min-h-screen flex-col items-center justify-center gap-4 py-8">
            <h1 className="text-2xl font-bold">صفحه مورد نظر پیدا نشد</h1>
            <Button asChild>
                <Link href="/">بازگشت به خانه</Link>
            </Button>
        </main>
    );
}
