// components/admin/courses-table.tsx
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Pencil,
    Trash2,
    ExternalLink,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";


export type CourseStatus = "published" | "draft" | "suspended";

export type AdminCourseRow = {
    id: string;
    title: string;
    slug: string;
    status: CourseStatus;
    created_at: string;
    published_at?: string;
    category: string;
    instructor: string;
    students: number;
    price: number;
    is_free: boolean;
};


const STATUS_MAP: Record<CourseStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
    published: { label: "منتشر شده", variant: "default" },
    draft: { label: "پیش‌نویس", variant: "secondary" },
    suspended: { label: "توقف فروش", variant: "outline" },
};

const PAGE_SIZE = 8;

type Props = {
    data: AdminCourseRow[];
    onEdit: (row: AdminCourseRow) => void;
    onDelete: (row: AdminCourseRow) => void;
    hasPagination?: boolean;
};

export function CoursesTable({ data, onEdit, onDelete, hasPagination }: Props) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const safeePage = Math.min(page, totalPages);
    const paged = hasPagination
        ? data.slice((safeePage - 1) * PAGE_SIZE, safeePage * PAGE_SIZE)
        : data;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">نام دوره</TableHead>
                            <TableHead className="text-right">تاریخ ایجاد</TableHead>
                            <TableHead className="text-right">وضعیت</TableHead>
                            <TableHead className="text-right">تاریخ انتشار</TableHead>
                            <TableHead className="text-right">دسته‌بندی</TableHead>
                            <TableHead className="text-right">مدرس</TableHead>
                            <TableHead className="text-right">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    دانشجو
                                </span>
                            </TableHead>
                            <TableHead className="text-right">لینک</TableHead>
                            <TableHead className="text-right">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paged.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                                    دوره‌ای یافت نشد.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paged.map((course) => {
                                const status = STATUS_MAP[course.status];
                                return (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium max-w-[200px] truncate">
                                            {course.title}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {course.created_at}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {course.published_at ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-sm whitespace-nowrap">
                                            {course.category}
                                        </TableCell>
                                        <TableCell className="text-sm whitespace-nowrap">
                                            {course.instructor}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {course.students.toLocaleString("fa-IR")}
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={`/courses/${course.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                مشاهده
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="default"
                                                    variant="ghost"
                                                    onClick={() => onEdit(course)}
                                                    aria-label="ویرایش"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="default"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => onDelete(course)}
                                                    aria-label="حذف"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {hasPagination && totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        نمایش {((safeePage - 1) * PAGE_SIZE) + 1}–{Math.min(safeePage * PAGE_SIZE, data.length)} از {data.length} دوره
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={safeePage <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            aria-label="صفحه قبل"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="px-2">
                            {safeePage} / {totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={safeePage >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            aria-label="صفحه بعد"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
