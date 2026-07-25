"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, ShieldCheck, Trash2, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/data-table";
import type { PaginationState } from "@tanstack/react-table";

export interface AdminUserRow {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    created_at?: string;
    role: "student" | "admin" | "teacher";
    courses?: UserCourse[];
}

export interface UserCourse {
    id: string;
    title: string;
    enrolledAt?: string;
}

const roleLabels: Record<AdminUserRow["role"], string> = {
    student: "دانشجو",
    admin: "مدیر",
    teacher: "مدرس",
};

interface UserCoursesModalProps {
    user: AdminUserRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemoveAccess: (userId: string, courseId: string) => void;
}

function UserCoursesModal({ user, open, onOpenChange, onRemoveAccess }: UserCoursesModalProps) {
    if (!user) return null;

    const courses = user.courses || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>دوره‌های کاربر</DialogTitle>
                    <DialogDescription>
                        دوره‌های ثبت نام شده برای {user.fullName}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {courses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            این کاربر در هیچ دوره‌ای ثبت نام نکرده است.
                        </p>
                    ) : (
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{course.title}</p>
                                    {course.enrolledAt && (
                                        <p className="text-sm text-muted-foreground">
                                            ثبت نام در: {course.enrolledAt}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRemoveAccess(user.id, course.id)}
                                    className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    حذف دسترسی
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function createColumns(handlers: {
    onEdit: (user: AdminUserRow) => void;
    onDelete: (user: AdminUserRow) => void;
    onViewCourses: (user: AdminUserRow) => void;
}): ColumnDef<AdminUserRow>[] {
    return [
        {
            accessorKey: "fullName",
            header: "نام و نام خانوادگی",
        },
        {
            accessorKey: "phone",
            header: "شماره تماس",
        },
        {
            accessorKey: "email",
            header: "ایمیل",
            cell: ({ row }) => row.getValue("email") || "—",
        },
        {
            accessorKey: "created_at",
            header: "تاریخ ثبت نام",
        },
        {
            accessorKey: "role",
            header: "نقش",
            cell: ({ row }) => {
                const role = row.getValue("role") as AdminUserRow["role"];
                return (
                    <Badge variant={role === "admin" ? "default" : "outline"} className="gap-1">
                        {role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {roleLabels[role]}
                    </Badge>
                );
            },
        },
        {
            id: "courses",
            header: "دوره‌های کاربر",
            cell: ({ row }) => {
                const user = row.original;
                const courseCount = user.courses?.length || 0;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlers.onViewCourses(user)}
                        className="gap-1"
                    >
                        <Eye className="h-4 w-4" />
                        مشاهده{courseCount > 0 && ` (${courseCount})`}
                    </Button>
                );
            },
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex justify-start">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="عملیات">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-card flex flex-col items-end" align="end">
                                <DropdownMenuItem onClick={() => handlers.onEdit(user)} className="gap-2">
                                    <Pencil className="h-4 w-4" />
                                    ویرایش کاربر
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handlers.onDelete(user)}
                                    className="gap-2 text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    حذف کاربر
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}

interface UsersTableProps {
    data: AdminUserRow[];
    onEdit?: (user: AdminUserRow) => void;
    onDelete?: (user: AdminUserRow) => void;
    onRemoveCourseAccess?: (userId: string, courseId: string) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function UsersTable({
    data,
    onEdit = () => { },
    onDelete = () => { },
    onRemoveCourseAccess = () => { },
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: UsersTableProps) {
    const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewCourses = (user: AdminUserRow) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const columns = createColumns({
        onEdit,
        onDelete,
        onViewCourses: handleViewCourses,
    });

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                hasPagination={hasPagination}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            <UserCoursesModal
                user={selectedUser}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onRemoveAccess={onRemoveCourseAccess}
            />
        </>
    );
}
