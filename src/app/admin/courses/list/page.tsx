// app/admin/courses/page.tsx  — part 1/2
"use client";

import { useMemo, useState } from "react";
import { Plus, Search, BookX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CoursesTable } from "@/features/admin/courses/components/CoursesTable";
import type { AdminCourseRow, CourseStatus } from "@/features/admin/courses/components/CoursesTable";

// ─── Mock data ────────────────────────────────────────────────────────────────
const CATEGORIES = ["برنامه‌نویسی", "طراحی", "دیجیتال مارکتینگ", "هوش مصنوعی", "عمومی"];

const INSTRUCTORS = ["محمد جواد داریوشی", "رضا محمدی", "سارا کریمی", "علی شفیعی"];

const initialCourses: AdminCourseRow[] = [
    { id: "1", title: "آموزش NestJS از صفر تا صد", slug: "nestjs-from-zero", status: "published", created_at: "1405/01/10", published_at: "1405/01/15", category: "برنامه‌نویسی", instructor: "محمد جواد داریوشی", students: 1240, price: 490000, is_free: false },
    { id: "2", title: "Next.js App Router کامل", slug: "nextjs-app-router", status: "published", created_at: "1405/02/05", published_at: "1405/02/10", category: "برنامه‌نویسی", instructor: "محمد جواد داریوشی", students: 980, price: 390000, is_free: false },
    { id: "3", title: "طراحی UI با Figma", slug: "ui-design-figma", status: "draft", created_at: "1405/04/20", published_at: undefined, category: "طراحی", instructor: "سارا کریمی", students: 0, price: 250000, is_free: false },
    { id: "4", title: "SEO پیشرفته برای سایت‌ها", slug: "advanced-seo", status: "suspended", created_at: "1404/10/01", published_at: "1404/10/20", category: "دیجیتال مارکتینگ", instructor: "رضا محمدی", students: 430, price: 0, is_free: true },
    { id: "5", title: "مقدمه هوش مصنوعی با Python", slug: "ai-with-python", status: "published", created_at: "1405/03/01", published_at: "1405/03/05", category: "هوش مصنوعی", instructor: "سارا کریمی", students: 3210, price: 650000, is_free: false },
    { id: "6", title: "TypeScript پیشرفته", slug: "advanced-typescript", status: "published", created_at: "1405/02/15", published_at: "1405/02/18", category: "برنامه‌نویسی", instructor: "علی شفیعی", students: 760, price: 320000, is_free: false },
    { id: "7", title: "Tailwind CSS از صفر", slug: "tailwind-css-zero", status: "draft", created_at: "1405/05/01", published_at: undefined, category: "طراحی", instructor: "محمد جواد داریوشی", students: 0, price: 180000, is_free: false },
    { id: "8", title: "بازاریابی محتوا", slug: "content-marketing", status: "published", created_at: "1404/11/05", published_at: "1404/11/10", category: "دیجیتال مارکتینگ", instructor: "رضا محمدی", students: 95, price: 150000, is_free: false },
    { id: "9", title: "Docker و DevOps مقدماتی", slug: "docker-devops-intro", status: "published", created_at: "1405/01/20", published_at: "1405/01/25", category: "عمومی", instructor: "علی شفیعی", students: 2100, price: 0, is_free: true },
    { id: "10", title: "React Query و TanStack", slug: "react-query-tanstack", status: "suspended", created_at: "1404/09/10", published_at: "1404/09/20", category: "برنامه‌نویسی", instructor: "محمد جواد داریوشی", students: 320, price: 280000, is_free: false },
];
// ─────────────────────────────────────────────────────────────────────────────

type SortFilter = "all" | "most-students" | "least-students";
type StatusFilter = "all" | CourseStatus;
type PriceFilter = "all" | "free" | "paid";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<AdminCourseRow[]>(initialCourses);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortFilter, setSortFilter] = useState<SortFilter>("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [instructorFilter, setInstructorFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
    const [deleteTarget, setDeleteTarget] = useState<AdminCourseRow | null>(null);

    const filteredCourses = useMemo(() => {
        let result = [...courses];

        // جستجو بر اساس نام دوره یا مدرس
        const q = search.trim();
        if (q) {
            result = result.filter(
                (c) => c.title.includes(q) || c.instructor.includes(q)
            );
        }

        // فیلتر وضعیت
        if (statusFilter !== "all") {
            result = result.filter((c) => c.status === statusFilter);
        }

        // فیلتر دسته‌بندی
        if (categoryFilter !== "all") {
            result = result.filter((c) => c.category === categoryFilter);
        }

        // فیلتر مدرس
        if (instructorFilter !== "all") {
            result = result.filter((c) => c.instructor === instructorFilter);
        }

        // فیلتر رایگان / پولی
        if (priceFilter === "free") {
            result = result.filter((c) => c.is_free);
        } else if (priceFilter === "paid") {
            result = result.filter((c) => !c.is_free);
        }

        // مرتب‌سازی
        if (sortFilter === "most-students") {
            result.sort((a, b) => b.students - a.students);
        } else if (sortFilter === "least-students") {
            result.sort((a, b) => a.students - b.students);
        }

        return result;
    }, [courses, search, statusFilter, sortFilter, categoryFilter, instructorFilter, priceFilter]);

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const handleEdit = (course: AdminCourseRow) => {
        // TODO: navigate to edit page
        console.log("edit", course.id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت دوره‌ها</h2>
                <p className="text-sm text-muted-foreground">
                    مشاهده، جستجو و مدیریت دوره‌های آموزشی منتشر شده در سایت.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>لیست دوره‌ها</CardTitle>
                        <Button className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            افزودن دوره
                        </Button>
                    </div>

                    {/* ─── Filters ─── */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                        {/* جستجو */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو بر اساس نام دوره یا مدرس..."
                                className="pr-9"
                            />
                        </div>

                        {/* وضعیت */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="وضعیت دوره" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                                <SelectItem value="published">منتشر شده</SelectItem>
                                <SelectItem value="draft">پیش‌نویس</SelectItem>
                                <SelectItem value="suspended">توقف فروش</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* مرتب‌سازی بر اساس فروش */}
                        <Select
                            value={sortFilter}
                            onValueChange={(v) => setSortFilter(v as SortFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="مرتب‌سازی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">مرتب‌سازی پیش‌فرض</SelectItem>
                                <SelectItem value="most-students">پرفروش‌ترین</SelectItem>
                                <SelectItem value="least-students">کم‌فروش‌ترین</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* دسته‌بندی */}
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="دسته‌بندی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه دسته‌ها</SelectItem>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* مدرس */}
                        <Select
                            value={instructorFilter}
                            onValueChange={setInstructorFilter}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="مدرس" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه مدرسان</SelectItem>
                                {INSTRUCTORS.map((ins) => (
                                    <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* رایگان / پولی */}
                        <Select
                            value={priceFilter}
                            onValueChange={(v) => setPriceFilter(v as PriceFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="نوع دوره" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">رایگان و پولی</SelectItem>
                                <SelectItem value="free">رایگان</SelectItem>
                                <SelectItem value="paid">پولی</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <CoursesTable
                        data={filteredCourses}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── Delete confirm dialog ─── */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookX className="h-5 w-5 text-destructive" />
                            حذف دوره
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف دوره «{deleteTarget?.title}» اطمینان دارید؟ این عملیات
                            قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف دوره
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
