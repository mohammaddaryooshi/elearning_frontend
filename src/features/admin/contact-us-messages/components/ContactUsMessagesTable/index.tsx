"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CheckCheck, Eye, MoreHorizontal, Trash2 } from "lucide-react";
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

export interface AdminContactMessageRow {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at?: string;
}

function createColumns(handlers: {
    onView: (msg: AdminContactMessageRow) => void;
    onMarkRead: (msg: AdminContactMessageRow) => void;
    onDelete: (msg: AdminContactMessageRow) => void;
}): ColumnDef<AdminContactMessageRow>[] {
    return [
        {
            accessorKey: "full_name",
            header: "نام فرستنده",
            cell: ({ row }) => {
                const msg = row.original;
                return (
                    <span className={msg.is_read ? "text-muted-foreground" : "font-semibold"}>
                        {msg.full_name}
                    </span>
                );
            },
        },
        {
            accessorKey: "email",
            header: "ایمیل",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.getValue("email")}</span>
            ),
        },
        {
            accessorKey: "phone",
            header: "شماره تماس",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.getValue("phone")}</span>
            ),
        },
        {
            accessorKey: "message",
            header: "پیام",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-[260px] block">
                    {row.getValue("message")}
                </span>
            ),
        },
        {
            accessorKey: "is_read",
            header: "وضعیت",
            cell: ({ row }) => {
                const read = row.getValue("is_read") as boolean;
                return read ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 gap-1">
                        <CheckCheck className="h-3 w-3" />
                        خوانده شده
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/40 gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
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
                const msg = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="عملیات">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card flex flex-col items-end">
                            <DropdownMenuItem onClick={() => handlers.onView(msg)} className="gap-2">
                                <Eye className="h-4 w-4" />
                                مشاهده پیام
                            </DropdownMenuItem>
                            {!msg.is_read && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handlers.onMarkRead(msg)} className="gap-2">
                                        <CheckCheck className="h-4 w-4" />
                                        علامت خوانده شده
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handlers.onDelete(msg)}
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

interface ContactMessagesTableProps {
    data: AdminContactMessageRow[];
    onView: (msg: AdminContactMessageRow) => void;
    onMarkRead: (msg: AdminContactMessageRow) => void;
    onDelete: (msg: AdminContactMessageRow) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function ContactMessagesTable({
    data,
    onView,
    onMarkRead,
    onDelete,
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: ContactMessagesTableProps) {
    const columns = createColumns({ onView, onMarkRead, onDelete });

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
