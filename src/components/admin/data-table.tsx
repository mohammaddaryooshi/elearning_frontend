"use client";
"use no memo";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
    type Updater,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    hasPagination?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    hasPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
}: DataTableProps<TData, TValue>) {
    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        if (onPaginationChange && pagination) {
            const newPagination = typeof updater === "function"
                ? updater(pagination)
                : updater;
            onPaginationChange(newPagination);
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        ...(hasPagination && {
            getPaginationRowModel: getPaginationRowModel(),
            initialState: {
                pagination: {
                    pageSize: 8,
                    pageIndex: 0,
                },
            },
            ...(pageCount !== undefined && {
                manualPagination: true,
                pageCount,
            }),
            ...(pagination && onPaginationChange && {
                state: { pagination },
                onPaginationChange: handlePaginationChange,
            }),
        }),
    });

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    داده ای یافت نشد.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {hasPagination && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="gap-1"
                        >
                            <ChevronRight className="h-4 w-4" />
                            قبلی
                        </Button>
                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNum) => {
                            const isActive = table.getState().pagination.pageIndex + 1 === pageNum;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(pageNum - 1)}
                                    className={cn(
                                        "min-w-[32px] px-2",
                                        isActive && "pointer-events-none"
                                    )}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="gap-1"
                        >
                            بعدی
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
