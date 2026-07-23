import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/types";

const courses: Course[] = [
    {
        id: "1",
        title: "Next.js پیشرفته",
        slug: "nextjs-advanced",
        teacher: "رضا محمدی",
        price: 4200000,
        enrolledCount: 240,
    },
    {
        id: "2",
        title: "Redux Toolkit در عمل",
        slug: "redux-toolkit-practical",
        teacher: "علی صادقی",
        price: 2600000,
        enrolledCount: 110,
    },
    {
        id: "3",
        title: "NestJS برای فرانت اند",
        slug: "nestjs-for-frontend",
        teacher: "مریم فیاضی",
        price: 1900000,
        enrolledCount: 87,
    },
];

export default async function CourseDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const course = courses.find((item) => item.slug === slug);

    if (!course) {
        notFound();
    }

    return (
        <main className="container py-10">
            <Card>
                <CardHeader className="gap-3">
                    <Badge className="w-fit">جزئیات دوره</Badge>
                    <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>مدرس: {course.teacher}</p>
                    <p>تعداد دانشجو: {course.enrolledCount}</p>
                    <p>قیمت: {course.price.toLocaleString("fa-IR")} تومان</p>
                </CardContent>
            </Card>
        </main>
    );
}
