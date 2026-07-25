"use client";

import { useMemo, useState, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
    closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { ClientOnly } from "@/components/admin/client-only";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    order: number;
    is_active: boolean;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    parent_id?: string | null;
    children?: Category[];
    posts_count?: number;
}

// ─── Drop zone types ───────────────────────────────────────────────────────────
// "before-{id}"  → insert before this sibling
// "after-{id}"   → insert after this sibling
// "child-{id}"   → make child of this category
// "root-bottom"  → move to end of root list
type DropZoneId =
    | `before-${string}`
    | `after-${string}`
    | `child-${string}`
    | "root-bottom";

const initialCategories: Category[] = [
    {
        id: "1",
        name: "برنامه‌نویسی",
        slug: "programming",
        description: "مقالات مربوط به برنامه‌نویسی",
        order: 1,
        is_active: true,
        parent_id: null,
        posts_count: 15,
        children: [
            {
                id: "1-1",
                name: "React",
                slug: "react",
                description: "مقالات React",
                order: 1,
                is_active: true,
                parent_id: "1",
                posts_count: 8,
                children: [],
            },
            {
                id: "1-2",
                name: "Next.js",
                slug: "nextjs",
                description: "مقالات Next.js",
                order: 2,
                is_active: true,
                parent_id: "1",
                posts_count: 5,
                children: [],
            },
        ],
    },
    {
        id: "2",
        name: "طراحی",
        slug: "design",
        description: "مقالات طراحی",
        order: 2,
        is_active: true,
        parent_id: null,
        posts_count: 10,
        children: [],
    },
    {
        id: "3",
        name: "DevOps",
        slug: "devops",
        description: "مقالات DevOps",
        order: 3,
        is_active: false,
        parent_id: null,
        posts_count: 0,
        children: [],
    },
];

// ─── Tree helpers ──────────────────────────────────────────────────────────────

function flattenCategories(categories: Category[]): Category[] {
    const result: Category[] = [];
    for (const cat of categories) {
        result.push(cat);
        if (cat.children?.length) result.push(...flattenCategories(cat.children));
    }
    return result;
}

function findCategory(categories: Category[], id: string): Category | null {
    for (const cat of categories) {
        if (cat.id === id) return cat;
        if (cat.children) {
            const found = findCategory(cat.children, id);
            if (found) return found;
        }
    }
    return null;
}

function removeCategory(categories: Category[], id: string): Category[] {
    return categories
        .filter((c) => c.id !== id)
        .map((c) => ({
            ...c,
            children: c.children ? removeCategory(c.children, id) : [],
        }));
}

function isDescendant(parent: Category, childId: string): boolean {
    if (!parent.children?.length) return false;
    if (parent.children.some((c) => c.id === childId)) return true;
    return parent.children.some((c) => isDescendant(c, childId));
}

/** Insert `item` into `siblings` at position after `afterId` (or at end if null) */
function insertAfter(siblings: Category[], item: Category, afterId: string | null): Category[] {
    if (afterId === null) return [...siblings, item];
    const idx = siblings.findIndex((c) => c.id === afterId);
    if (idx === -1) return [...siblings, item];
    const result = [...siblings];
    result.splice(idx + 1, 0, item);
    return result;
}

/** Insert `item` into `siblings` at position before `beforeId` */
function insertBefore(siblings: Category[], item: Category, beforeId: string): Category[] {
    const idx = siblings.findIndex((c) => c.id === beforeId);
    if (idx === -1) return [...siblings, item];
    const result = [...siblings];
    result.splice(idx, 0, item);
    return result;
}

function reindexSiblings(cats: Category[]): Category[] {
    return cats.map((c, i) => ({ ...c, order: i + 1 }));
}

/**
 * Move `activeId` so it becomes a child of `newParentId`.
 * Returns unchanged tree if circular.
 */
function moveToParent(
    categories: Category[],
    activeId: string,
    newParentId: string
): Category[] {
    const activeCat = findCategory(categories, activeId);
    const target = findCategory(categories, newParentId);
    if (!activeCat || !target) return categories;
    if (isDescendant(activeCat, newParentId)) return categories;

    const removed = removeCategory(categories, activeId);
    const updated: Category = {
        ...activeCat,
        parent_id: newParentId,
    };

    const addToParent = (cats: Category[]): Category[] =>
        cats.map((c) => {
            if (c.id === newParentId) {
                const newChildren = reindexSiblings([...(c.children ?? []), updated]);
                return { ...c, children: newChildren };
            }
            if (c.children?.length) return { ...c, children: addToParent(c.children) };
            return c;
        });

    return addToParent(removed);
}

/**
 * Move `activeId` before or after `siblingId` (same parent level).
 * `position`: "before" | "after"
 */
function moveNextToSibling(
    categories: Category[],
    activeId: string,
    siblingId: string,
    position: "before" | "after",
    activeCatParentId: string | null
): Category[] {
    const activeCat = findCategory(categories, activeId);
    const siblingCat = findCategory(categories, siblingId);
    if (!activeCat || !siblingCat) return categories;

    // prevent circular
    if (isDescendant(activeCat, siblingId)) return categories;

    const siblingParentId = siblingCat.parent_id ?? null;

    const removed = removeCategory(categories, activeId);
    const updated: Category = {
        ...activeCat,
        parent_id: siblingParentId,
    };

    // insert into the sibling's parent list
    const insertIntoTree = (cats: Category[], targetParentId: string | null): Category[] => {
        if (targetParentId === null) {
            // root level
            if (position === "before") return reindexSiblings(insertBefore(cats, updated, siblingId));
            return reindexSiblings(insertAfter(cats, updated, siblingId));
        }
        return cats.map((c) => {
            if (c.id === targetParentId) {
                const children = c.children ?? [];
                const newChildren =
                    position === "before"
                        ? reindexSiblings(insertBefore(children, updated, siblingId))
                        : reindexSiblings(insertAfter(children, updated, siblingId));
                return { ...c, children: newChildren };
            }
            if (c.children?.length) return { ...c, children: insertIntoTree(c.children, targetParentId) };
            return c;
        });
    };

    return insertIntoTree(removed, siblingParentId);
}

/**
 * Move `activeId` to end of root list.
 */
function moveToRoot(categories: Category[], activeId: string): Category[] {
    const activeCat = findCategory(categories, activeId);
    if (!activeCat || activeCat.parent_id === null) return categories;

    const removed = removeCategory(categories, activeId);
    const updated: Category = {
        ...activeCat,
        parent_id: null,
        order: removed.length + 1,
    };
    return reindexSiblings([...removed, updated]);
}

// ─── Drop Zone Components ──────────────────────────────────────────────────────

interface SiblingDropZoneProps {
    id: DropZoneId;
    label?: string;
}

function SiblingDropZone({ id, label }: SiblingDropZoneProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "h-2 rounded-full mx-1 transition-all duration-150",
                isOver ? "h-8 bg-primary/15 border-2 border-primary border-dashed flex items-center justify-center" : "bg-transparent"
            )}
        >
            {isOver && label && (
                <span className="text-xs text-primary font-medium pointer-events-none select-none">
                    {label}
                </span>
            )}
        </div>
    );
}

function ChildDropZone({ categoryId }: { categoryId: string }) {
    const { setNodeRef, isOver } = useDroppable({ id: `child-${categoryId}` as DropZoneId });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "absolute inset-0 rounded-lg pointer-events-none transition-all",
                isOver && "ring-2 ring-primary ring-inset bg-primary/5"
            )}
        >
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-primary font-medium bg-background/90 px-2 py-0.5 rounded shadow-sm">
                        زیردسته
                    </span>
                </div>
            )}
        </div>
    );
}

function RootBottomDropZone() {
    const { setNodeRef, isOver } = useDroppable({ id: "root-bottom" });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "mt-2 rounded-lg border-2 border-dashed transition-all duration-150 flex items-center justify-center",
                isOver
                    ? "h-14 border-primary bg-primary/10 text-primary"
                    : "h-8 border-muted-foreground/20 text-muted-foreground/40"
            )}
        >
            <span className={cn("text-xs font-medium transition-opacity", isOver ? "opacity-100" : "opacity-60")}>
                {isOver ? "رها کنید → دسته اصلی" : "اینجا رها کنید تا دسته اصلی شود"}
            </span>
        </div>
    );
}

// ─── Draggable Category Row ────────────────────────────────────────────────────

interface DraggableCategoryProps {
    category: Category;
    level: number;
    expanded: Set<string>;
    onToggleExpand: (id: string) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    isDragActive: boolean;
}

function DraggableCategory({
    category,
    level,
    expanded,
    onToggleExpand,
    onEdit,
    onDelete,
    isDragActive,
}: DraggableCategoryProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: category.id,
        data: { category },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
    };

    const hasChildren = (category.children?.length ?? 0) > 0;
    const isExpanded = expanded.has(category.id);

    return (
        <div className="relative">
            {/* Sibling drop zone BEFORE this item */}
            {isDragActive && (
                <SiblingDropZone id={`before-${category.id}`} label="قبل از این" />
            )}

            <div className="relative">
                {/* Child drop zone overlay */}
                {isDragActive && <ChildDropZone categoryId={category.id} />}

                <div
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                        "flex items-center gap-2 p-3 bg-card border rounded-lg transition-all relative z-10",
                        isDragging && "opacity-40 shadow-lg",
                        !category.is_active && "opacity-60"
                    )}
                >
                    <div
                        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="flex items-center gap-2 flex-1" style={{ paddingRight: level * 20 }}>
                        {hasChildren ? (
                            <button
                                onClick={() => onToggleExpand(category.id)}
                                className="p-1 hover:bg-muted rounded"
                                type="button"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <span className="w-6" />
                        )}

                        {isExpanded && hasChildren ? (
                            <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                            <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{category.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>/{category.slug}</span>
                                {(category.posts_count ?? 0) > 0 && (
                                    <span>• {category.posts_count} مقاله</span>
                                )}
                                {!category.is_active && (
                                    <span className="text-destructive">(غیرفعال)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8 p-0"
                            type="button"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(category)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Drag Overlay (ghost) ──────────────────────────────────────────────────────

function DragGhost({ category }: { category: Category }) {
    return (
        <div className="flex items-center gap-2 p-3 bg-card border-2 border-primary rounded-lg shadow-xl opacity-90 w-64">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium truncate">{category.name}</span>
        </div>
    );
}

// ─── Recursive tree renderer ───────────────────────────────────────────────────

function CategoryTreeNode({
    category,
    level,
    expanded,
    onToggleExpand,
    onEdit,
    onDelete,
    isDragActive,
    isLast,
}: {
    category: Category;
    level: number;
    expanded: Set<string>;
    onToggleExpand: (id: string) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    isDragActive: boolean;
    isLast: boolean;
}) {
    const hasChildren = (category.children?.length ?? 0) > 0;
    const isExpanded = expanded.has(category.id);

    return (
        <div>
            <DraggableCategory
                category={category}
                level={level}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                isDragActive={isDragActive}
            />

            {/* Children */}
            {isExpanded && hasChildren && (
                <div className="mr-6 mt-1">
                    {category.children!.map((child, idx) => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            level={level + 1}
                            expanded={expanded}
                            onToggleExpand={onToggleExpand}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDragActive={isDragActive}
                            isLast={idx === category.children!.length - 1}
                        />
                    ))}
                    {/* After-last-child zone inside this parent */}
                    {isDragActive && (
                        <SiblingDropZone
                            id={`after-${category.children![category.children!.length - 1].id}`}
                            label="انتهای لیست"
                        />
                    )}
                </div>
            )}

            {/* After-sibling zone (only if last in its group — avoids duplicate zones) */}
            {isDragActive && isLast && (
                <SiblingDropZone id={`after-${category.id}`} label="بعد از این" />
            )}
        </div>
    );
}

// ─── Category Form ─────────────────────────────────────────────────────────────

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    parent_id: string;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    canonical_url: string;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ArticleCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(["1"]));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

    const activeDragCat = useMemo(
        () => (activeDragId ? findCategory(categories, activeDragId) : null),
        [activeDragId, categories]
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            const { active, over } = event;
            if (!over) return;

            const activeId = String(active.id);
            const overId = String(over.id) as DropZoneId;

            if (!activeId || activeId === overId) return;

            const activeCat = findCategory(categories, activeId);
            if (!activeCat) return;

            let updated = categories;

            if (overId === "root-bottom") {
                updated = moveToRoot(categories, activeId);
            } else if (overId.startsWith("child-")) {
                const targetId = overId.slice(6); // "child-".length === 6
                if (targetId !== activeId) {
                    updated = moveToParent(categories, activeId, targetId);
                }
            } else if (overId.startsWith("before-")) {
                const siblingId = overId.slice(7);
                if (siblingId !== activeId) {
                    updated = moveNextToSibling(categories, activeId, siblingId, "before", activeCat.parent_id ?? null);
                }
            } else if (overId.startsWith("after-")) {
                const siblingId = overId.slice(6);
                if (siblingId !== activeId) {
                    updated = moveNextToSibling(categories, activeId, siblingId, "after", activeCat.parent_id ?? null);
                }
            }

            if (updated !== categories) {
                setCategories(updated);
            }
        },
        [categories]
    );

    const handleToggleExpand = useCallback((id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleOpenModal = useCallback((category?: Category) => {
        setEditingCategory(category ?? null);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingCategory(null);
    }, []);

    const handleSubmit = useCallback(
        (formData: FormData) => {
            const data: CategoryFormData = {
                name: String(formData.get("name") ?? "").trim(),
                slug: String(formData.get("slug") ?? "").trim(),
                description: String(formData.get("description") ?? "").trim(),
                parent_id: String(formData.get("parent_id") ?? ""),
                is_active: formData.get("is_active") === "on",
                meta_title: String(formData.get("meta_title") ?? "").trim(),
                meta_description: String(formData.get("meta_description") ?? "").trim(),
                canonical_url: String(formData.get("canonical_url") ?? "").trim(),
            };

            if (!data.name || !data.slug) return;

            const newParentId = data.parent_id === "root" ? null : data.parent_id || null;

            if (editingCategory) {
                const updateInTree = (cats: Category[]): Category[] =>
                    cats.map((c) => {
                        if (c.id === editingCategory.id) {
                            return {
                                ...c,
                                name: data.name,
                                slug: data.slug,
                                description: data.description || undefined,
                                is_active: data.is_active,
                                meta_title: data.meta_title || undefined,
                                meta_description: data.meta_description || undefined,
                                canonical_url: data.canonical_url || undefined,
                                parent_id: newParentId,
                            };
                        }
                        if (c.children) return { ...c, children: updateInTree(c.children) };
                        return c;
                    });

                setCategories((prev) => updateInTree(prev));
            } else {
                const newCategory: Category = {
                    id: crypto.randomUUID(),
                    name: data.name,
                    slug: data.slug,
                    description: data.description || undefined,
                    order: 9999,
                    is_active: data.is_active,
                    meta_title: data.meta_title || undefined,
                    meta_description: data.meta_description || undefined,
                    canonical_url: data.canonical_url || undefined,
                    parent_id: newParentId,
                    children: [],
                    posts_count: 0,
                };

                setCategories((prev) => {
                    const withNew = newParentId === null
                        ? reindexSiblings([...prev, newCategory])
                        : prev.map((c) => {
                            if (c.id === newParentId) {
                                return { ...c, children: reindexSiblings([...(c.children ?? []), newCategory]) };
                            }
                            return c;
                        });
                    return withNew;
                });
            }

            handleCloseModal();
        },
        [editingCategory, handleCloseModal]
    );

    const handleDelete = useCallback(() => {
        if (!deleteTarget) return;
        setCategories((prev) => removeCategory(prev, deleteTarget.id));
        setDeleteTarget(null);
    }, [deleteTarget]);

    const allCategoriesFlat = useMemo(() => {
        const flatten = (cats: Category[], parentName = ""): { id: string; name: string }[] => {
            const result: { id: string; name: string }[] = [];
            for (const cat of cats) {
                const displayName = parentName ? `${parentName} > ${cat.name}` : cat.name;
                result.push({ id: cat.id, name: displayName });
                if (cat.children) result.push(...flatten(cat.children, displayName));
            }
            return result;
        };
        return flatten(categories);
    }, [categories]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">دسته‌بندی مقالات</h2>
                <p className="text-sm text-muted-foreground">
                    مدیریت دسته‌بندی‌ها با قابلیت درگ و دراپ
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        افزودن دسته‌بندی
                    </Button>
                </CardHeader>
                <CardContent>
                    <ClientOnly>
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            {categories.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    هیچ دسته‌بندی یافت نشد.
                                </div>
                            ) : (
                                <>
                                    {/* First "before" zone at very top */}
                                    {activeDragId && (
                                        <SiblingDropZone
                                            id={`before-${categories[0].id}`}
                                            label="ابتدای لیست"
                                        />
                                    )}

                                    <div className="space-y-1">
                                        {categories.map((category, idx) => (
                                            <CategoryTreeNode
                                                key={category.id}
                                                category={category}
                                                level={0}
                                                expanded={expanded}
                                                onToggleExpand={handleToggleExpand}
                                                onEdit={handleOpenModal}
                                                onDelete={setDeleteTarget}
                                                isDragActive={!!activeDragId}
                                                isLast={idx === categories.length - 1}
                                            />
                                        ))}
                                    </div>

                                    <RootBottomDropZone />
                                </>
                            )}

                            <DragOverlay>
                                {activeDragCat ? <DragGhost category={activeDragCat} /> : null}
                            </DragOverlay>
                        </DndContext>
                    </ClientOnly>
                </CardContent>
            </Card>

            {/* ─── Add/Edit Modal ─────────────────────────────────────────────── */}
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className="sm:max-w-lg" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle>
                            {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "اطلاعات دسته‌بندی را ویرایش کنید."
                                : "اطلاعات دسته‌بندی جدید را وارد کنید."}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        id="category-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(new FormData(e.currentTarget));
                        }}
                        className="space-y-4"
                    >
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">نام دسته‌بندی *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="مثال: برنامه‌نویسی"
                                defaultValue={editingCategory?.name ?? ""}
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                            <Label htmlFor="slug">اسلاگ *</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="مثال: programming"
                                defaultValue={editingCategory?.slug ?? ""}
                                dir="ltr"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description">توضیحات</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="توضیح کوتاه درباره این دسته‌بندی..."
                                defaultValue={editingCategory?.description ?? ""}
                                rows={3}
                            />
                        </div>

                        {/* Parent */}
                        <div className="space-y-1.5">
                            <Label htmlFor="parent_id">دسته والد</Label>
                            <Select
                                name="parent_id"
                                defaultValue={editingCategory?.parent_id ?? "root"}
                            >
                                <SelectTrigger id="parent_id">
                                    <SelectValue placeholder="انتخاب والد..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">— بدون والد (دسته اصلی) —</SelectItem>
                                    {allCategoriesFlat
                                        .filter((c) => c.id !== editingCategory?.id)
                                        .map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active */}
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                name="is_active"
                                defaultChecked={editingCategory?.is_active ?? true}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                فعال
                            </Label>
                        </div>

                        {/* SEO Section */}
                        <div className="border-t pt-4 space-y-4">
                            <p className="text-sm font-medium text-muted-foreground">تنظیمات SEO</p>

                            <div className="space-y-1.5">
                                <Label htmlFor="meta_title">عنوان متا</Label>
                                <Input
                                    id="meta_title"
                                    name="meta_title"
                                    placeholder="عنوان برای موتورهای جستجو"
                                    defaultValue={editingCategory?.meta_title ?? ""}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="meta_description">توضیح متا</Label>
                                <Textarea
                                    id="meta_description"
                                    name="meta_description"
                                    placeholder="توضیح کوتاه برای موتورهای جستجو..."
                                    defaultValue={editingCategory?.meta_description ?? ""}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="canonical_url">Canonical URL</Label>
                                <Input
                                    id="canonical_url"
                                    name="canonical_url"
                                    placeholder="https://example.com/category/..."
                                    defaultValue={editingCategory?.canonical_url ?? ""}
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </form>

                    <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse">
                        <Button type="submit" form="category-form">
                            {editingCategory ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirm Dialog ──────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle>حذف دسته‌بندی</DialogTitle>
                        <DialogDescription>
                            آیا از حذف{" "}
                            <span className="font-semibold text-foreground">
                                {deleteTarget?.name}
                            </span>{" "}
                            مطمئن هستید؟
                            {(deleteTarget?.children?.length ?? 0) > 0 && (
                                <span className="block mt-1 text-destructive">
                                    این دسته دارای {deleteTarget!.children!.length} زیردسته است که همه حذف خواهند شد.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse">
                        <Button variant="ghost" onClick={handleDelete}>
                            حذف
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
