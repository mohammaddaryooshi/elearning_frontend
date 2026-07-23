"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";

interface AdminUserRow {
    id: string;
    fullName: string;
    phone: string;
    role: "student" | "admin";
}

const columns: ColumnDef<AdminUserRow>[] = [
    {
        accessorKey: "fullName",
        header: "نام",
    },
    {
        accessorKey: "phone",
        header: "شماره",
    },
    {
        accessorKey: "role",
        header: "نقش",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return <Badge variant={role === "admin" ? "default" : "outline"}>{role}</Badge>;
        },
    },
];

interface UsersTableProps {
    data: AdminUserRow[];
}

export function UsersTable({ data }: UsersTableProps) {
    return <DataTable columns={columns} data={data} />;
}
