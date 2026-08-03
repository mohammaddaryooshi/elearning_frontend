"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Globe, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
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

export interface AdminNotificationRow {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    is_global: boolean;
    user_id?: string | null;
    user_name?: string | null;
    created_at?: string;
}

function createColumns(handlers: {
    onEdit: (n: AdminNotificationRow) => void;
    onDelete: (n: AdminNotificationRow) => void;
}): ColumnDef<AdminNotificationRow>[] {
    return [
        {
            accessorKey: "title",
            header: "عنوان",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("title")}</span>
            ),
        },
        {
            accessorKey: "message",
            header: "متن پیام",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-[260px] block">
                    {row.getValue("message")}
                </span>
            ),
        },
        {
            id: "recipient",
            header: "گیرنده",
            cell: ({ row }) => {
                const n = row.original;
                if (n.is_global) {
                    return (
                        <Badge variant="secondary" className="gap-1">
                            <Globe className="h-3 w-3" />
                            همه کاربران
                        </Badge>
                    );
                }
                return (
                    <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        {n.user_name ?? n.user_id ?? "—"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "is_read",
            header: "وضعیت خواندن",
            cell: ({ row }) => {
                const read = row.getValue("is_read") as boolean;
                const isGlobal = row.original.is_global;
                if (isGlobal) return <span className="text-muted-foreground text-sm">—</span>;
                return read ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                        خوانده شده
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                        خوانده نشده
                    </Badge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "تاریخ ارسال",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("created_at") ?? "—"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => {
                const n = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="عملیات">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card flex flex-col items-end">
                            <DropdownMenuItem onClick={() => handlers.onEdit(n)} className="gap-2">
                                <Pencil className="h-4 w-4" />
                                ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handlers.onDelete(n)}
                                className="gap-2 text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                                حذف
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

interface NotificationsTableProps {
    data: AdminNotificationRow[];
    onEdit: (n: AdminNotificationRow) => void;
    onDelete: (n: AdminNotificationRow) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function NotificationsTable({
    data,
    onEdit,
    onDelete,
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: NotificationsTableProps) {
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
