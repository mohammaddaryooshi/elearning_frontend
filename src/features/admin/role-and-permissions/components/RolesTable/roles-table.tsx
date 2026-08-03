"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreHorizontal, Shield, Trash2 } from "lucide-react";
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

export interface Permission {
    key: string;
    label: string;
    group: string;
}

export interface AdminRoleRow {
    id: string;
    name: string;
    label: string;
    description?: string;
    permissions: string[]; // permission keys
    users_count: number;
    is_system: boolean; // رول‌های سیستمی قابل حذف نیستند
    created_at?: string;
}

function createColumns(handlers: {
    onEdit: (role: AdminRoleRow) => void;
    onDelete: (role: AdminRoleRow) => void;
    allPermissions: Permission[];
}): ColumnDef<AdminRoleRow>[] {
    return [
        {
            accessorKey: "label",
            header: "نام رول",
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                            <Shield className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium">{role.label}</p>
                            <p className="text-xs text-muted-foreground">{role.name}</p>
                        </div>
                        {role.is_system && (
                            <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-600">
                                سیستمی
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "description",
            header: "توضیحات",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("description") ?? "—"}
                </span>
            ),
        },
        {
            accessorKey: "permissions",
            header: "دسترسی‌ها",
            cell: ({ row }) => {
                const perms = row.getValue("permissions") as string[];
                const count = perms.length;
                const total = handlers.allPermissions.length;
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {count} / {total}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "users_count",
            header: "تعداد کاربران",
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue("users_count")} نفر</Badge>
            ),
        },
        {
            accessorKey: "created_at",
            header: "تاریخ ایجاد",
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
                const role = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="عملیات">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card flex flex-col items-end">
                            <DropdownMenuItem onClick={() => handlers.onEdit(role)} className="gap-2">
                                <Edit2 className="h-4 w-4" />
                                ویرایش و دسترسی‌ها
                            </DropdownMenuItem>
                            {!role.is_system && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handlers.onDelete(role)}
                                        className="gap-2 text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        حذف رول
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

interface RolesTableProps {
    data: AdminRoleRow[];
    allPermissions: Permission[];
    onEdit: (role: AdminRoleRow) => void;
    onDelete: (role: AdminRoleRow) => void;
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function RolesTable({
    data,
    allPermissions,
    onEdit,
    onDelete,
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: RolesTableProps) {
    const columns = createColumns({ onEdit, onDelete, allPermissions });

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
