import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="secondary">{course.enrolledCount} دانشجو</Badge>
                </div>
                <CardDescription>{course.teacher}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">قیمت دوره: {course.price.toLocaleString("fa-IR")} تومان</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/courses/${course.slug}`}>مشاهده جزئیات</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
