"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";

interface AdminCourseRow {
    id: string;
    title: string;
    teacher: string;
    students: number;
}

const columns: ColumnDef<AdminCourseRow>[] = [
    {
        accessorKey: "title",
        header: "دوره",
    },
    {
        accessorKey: "teacher",
        header: "مدرس",
    },
    {
        accessorKey: "students",
        header: "تعداد دانشجو",
    },
];

interface CoursesTableProps {
    data: AdminCourseRow[];
}

export function CoursesTable({ data }: CoursesTableProps) {
    return <DataTable columns={columns} data={data} />;
}
