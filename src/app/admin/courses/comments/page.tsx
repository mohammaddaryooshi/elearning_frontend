"use client";

import { useMemo, useState } from "react";
import { Search, MessageSquareX } from "lucide-react";
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
import {
    CourseCommentsTable,
    type AdminCourseCommentRow,
    type CourseCommentStatus,
} from "@/components/admin/course-comments-table";

// ─── Mock data ────────────────────────────────────────────────────────────────
const initialComments: AdminCourseCommentRow[] = [
    {
        id: "1",
        author: "علی رضایی",
        content: "دوره بسیار جامع و کاربردی بود. از مدرس ممنونم.",
        created_at: "1405/04/20",
        course_title: "آموزش NestJS از صفر تا پیشرفته",
        course_slug: "nestjs-from-zero",
        status: "approved",
    },
    {
        id: "2",
        author: "سارا محمدی",
        content: "آیا فایل‌های تمرینی هم برای دانلود موجود است؟",
        created_at: "1405/04/22",
        course_title: "آموزش NestJS از صفر تا پیشرفته",
        course_slug: "nestjs-from-zero",
        status: "pending",
    },
    {
        id: "3",
        author: "رضا کریمی",
        content: "کیفیت صدای ویدیوها پایین است، لطفاً بهبود دهید.",
        created_at: "1405/03/15",
        course_title: "Next.js App Router کامل",
        course_slug: "nextjs-app-router",
        status: "pending",
    },
    {
        id: "4",
        author: "نیلوفر حسینی",
        content: "بهترین دوره‌ای که تا به حال دیده‌ام. کاملاً عملی.",
        created_at: "1405/05/01",
        course_title: "Next.js App Router کامل",
        course_slug: "nextjs-app-router",
        status: "approved",
    },
    {
        id: "5",
        author: "امیر شریفی",
        content: "محتوای تکراری زیاد دارد و به‌روز نیست.",
        created_at: "1405/02/10",
        course_title: "TypeORM و مهاجرت‌های پیشرفته",
        course_slug: "typeorm-migrations",
        status: "rejected",
    },
    {
        id: "6",
        author: "مریم احمدی",
        content: "قسمت احراز هویت را خیلی خوب توضیح داده‌اید.",
        created_at: "1405/04/28",
        course_title: "آموزش NestJS از صفر تا پیشرفته",
        course_slug: "nestjs-from-zero",
        status: "approved",
    },
    {
        id: "7",
        author: "حسین موسوی",
        content: "آیا گواهینامه پایان دوره صادر می‌شود؟",
        created_at: "1405/05/02",
        course_title: "Next.js App Router کامل",
        course_slug: "nextjs-app-router",
        status: "pending",
    },
];
// ─────────────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | CourseCommentStatus;

export default function AdminCourseCommentsPage() {
    const [comments, setComments] = useState<AdminCourseCommentRow[]>(initialComments);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [deleteTarget, setDeleteTarget] = useState<AdminCourseCommentRow | null>(null);

    const filteredComments = useMemo(() => {
        let result = [...comments];

        const q = search.trim();
        if (q) {
            result = result.filter((c) => c.author.includes(q));
        }

        if (statusFilter !== "all") {
            result = result.filter((c) => c.status === statusFilter);
        }

        return result;
    }, [comments, search, statusFilter]);

    const handleReply = (comment: AdminCourseCommentRow, reply: string) => {
        // TODO: call API — POST /course-comments/:id/reply
        console.log("reply to comment", comment.id, ":", reply);
    };

    const handleStatusChange = (id: string, status: CourseCommentStatus) => {
        setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت کامنت‌های دوره‌ها</h2>
                <p className="text-sm text-muted-foreground">
                    مشاهده، تأیید، رد و پاسخ به کامنت‌های دوره‌های آموزشی.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <CardTitle>لیست کامنت‌ها</CardTitle>

                    {/* ─── Filters ─── */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {/* search by author */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو بر اساس نام نویسنده..."
                                className="pr-9"
                            />
                        </div>

                        {/* filter by status */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="وضعیت انتشار" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                                <SelectItem value="pending">در انتظار</SelectItem>
                                <SelectItem value="approved">تأیید شده</SelectItem>
                                <SelectItem value="rejected">رد شده</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <CourseCommentsTable
                        data={filteredComments}
                        onDelete={setDeleteTarget}
                        onReply={handleReply}
                        onStatusChange={handleStatusChange}
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
                            <MessageSquareX className="h-5 w-5 text-destructive" />
                            حذف کامنت
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف کامنت «{deleteTarget?.author}» اطمینان دارید؟ این
                            عملیات قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف کامنت
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
