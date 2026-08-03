"use client";


import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/MainTable";
import type { PaginationState } from "@tanstack/react-table";

export type PostStatus = "published" | "draft" | "archived";

export interface AdminPostRow {
    id: string;
    title: string;
    status: PostStatus;
    created_at?: string;
    published_at?: string;
    category?: string;
    views: number;
    author: string;
    slug: string;
}
const statusConfig: Record<PostStatus, { label: string; variant: "default" | "outline" | "secondary" }> = {
    published: { label: "منتشر شده", variant: "default" },
    draft: { label: "پیش‌نویس", variant: "outline" },
    archived: { label: "آرشیو", variant: "secondary" },
};


function createColumns(handlers: {
    onEdit: (post: AdminPostRow) => void;
    onDelete: (post: AdminPostRow) => void;
}): ColumnDef<AdminPostRow>[] {
    return [
        {
            accessorKey: "title",
            header: "عنوان مقاله",
            cell: ({ row }) => (
                <span className="font-medium line-clamp-1 max-w-[200px] block">
                    {row.getValue("title")}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "وضعیت",
            cell: ({ row }) => {
                const s = row.getValue("status") as PostStatus;
                const cfg = statusConfig[s];
                return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: "created_at",
            header: "تاریخ ایجاد",
            cell: ({ row }) => row.getValue("created_at") || "—",
        },
        {
            accessorKey: "published_at",
            header: "تاریخ انتشار",
            cell: ({ row }) => row.getValue("published_at") || "—",
        },
        {
            accessorKey: "category",
            header: "دسته‌بندی",
            cell: ({ row }) => row.getValue("category") || "—",
        },
        {
            accessorKey: "views",
            header: "بازدید",
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {(row.getValue("views") as number).toLocaleString("fa-IR")}
                </span>
            ),
        },
        {
            accessorKey: "author",
            header: "نویسنده",
        },
        {
            accessorKey: "slug",
            header: "لینک مقاله",
            cell: ({ row }) => {
                const slug = row.getValue("slug") as string;
                return (
                    <a
                        href={`/blog/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="max-w-[120px] truncate block" dir="ltr">/blog/{slug}</span>
                    </a>
                );
            },
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => {
                const post = row.original;
                return (
                    <div className="flex justify-start">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    aria-label="عملیات"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-card flex flex-col items-end" align="end">
                                <DropdownMenuItem
                                    onClick={() => handlers.onEdit(post)}
                                    className="gap-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    ویرایش مقاله
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handlers.onDelete(post)}
                                    className="gap-2 text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    حذف مقاله
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}

interface PostsTableProps {
    data: AdminPostRow[];
    onEdit?: (post: AdminPostRow) => void;
    onDelete?: (post: AdminPostRow) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function PostsTable({
    data,
    onEdit = () => { },
    onDelete = () => { },
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: PostsTableProps) {
    const columns = createColumns({ onEdit, onDelete });

    return (
        <DataTable
            columns={columns}
            data={data}
            hasPagination={hasPagination}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
        />
    );
}
