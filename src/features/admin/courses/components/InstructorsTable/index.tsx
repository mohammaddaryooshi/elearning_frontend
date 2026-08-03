// components/admin/instructors-table.tsx
"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

// types/instructor.ts
export interface AdminInstructorRow {
    id: string;
    full_name: string;
    slug: string;
    avatar_image?: string | null;
    headline?: string;
    bio?: string;
    is_active: boolean;
    user_id?: number;
    user_email?: string;
    courses_count: number;
    created_at: string;
}


const PAGE_SIZE = 8;

interface InstructorsTableProps {
    data: AdminInstructorRow[];
    onEdit: (instructor: AdminInstructorRow) => void;
    onDelete: (instructor: AdminInstructorRow) => void;
    hasPagination?: boolean;
}

export function InstructorsTable({
    data,
    onEdit,
    onDelete,
    hasPagination = false,
}: InstructorsTableProps) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const paged = hasPagination
        ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : data;

    // reset page when data changes
    // (useMemo not needed; page resets naturally on filter change if we clamp)
    const safePage = Math.min(page, Math.max(1, totalPages));
    if (safePage !== page) setPage(safePage);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                <BookOpen className="h-10 w-10 opacity-30" />
                <p className="text-sm">هیچ مدرسی یافت نشد.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">مدرس</TableHead>
                            <TableHead className="text-right hidden md:table-cell">عنوان</TableHead>
                            <TableHead className="text-right hidden lg:table-cell">ایمیل کاربر</TableHead>
                            <TableHead className="text-right">دوره‌ها</TableHead>
                            <TableHead className="text-right">وضعیت</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">تاریخ ثبت</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paged.map((instructor) => (
                            <TableRow key={instructor.id}>
                                {/* آواتار + نام */}
                                <TableCell>
                                    <div className="flex items-center gap-3 min-w-[160px]">
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarImage src={instructor?.avatar_image ?? undefined} alt={instructor.full_name} />
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                                {instructor.full_name.slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm leading-tight">
                                                {instructor.full_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {instructor.slug}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* headline */}
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                                    {instructor.headline ?? "—"}
                                </TableCell>

                                {/* ایمیل کاربر لینک شده */}
                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                    {instructor.user_email ?? (
                                        <span className="italic opacity-50">بدون حساب</span>
                                    )}
                                </TableCell>

                                {/* تعداد دوره */}
                                <TableCell>
                                    <Badge variant="secondary">{instructor.courses_count} دوره</Badge>
                                </TableCell>

                                {/* وضعیت */}
                                <TableCell>
                                    {instructor.is_active ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                                            فعال
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            غیرفعال
                                        </Badge>
                                    )}
                                </TableCell>

                                {/* تاریخ */}
                                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                    {instructor.created_at}
                                </TableCell>

                                {/* actions */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">عملیات</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(instructor)}>
                                                <Pencil className="h-4 w-4 ml-2" />
                                                ویرایش
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDelete(instructor)}
                                            >
                                                <Trash2 className="h-4 w-4 ml-2" />
                                                حذف
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {hasPagination && totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        نمایش {(safePage - 1) * PAGE_SIZE + 1}–
                        {Math.min(safePage * PAGE_SIZE, data.length)} از {data.length} مدرس
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8"
                            disabled={safePage === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="px-2">
                            {safePage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8"
                            disabled={safePage === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
