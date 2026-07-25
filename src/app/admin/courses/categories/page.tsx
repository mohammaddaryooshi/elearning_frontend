"use client";

import { useMemo, useState, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    Plus, GripVertical, Pencil, Trash2,
    ChevronRight, ChevronDown, Folder, FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CourseCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    order: number;
    is_active: boolean;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    parent_id?: string | null;
    children?: CourseCategory[];
    courses_count?: number;
}

type DropZoneId =
    | `before-${string}`
    | `after-${string}`
    | `child-${string}`
    | "root-bottom";

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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const initialCategories: CourseCategory[] = [
    {
        id: "1", name: "برنامه‌نویسی", slug: "programming",
        description: "دوره‌های مربوط به برنامه‌نویسی",
        order: 1, is_active: true, parent_id: null, courses_count: 12,
        children: [
            {
                id: "1-1", name: "فرانت‌اند", slug: "frontend",
                description: "دوره‌های فرانت‌اند",
                order: 1, is_active: true, parent_id: "1",
                courses_count: 7, children: [],
            },
            {
                id: "1-2", name: "بک‌اند", slug: "backend",
                description: "دوره‌های بک‌اند",
                order: 2, is_active: true, parent_id: "1",
                courses_count: 5, children: [],
            },
        ],
    },
    {
        id: "2", name: "طراحی UI/UX", slug: "ui-ux-design",
        description: "دوره‌های طراحی رابط کاربری",
        order: 2, is_active: true, parent_id: null,
        courses_count: 8, children: [],
    },
    {
        id: "3", name: "DevOps", slug: "devops",
        description: "دوره‌های DevOps و زیرساخت",
        order: 3, is_active: false, parent_id: null,
        courses_count: 0, children: [],
    },
];

// ─── Tree Helpers ──────────────────────────────────────────────────────────────

function findCategory(categories: CourseCategory[], id: string): CourseCategory | null {
    for (const cat of categories) {
        if (cat.id === id) return cat;
        if (cat.children) {
            const found = findCategory(cat.children, id);
            if (found) return found;
        }
    }
    return null;
}

function removeCategory(categories: CourseCategory[], id: string): CourseCategory[] {
    return categories
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, children: c.children ? removeCategory(c.children, id) : [] }));
}

function isDescendant(parent: CourseCategory, childId: string): boolean {
    if (!parent.children?.length) return false;
    if (parent.children.some((c) => c.id === childId)) return true;
    return parent.children.some((c) => isDescendant(c, childId));
}

function reindexSiblings(cats: CourseCategory[]): CourseCategory[] {
    return cats.map((c, i) => ({ ...c, order: i + 1 }));
}

function insertBefore(
    siblings: CourseCategory[],
    item: CourseCategory,
    beforeId: string
): CourseCategory[] {
    const idx = siblings.findIndex((c) => c.id === beforeId);
    if (idx === -1) return [...siblings, item];
    const result = [...siblings];
    result.splice(idx, 0, item);
    return result;
}

function insertAfter(
    siblings: CourseCategory[],
    item: CourseCategory,
    afterId: string
): CourseCategory[] {
    const idx = siblings.findIndex((c) => c.id === afterId);
    if (idx === -1) return [...siblings, item];
    const result = [...siblings];
    result.splice(idx + 1, 0, item);
    return result;
}

function moveToParent(
    categories: CourseCategory[],
    activeId: string,
    newParentId: string
): CourseCategory[] {
    const activeCat = findCategory(categories, activeId);
    if (!activeCat || isDescendant(activeCat, newParentId)) return categories;
    const removed = removeCategory(categories, activeId);
    const updated: CourseCategory = { ...activeCat, parent_id: newParentId };

    const addToParent = (cats: CourseCategory[]): CourseCategory[] =>
        cats.map((c) => {
            if (c.id === newParentId)
                return { ...c, children: reindexSiblings([...(c.children ?? []), updated]) };
            if (c.children?.length)
                return { ...c, children: addToParent(c.children) };
            return c;
        });
    return addToParent(removed);
}

function moveNextToSibling(
    categories: CourseCategory[],
    activeId: string,
    siblingId: string,
    position: "before" | "after"
): CourseCategory[] {
    const activeCat = findCategory(categories, activeId);
    const siblingCat = findCategory(categories, siblingId);
    if (!activeCat || !siblingCat || isDescendant(activeCat, siblingId)) return categories;

    const siblingParentId = siblingCat.parent_id ?? null;
    const removed = removeCategory(categories, activeId);
    const updated: CourseCategory = { ...activeCat, parent_id: siblingParentId };

    const insertIntoTree = (
        cats: CourseCategory[],
        targetParentId: string | null
    ): CourseCategory[] => {
        if (targetParentId === null) {
            return reindexSiblings(
                position === "before"
                    ? insertBefore(cats, updated, siblingId)
                    : insertAfter(cats, updated, siblingId)
            );
        }
        return cats.map((c) => {
            if (c.id === targetParentId) {
                const children = c.children ?? [];
                return {
                    ...c,
                    children: reindexSiblings(
                        position === "before"
                            ? insertBefore(children, updated, siblingId)
                            : insertAfter(children, updated, siblingId)
                    ),
                };
            }
            if (c.children?.length)
                return { ...c, children: insertIntoTree(c.children, targetParentId) };
            return c;
        });
    };
    return insertIntoTree(removed, siblingParentId);
}

function moveToRoot(categories: CourseCategory[], activeId: string): CourseCategory[] {
    const activeCat = findCategory(categories, activeId);
    if (!activeCat || activeCat.parent_id === null) return categories;
    const removed = removeCategory(categories, activeId);
    const updated: CourseCategory = { ...activeCat, parent_id: null, order: removed.length + 1 };
    return reindexSiblings([...removed, updated]);
}

// ─── Drop Zones ────────────────────────────────────────────────────────────────

function SiblingDropZone({ id, label }: { id: DropZoneId; label?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={cn(
                "rounded-md mx-1 transition-all duration-150",
                isOver
                    ? "h-8 bg-primary/15 border-2 border-primary border-dashed flex items-center justify-center"
                    : "h-2 bg-transparent"
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
                {isOver ? "رها کنید ← دسته اصلی" : "اینجا رها کنید تا دسته اصلی شود"}
            </span>
        </div>
    );
}

// ─── Draggable Category Row ────────────────────────────────────────────────────

function DraggableCategory({
    category, level, expanded, onToggleExpand,
    onEdit, onDelete, isDragActive,
}: {
    category: CourseCategory;
    level: number;
    expanded: Set<string>;
    onToggleExpand: (id: string) => void;
    onEdit: (category: CourseCategory) => void;
    onDelete: (category: CourseCategory) => void;
    isDragActive: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: category.id,
        data: { category },
    });

    const style = { transform: CSS.Transform.toString(transform) };
    const hasChildren = (category.children?.length ?? 0) > 0;
    const isExpanded = expanded.has(category.id);

    return (
        <div className="relative">
            {isDragActive && (
                <SiblingDropZone id={`before-${category.id}`} label="قبل از این" />
            )}
            <div className="relative">
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
                                type="button"
                                onClick={() => onToggleExpand(category.id)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                {isExpanded
                                    ? <ChevronDown className="h-4 w-4" />
                                    : <ChevronRight className="h-4 w-4" />
                                }
                            </button>
                        ) : (
                            <span className="w-6" />
                        )}

                        {isExpanded && hasChildren
                            ? <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                            : <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
                        }

                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{category.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>/{category.slug}</span>
                                {(category.courses_count ?? 0) > 0 && (
                                    <span>• {category.courses_count} دوره</span>
                                )}
                                {!category.is_active && (
                                    <span className="text-destructive">(غیرفعال)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="button" variant="ghost" size="sm"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8 p-0"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button" variant="ghost" size="sm"
                            onClick={() => onDelete(category)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Drag Overlay Ghost ────────────────────────────────────────────────────────

function DragGhost({ category }: { category: CourseCategory }) {
    return (
        <div className="flex items-center gap-2 p-3 bg-card border-2 border-primary rounded-lg shadow-xl opacity-90 w-64">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium truncate">{category.name}</span>
        </div>
    );
}

// ─── Recursive Tree Node ───────────────────────────────────────────────────────

function CategoryTreeNode({
    category, level, expanded, onToggleExpand,
    onEdit, onDelete, isDragActive, isLast,
}: {
    category: CourseCategory;
    level: number;
    expanded: Set<string>;
    onToggleExpand: (id: string) => void;
    onEdit: (category: CourseCategory) => void;
    onDelete: (category: CourseCategory) => void;
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

            {isExpanded && hasChildren && (
                <div className="mr-6 mt-1 space-y-1">
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
                    {isDragActive && (
                        <SiblingDropZone
                            id={`after-${category.children![category.children!.length - 1].id}`}
                            label="انتهای زیردسته‌ها"
                        />
                    )}
                </div>
            )}

            {isDragActive && isLast && (
                <SiblingDropZone id={`after-${category.id}`} label="بعد از این" />
            )}
        </div>
    );
}

// ─── Category Form Modal ───────────────────────────────────────────────────────

function CategoryFormModal({
    open, onClose, onSubmit, editingCategory, allCategories,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    editingCategory: CourseCategory | null;
    allCategories: { id: string; name: string }[];
}) {
    const [name, setName] = useState(editingCategory?.name ?? "");
    const [slug, setSlug] = useState(editingCategory?.slug ?? "");
    const [description, setDescription] = useState(editingCategory?.description ?? "");
    const [parentId, setParentId] = useState(editingCategory?.parent_id ?? "root");
    const [isActive, setIsActive] = useState(editingCategory?.is_active ?? true);
    const [metaTitle, setMetaTitle] = useState(editingCategory?.meta_title ?? "");
    const [metaDescription, setMetaDescription] = useState(editingCategory?.meta_description ?? "");
    const [canonicalUrl, setCanonicalUrl] = useState(editingCategory?.canonical_url ?? "");

    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingCategory) {
            setSlug(
                val.trim().toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9\-]/g, "")
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) return;
        onSubmit({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            parent_id: parentId,
            is_active: isActive,
            meta_title: metaTitle.trim(),
            meta_description: metaDescription.trim(),
            canonical_url: canonicalUrl.trim(),
        });
    };

    const parentOptions = allCategories.filter((c) => c.id !== editingCategory?.id);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
                    </DialogTitle>
                    <DialogDescription>
                        اطلاعات دسته‌بندی دوره را وارد کنید.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-name">نام دسته‌بندی *</Label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="مثال: برنامه‌نویسی"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cat-slug">اسلاگ (Slug) *</Label>
                        <Input
                            id="cat-slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="programming"
                            dir="ltr"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>دسته والد</Label>
                        <Select value={parentId ?? "root"} onValueChange={setParentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="انتخاب دسته والد" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="root">— بدون والد (دسته اصلی) —</SelectItem>
                                {parentOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cat-desc">توضیحات</Label>
                        <Textarea
                            id="cat-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="توضیح کوتاه درباره این دسته‌بندی..."
                            rows={3}
                        />
                    </div>

                    <div className="border rounded-lg p-3 space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">تنظیمات SEO</p>

                        <div className="space-y-1.5">
                            <Label htmlFor="cat-meta-title">عنوان متا</Label>
                            <Input
                                id="cat-meta-title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="عنوان برای موتورهای جستجو"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cat-meta-desc">توضیحات متا</Label>
                            <Textarea
                                id="cat-meta-desc"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="توضیحات برای موتورهای جستجو..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cat-canonical">Canonical URL</Label>
                            <Input
                                id="cat-canonical"
                                value={canonicalUrl}
                                onChange={(e) => setCanonicalUrl(e.target.value)}
                                placeholder="https://..."
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="cat-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(Boolean(v))}
                        />
                        <Label htmlFor="cat-active" className="cursor-pointer">فعال</Label>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            انصراف
                        </Button>
                        <Button type="submit">
                            {editingCategory ? "ذخیره تغییرات" : "افزودن"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
    target, onConfirm, onCancel,
}: {
    target: CourseCategory | null;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const hasChildren = (target?.children?.length ?? 0) > 0;
    return (
        <Dialog open={!!target} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>حذف دسته‌بندی</DialogTitle>
                    <DialogDescription>
                        آیا از حذف «{target?.name}» مطمئن هستید؟
                        {hasChildren && (
                            <span className="block mt-1 text-destructive font-medium">
                                ⚠️ این دسته‌بندی دارای زیردسته است که آن‌ها نیز حذف خواهند شد.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onCancel}>انصراف</Button>
                    <Button variant="ghost" onClick={onConfirm}>حذف</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseCategoriesPage() {
    const [categories, setCategories] = useState<CourseCategory[]>(initialCategories);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(["1"]));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CourseCategory | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const activeDragCat = useMemo(
        () => (activeDragId ? findCategory(categories, activeDragId) : null),
        [activeDragId, categories]
    );

    const allCategoriesFlat = useMemo(() => {
        const flatten = (
            cats: CourseCategory[],
            parentName = ""
        ): { id: string; name: string }[] => {
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

    // ── Drag handlers ────────────────────────────────────────────────────────

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const activeId = String(active.id);
            const overId = String(over.id);

            setCategories((prev) => {
                // Drop on root-bottom → make root-level
                if (overId === "root-bottom") {
                    return moveToRoot(prev, activeId);
                }

                // Drop on child-{id} → nest inside that category
                if (overId.startsWith("child-")) {
                    const newParentId = overId.replace("child-", "");
                    return moveToParent(prev, activeId, newParentId);
                }

                // Drop on before-{id}
                if (overId.startsWith("before-")) {
                    const siblingId = overId.replace("before-", "");
                    return moveNextToSibling(prev, activeId, siblingId, "before");
                }

                // Drop on after-{id}
                if (overId.startsWith("after-")) {
                    const siblingId = overId.replace("after-", "");
                    return moveNextToSibling(prev, activeId, siblingId, "after");
                }

                return prev;
            });
        },
        []
    );

    // ── CRUD handlers ────────────────────────────────────────────────────────

    const handleToggleExpand = useCallback((id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleEdit = useCallback((category: CourseCategory) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((category: CourseCategory) => {
        setDeleteTarget(category);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (!deleteTarget) return;
        setCategories((prev) => removeCategory(prev, deleteTarget.id));
        setDeleteTarget(null);
    }, [deleteTarget]);

    const handleFormSubmit = useCallback(
        (data: CategoryFormData) => {
            setCategories((prev) => {
                if (editingCategory) {
                    // Update existing
                    const update = (cats: CourseCategory[]): CourseCategory[] =>
                        cats.map((c) => {
                            if (c.id === editingCategory.id) {
                                return {
                                    ...c,
                                    name: data.name,
                                    slug: data.slug,
                                    description: data.description,
                                    is_active: data.is_active,
                                    meta_title: data.meta_title,
                                    meta_description: data.meta_description,
                                    canonical_url: data.canonical_url,
                                    parent_id: data.parent_id === "root" ? null : data.parent_id,
                                };
                            }
                            if (c.children?.length) return { ...c, children: update(c.children) };
                            return c;
                        });
                    return update(prev);
                }

                // Create new
                const newCat: CourseCategory = {
                    id: `cat-${Date.now()}`,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    is_active: data.is_active,
                    meta_title: data.meta_title,
                    meta_description: data.meta_description,
                    canonical_url: data.canonical_url,
                    parent_id: data.parent_id === "root" ? null : data.parent_id,
                    order: 0,
                    courses_count: 0,
                    children: [],
                };

                if (!newCat.parent_id) {
                    return reindexSiblings([...prev, newCat]);
                }

                const addToParent = (cats: CourseCategory[]): CourseCategory[] =>
                    cats.map((c) => {
                        if (c.id === newCat.parent_id) {
                            return {
                                ...c,
                                children: reindexSiblings([...(c.children ?? []), newCat]),
                            };
                        }
                        if (c.children?.length) return { ...c, children: addToParent(c.children) };
                        return c;
                    });
                return addToParent(prev);
            });

            setIsModalOpen(false);
            setEditingCategory(null);
        },
        [editingCategory]
    );

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingCategory(null);
    }, []);

    // ── Render ───────────────────────────────────────────────────────────────

    const totalCount = useMemo(() => allCategoriesFlat.length, [allCategoriesFlat]);

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">دسته‌بندی دوره‌ها</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {totalCount} دسته‌بندی • برای تغییر ترتیب بکشید و رها کنید
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن دسته‌بندی
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">ساختار دسته‌بندی‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="space-y-1">
                            {categories.map((cat, idx) => (
                                <CategoryTreeNode
                                    key={cat.id}
                                    category={cat}
                                    level={0}
                                    expanded={expanded}
                                    onToggleExpand={handleToggleExpand}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isDragActive={!!activeDragId}
                                    isLast={idx === categories.length - 1}
                                />
                            ))}
                        </div>

                        {!!activeDragId && <RootBottomDropZone />}

                        <DragOverlay>
                            {activeDragCat && <DragGhost category={activeDragCat} />}
                        </DragOverlay>
                    </DndContext>

                    {categories.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Folder className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>هیچ دسته‌بندی‌ای وجود ندارد</p>
                            <Button
                                variant="outline"
                                className="mt-3"
                                onClick={() => setIsModalOpen(true)}
                            >
                                اولین دسته‌بندی را بسازید
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CategoryFormModal
                open={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleFormSubmit}
                editingCategory={editingCategory}
                allCategories={allCategoriesFlat}
            />

            <DeleteConfirmModal
                target={deleteTarget}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}


