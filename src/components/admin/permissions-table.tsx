"use client";

import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Edit2, Trash2, MoreHorizontal, Search, Shield, Lock, Filter,
} from "lucide-react";
import type { Permission } from "@/types/permission";
import { ACTION_COLORS, ACTION_LABELS, RESOURCE_LABELS, RESOURCE_ICONS } from "@/constants/permissions";
import { cn } from "@/lib/cn";


interface PermissionsTableProps {
    permissions: Permission[];
    onEdit: (permission: Permission) => void;
    onDelete: (permission: Permission) => void;
    isLoading?: boolean;
}

export function PermissionsTable({
    permissions,
    onEdit,
    onDelete,
    isLoading,
}: PermissionsTableProps) {
    const [search, setSearch] = useState("");
    const [resourceFilter, setResourceFilter] = useState<string>("all");

    const resources = Array.from(new Set(permissions.map((p) => p.resource)));

    const filtered = permissions.filter((p) => {
        const matchSearch =
            p.label.toLowerCase().includes(search.toLowerCase()) ||
            p.name.toLowerCase().includes(search.toLowerCase());
        const matchResource =
            resourceFilter === "all" || p.resource === resourceFilter;
        return matchSearch && matchResource;
    });

    // group by resource
    const grouped = filtered.reduce<Record<string, Permission[]>>((acc, p) => {
        if (!acc[p.resource]) acc[p.resource] = [];
        acc[p.resource].push(p);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            {/* ── filters ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="جستجوی دسترسی..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 shrink-0">
                            <Filter className="h-4 w-4" />
                            {resourceFilter === "all"
                                ? "همه منابع"
                                : RESOURCE_LABELS[resourceFilter as keyof typeof RESOURCE_LABELS]}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setResourceFilter("all")}>
                            همه منابع
                        </DropdownMenuItem>
                        {resources.map((r) => (
                            <DropdownMenuItem
                                key={r}
                                onClick={() => setResourceFilter(r)}
                            >
                                {RESOURCE_ICONS[r as keyof typeof RESOURCE_ICONS]}{" "}
                                {RESOURCE_LABELS[r as keyof typeof RESOURCE_LABELS]}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── grouped tables ─────────────────────────────────── */}
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
                    ))}
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>دسترسی‌ای یافت نشد</p>
                </div>
            ) : (
                Object.entries(grouped).map(([resource, perms]) => (
                    <div key={resource} className="border rounded-lg overflow-hidden">
                        {/* group header */}
                        <div className="bg-muted/50 px-4 py-2.5 flex items-center gap-2 border-b">
                            <span className="text-base">
                                {RESOURCE_ICONS[resource as keyof typeof RESOURCE_ICONS]}
                            </span>
                            <span className="font-medium text-sm">
                                {RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}
                            </span>
                            <Badge variant="secondary" className="mr-auto text-xs">
                                {perms.length} دسترسی
                            </Badge>
                        </div><Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <TableHead className="text-right">نام دسترسی</TableHead>
                                    <TableHead className="text-right">کلید</TableHead>
                                    <TableHead className="text-right">عملیات</TableHead>
                                    <TableHead className="text-right">نقش‌ها</TableHead><TableHead className="text-right">وضعیت</TableHead><TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {perms.map((perm) => (
                                    <TableRow key={perm.id} className="hover:bg-muted/30">
                                        {/* label */}
                                        <TableCell className="font-medium"><div className="flex items-center gap-2">
                                            {perm.is_system && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            دسترسی سیستمی
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {perm.label}
                                        </div>
                                            {perm.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {perm.description}
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* name/slug */}
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                                {perm.name}
                                            </code>
                                        </TableCell>

                                        {/* action badge */}
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                    ACTION_COLORS[perm.action]
                                                )}
                                            >
                                                {ACTION_LABELS[perm.action]}
                                            </span>
                                        </TableCell>

                                        {/* roles count */}
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1">
                                                <Shield className="h-3 w-3" />
                                                {perm.roles_count} نقش
                                            </Badge>
                                        </TableCell>

                                        {/* system badge */}
                                        <TableCell>
                                            {perm.is_system ? (
                                                <Badge variant="secondary">سیستمی</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    سفارشی
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* actions */}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(perm)}
                                                        className="gap-2"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        ویرایش
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(perm)}
                                                        disabled={perm.is_system}
                                                        className="gap-2text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                ))
            )}
        </div>
    );
}
