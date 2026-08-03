"use client";

import { useMemo, useState } from "react";
import { Plus, Search, FileX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PostsTable, type AdminPostRow, type PostStatus } from "@/features/admin/articles/components/ArticlesTable";

// ─── Mock data ───────────────────────────────────────────────────────────────
const CATEGORIES = ["برنامه‌نویسی", "طراحی", "دیجیتال مارکتینگ", "هوش مصنوعی", "عمومی"];

const initialPosts: AdminPostRow[] = [
    { id: "1", title: "آموزش NestJS از صفر", status: "published", created_at: "1405/03/01", published_at: "1405/03/05", category: "برنامه‌نویسی", views: 4820, author: "محمد جواد", slug: "nestjs-from-zero" },
    { id: "2", title: "معرفی Tailwind CSS 4", status: "published", created_at: "1405/03/10", published_at: "1405/03/12", category: "طراحی", views: 3100, author: "محمد جواد", slug: "tailwind-css-4" },
    { id: "3", title: "Next.js App Router کامل", status: "draft", created_at: "1405/04/01", published_at: undefined, category: "برنامه‌نویسی", views: 0, author: "محمد جواد", slug: "nextjs-app-router" },
    { id: "4", title: "SEO برای توسعه‌دهندگان", status: "archived", created_at: "1404/12/10", published_at: "1404/12/15", category: "دیجیتال مارکتینگ", views: 980, author: "رضا محمدی", slug: "seo-for-devs" },
    { id: "5", title: "مقدمه‌ای بر هوش مصنوعی", status: "published", created_at: "1405/02/20", published_at: "1405/02/22", category: "هوش مصنوعی", views: 7650, author: "سارا کریمی", slug: "intro-to-ai" },
    { id: "6", title: "TypeORM و مهاجرت‌ها", status: "published", created_at: "1405/04/15", published_at: "1405/04/18", category: "برنامه‌نویسی", views: 2300, author: "محمد جواد", slug: "typeorm-migrations" },
    { id: "7", title: "RBAC در NestJS", status: "draft", created_at: "1405/05/01", published_at: undefined, category: "برنامه‌نویسی", views: 0, author: "محمد جواد", slug: "rbac-nestjs" },
    { id: "8", title: "بهینه‌سازی تصاویر در Next.js", status: "published", created_at: "1405/01/05", published_at: "1405/01/07", category: "طراحی", views: 1540, author: "علی شفیعی", slug: "nextjs-image-optimization" },
];
// ─────────────────────────────────────────────────────────────────────────────

type SortFilter = "all" | "most-viewed" | "least-viewed";
type StatusFilter = "all" | PostStatus;

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<AdminPostRow[]>(initialPosts);
    const [search, setSearch] = useState("");
    const [sortFilter, setSortFilter] = useState<SortFilter>("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [deleteTarget, setDeleteTarget] = useState<AdminPostRow | null>(null);

    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // search
        const q = search.trim();
        if (q) {
            result = result.filter(
                (p) =>
                    p.title.includes(q) ||
                    p.author.includes(q) ||
                    (p.category ?? "").includes(q)
            );
        }

        // status
        if (statusFilter !== "all") {
            result = result.filter((p) => p.status === statusFilter);
        }

        // category
        if (categoryFilter !== "all") {
            result = result.filter((p) => p.category === categoryFilter);
        }

        // sort
        if (sortFilter === "most-viewed") {
            result.sort((a, b) => b.views - a.views);
        } else if (sortFilter === "least-viewed") {
            result.sort((a, b) => a.views - b.views);
        }

        return result;
    }, [posts, search, sortFilter, categoryFilter, statusFilter]);

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const handleEdit = (post: AdminPostRow) => {
        // TODO: navigate to edit page or open edit modal
        console.log("edit", post.id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت مقالات</h2>
                <p className="text-sm text-muted-foreground">
                    مشاهده، جستجو و مدیریت مقالات منتشر شده در سایت.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>لیست مقالات</CardTitle>
                        <Button className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            افزودن مقاله
                        </Button>
                    </div>

                    {/* ─── Filters row ─── */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {/* search */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو بر اساس عنوان، نویسنده یا دسته..."
                                className="pr-9"
                            />
                        </div>

                        {/* sort by views */}
                        <Select
                            value={sortFilter}
                            onValueChange={(v) => setSortFilter(v as SortFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="مرتب‌سازی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">مرتب‌سازی پیش‌فرض</SelectItem>
                                <SelectItem value="most-viewed">پربازدیدترین</SelectItem>
                                <SelectItem value="least-viewed">کم‌بازدیدترین</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* filter by category */}
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="دسته‌بندی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه دسته‌ها</SelectItem>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* filter by status */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="وضعیت انتشار" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                                <SelectItem value="published">منتشر شده</SelectItem>
                                <SelectItem value="draft">پیش‌نویس</SelectItem>
                                <SelectItem value="archived">آرشیو</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <PostsTable
                        data={filteredPosts}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── Delete confirm dialog ─── */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileX className="h-5 w-5 text-destructive" />
                            حذف مقاله
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف مقاله «{deleteTarget?.title}» اطمینان دارید؟ این عملیات
                            قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف مقاله
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
