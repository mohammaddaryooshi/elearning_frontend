import { CourseCard } from "@/components/courses/course-card";
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

export default function CoursesPage() {
    return (
        <main className="container py-10">
            <h1 className="mb-6 text-2xl font-bold">لیست دوره ها</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </main>
    );
}
