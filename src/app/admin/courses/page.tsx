import { CoursesTable } from "@/components/admin/courses-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const courses = [
    { id: "1", title: "Next.js پیشرفته", teacher: "رضا محمدی", students: 240 },
    { id: "2", title: "Redux Toolkit در عمل", teacher: "علی صادقی", students: 110 },
    { id: "3", title: "NestJS برای فرانت اند", teacher: "مریم فیاضی", students: 87 },
];

export default function AdminCoursesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>مدیریت دوره ها</CardTitle>
            </CardHeader>
            <CardContent>
                <CoursesTable data={courses} />
            </CardContent>
        </Card>
    );
}
