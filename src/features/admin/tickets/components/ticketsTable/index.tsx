"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    MessageSquare,
    Eye,
} from "lucide-react";
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
import { AdminTicketRow } from "../../types/tickets.type";
import { CATEGORY_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/constants/tickets";



function createColumns(handlers: {
    onView: (t: AdminTicketRow) => void;
    onReply: (t: AdminTicketRow) => void;
    onDelete: (t: AdminTicketRow) => void;
}): ColumnDef<AdminTicketRow>[] {
    return [
        {
            accessorKey: "subject",
            header: "موضوع",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium line-clamp-1 max-w-[220px]">
                        {row.getValue("subject")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[row.original.category]}
                    </span>
                </div>
            ),
        },
        {
            id: "user",
            header: "کاربر",
            cell: ({ row }) => {
                const t = row.original;
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{t.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                            {t.user_email}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "وضعیت",
            cell: ({ row }) => {
                const status = row.getValue("status") as AdminTicketRow["status"];
                return (
                    <Badge className={STATUS_COLORS[status]}>
                        {STATUS_LABELS[status]}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "priority",
            header: "اولویت",
            cell: ({ row }) => {
                const priority = row.getValue(
                    "priority"
                ) as AdminTicketRow["priority"];
                return (
                    <Badge className={PRIORITY_COLORS[priority]}>
                        {PRIORITY_LABELS[priority]}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "messages_count",
            header: "پیام‌ها",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {row.getValue("messages_count")}
                </div>
            ),
        },
        {
            accessorKey: "last_message_at",
            header: "آخرین پیام",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("last_message_at") ?? "—"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => {
                const t = row.original;
                return (
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
                        <DropdownMenuContent
                            align="end"
                            className="bg-card flex flex-col items-end"
                        >
                            <DropdownMenuItem
                                onClick={() => handlers.onView(t)}
                                className="gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                مشاهده
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handlers.onReply(t)}
                                className="gap-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                پاسخ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handlers.onDelete(t)}
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

interface TicketsTableProps {
    data: AdminTicketRow[];
    onView: (t: AdminTicketRow) => void;
    onReply: (t: AdminTicketRow) => void;
    onDelete: (t: AdminTicketRow) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function TicketsTable({
    data,
    onView,
    onReply,
    onDelete,
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: TicketsTableProps) {
    const columns = createColumns({ onView, onReply, onDelete });

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
