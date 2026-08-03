"use client";

import { useCallback, useMemo, useState } from "react";
import {
    Save,
    Send,
    Image as ImageIcon,
    X,
    Plus,
    Search,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { cn } from "@/lib/utils/cn";

// ─── Types (mirroring backend entities) ───────────────────────────────────
type PostStatus = "draft" | "published" | "archived";
type RobotsDirective =
    | "index,follow"
    | "noindex,follow"
    | "index,nofollow"
    | "noindex,nofollow";

interface CategoryOption {
    id: string;
    name: string;
    parentId?: string | null;
}

interface ArticleFormState {
    // PostEntity
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string;
    reading_time: string;
    status: PostStatus;
    published_at: string;
    category_ids: string[];

    // PostMetaEntity (SEO)
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    robots: RobotsDirective;
    og_title: string;
    og_description: string;
    og_image: string;
    focus_keyword: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
    { id: "1", name: "برنامه‌نویسی", parentId: null },
    { id: "1-1", name: "برنامه‌نویسی > React", parentId: "1" },
    { id: "1-2", name: "برنامه‌نویسی > Next.js", parentId: "1" },
    { id: "2", name: "طراحی", parentId: null },
    { id: "3", name: "DevOps", parentId: null },
    { id: "4", name: "دیجیتال مارکتینگ", parentId: null },
    { id: "5", name: "هوش مصنوعی", parentId: null },
];

const ROBOTS_OPTIONS: { value: RobotsDirective; label: string }[] = [
    { value: "index,follow", label: "Index, Follow (پیش‌فرض)" },
    { value: "noindex,follow", label: "NoIndex, Follow" },
    { value: "index,nofollow", label: "Index, NoFollow" },
    { value: "noindex,nofollow", label: "NoIndex, NoFollow" },
];

function slugify(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

// Estimate reading time from plain text length (approx 200 words/min for fa content is ~ 40 chars/sec; we use word count heuristic)
function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
}

const initialState: ArticleFormState = {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    reading_time: "",
    status: "draft",
    published_at: "",
    category_ids: [],
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    robots: "index,follow",
    og_title: "",
    og_description: "",
    og_image: "",
    focus_keyword: "",
};

export default function CreateArticlePage() {
    const [form, setForm] = useState<ArticleFormState>(initialState);
    const [slugTouched, setSlugTouched] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");

    const updateField = useCallback(
        <K extends keyof ArticleFormState>(key: K, value: ArticleFormState[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const handleTitleChange = (value: string) => {
        updateField("title", value);
        if (!slugTouched) {
            updateField("slug", slugify(value));
        }
    };

    const handleSlugChange = (value: string) => {
        setSlugTouched(true);
        updateField("slug", slugify(value));
    };

    const handleContentChange = (html: string) => {
        updateField("content", html);
        const autoReadingTime = estimateReadingTime(html);
        setForm((prev) => ({
            ...prev,
            content: html,
            reading_time: prev.reading_time ? prev.reading_time : String(autoReadingTime),
        }));
    };

    const toggleCategory = (id: string) => {
        setForm((prev) => {
            const exists = prev.category_ids.includes(id);
            return {
                ...prev,
                category_ids: exists
                    ? prev.category_ids.filter((c) => c !== id)
                    : [...prev.category_ids, id],
            };
        });
    };

    const filteredCategories = useMemo(() => {
        const q = categorySearch.trim();
        if (!q) return CATEGORY_OPTIONS;
        return CATEGORY_OPTIONS.filter((c) => c.name.includes(q));
    }, [categorySearch]);

    const selectedCategories = useMemo(
        () => CATEGORY_OPTIONS.filter((c) => form.category_ids.includes(c.id)),
        [form.category_ids]
    );

    const metaTitleLength = form.meta_title.length;
    const metaDescriptionLength = form.meta_description.length;

    const buildPayload = useCallback(() => {
        return {
            title: form.title,
            slug: form.slug,
            content: form.content,
            excerpt: form.excerpt || undefined,
            cover_image: form.cover_image || undefined,
            reading_time: form.reading_time ? Number(form.reading_time) : undefined,
            status: form.status,
            published_at:
                form.status === "published" && form.published_at
                    ? form.published_at
                    : null,
            category_ids: form.category_ids,
            seo: {
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                canonical_url: form.canonical_url || null,
                robots: form.robots,
                og_title: form.og_title || null,
                og_description: form.og_description || null,
                og_image: form.og_image || null,
                focus_keyword: form.focus_keyword || null,
            },
        };
    }, [form]);

    const handleSaveDraft = () => {
        const payload = { ...buildPayload(), status: "draft" as PostStatus };
        console.log("API Request: Create post (draft)", payload);
    };

    const handlePublish = () => {
        const payload = {
            ...buildPayload(),
            status: "published" as PostStatus,
            published_at: form.published_at || new Date().toISOString(),
        };
        console.log("API Request: Create post (publish)", payload);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveDraft();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">افزودن مقاله جدید</h2>
                    <p className="text-sm text-muted-foreground">
                        محتوای مقاله، دسته‌بندی و تنظیمات سئو را وارد کنید.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-2">
                        <Save className="h-4 w-4" />
                        ذخیره پیش‌نویس
                    </Button>
                    <Button type="button" onClick={handlePublish} className="gap-2">
                        <Send className="h-4 w-4" />
                        انتشار مقاله
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ─── Main column ─── */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">عنوان مقاله</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="عنوان مقاله را وارد کنید"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={form.slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="article-slug"
                                    dir="ltr"
                                    required
                                />
                                <p className="text-xs text-muted-foreground" dir="ltr">
                                    /blog/{form.slug || "article-slug"}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="excerpt">چکیده مقاله</Label>
                                <Textarea
                                    id="excerpt"
                                    value={form.excerpt}
                                    onChange={(e) => updateField("excerpt", e.target.value)}
                                    placeholder="چکیده کوتاهی از مقاله (حداکثر 500 کاراکتر)"
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {form.excerpt.length}/500
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">محتوای مقاله</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                value={form.content}
                                onChange={handleContentChange}
                                placeholder="متن مقاله را اینجا بنویسید..."
                            />
                        </CardContent>
                    </Card>

                    {/* ─── SEO Section ─── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">تنظیمات سئو (SEO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="general">عمومی</TabsTrigger>
                                    <TabsTrigger value="social">شبکه‌های اجتماعی</TabsTrigger>
                                    <TabsTrigger value="advanced">پیشرفته</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="meta_title">Meta Title</Label>
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    metaTitleLength > 70
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {metaTitleLength}/70
                                            </span>
                                        </div>
                                        <Input
                                            id="meta_title"
                                            value={form.meta_title}
                                            onChange={(e) => updateField("meta_title", e.target.value)}
                                            placeholder="عنوان سئو (در صورت خالی بودن، از عنوان مقاله استفاده می‌شود)"
                                            maxLength={70}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="meta_description">Meta Description</Label>
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    metaDescriptionLength > 160
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {metaDescriptionLength}/160
                                            </span>
                                        </div>
                                        <Textarea
                                            id="meta_description"
                                            value={form.meta_description}
                                            onChange={(e) =>
                                                updateField("meta_description", e.target.value)
                                            }
                                            placeholder="توضیحات سئو برای نمایش در نتایج گوگل"
                                            rows={3}
                                            maxLength={160}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="focus_keyword">کلمه کلیدی هدف</Label>
                                        <Input
                                            id="focus_keyword"
                                            value={form.focus_keyword}
                                            onChange={(e) =>
                                                updateField("focus_keyword", e.target.value)
                                            }
                                            placeholder="مثال: آموزش نکست جی اس"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="og_title">Open Graph Title</Label>
                                        <Input
                                            id="og_title"
                                            value={form.og_title}
                                            onChange={(e) => updateField("og_title", e.target.value)}
                                            placeholder="عنوان نمایش در شبکه‌های اجتماعی"
                                            maxLength={70}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="og_description">Open Graph Description</Label>
                                        <Textarea
                                            id="og_description"
                                            value={form.og_description}
                                            onChange={(e) =>
                                                updateField("og_description", e.target.value)
                                            }
                                            placeholder="توضیحات نمایش در شبکه‌های اجتماعی"
                                            rows={3}
                                            maxLength={160}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="og_image">Open Graph Image</Label>
                                        <Input
                                            id="og_image"
                                            value={form.og_image}
                                            onChange={(e) => updateField("og_image", e.target.value)}
                                            placeholder="https://example.com/og-image.jpg"
                                            dir="ltr"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="canonical_url">Canonical URL</Label>
                                        <Input
                                            id="canonical_url"
                                            value={form.canonical_url}
                                            onChange={(e) =>
                                                updateField("canonical_url", e.target.value)
                                            }
                                            placeholder="https://example.com/blog/article-slug"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="robots">Robots Meta Tag</Label>
                                        <Select
                                            value={form.robots}
                                            onValueChange={(v) =>
                                                updateField("robots", v as RobotsDirective)
                                            }
                                        >
                                            <SelectTrigger id="robots">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROBOTS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Sidebar column ─── */}
                <div className="space-y-6">
                    {/* Publish settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">انتشار</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="status">وضعیت</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => updateField("status", v as PostStatus)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">پیش‌نویس</SelectItem>
                                        <SelectItem value="published">منتشر شده</SelectItem>
                                        <SelectItem value="archived">آرشیو</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="published_at">تاریخ انتشار</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={form.published_at}
                                    onChange={(e) => updateField("published_at", e.target.value)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <Label htmlFor="reading_time" className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    زمان مطالعه (دقیقه)
                                </Label>
                                <Input
                                    id="reading_time"
                                    type="number"
                                    min={1}
                                    value={form.reading_time}
                                    onChange={(e) => updateField("reading_time", e.target.value)}
                                    placeholder="محاسبه خودکار بر اساس محتوا"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cover image */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                تصویر شاخص
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {form.cover_image ? (
                                <div className="relative overflow-hidden rounded-md border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={form.cover_image}
                                        alt="تصویر شاخص"
                                        className="h-40 w-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-2 left-2 h-7 w-7 p-0"
                                        onClick={() => updateField("cover_image", "")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                                    بدون تصویر
                                </div>
                            )}
                            <Input
                                value={form.cover_image}
                                onChange={(e) => updateField("cover_image", e.target.value)}
                                placeholder="https://example.com/cover.jpg"
                                dir="ltr"
                            />
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedCategories.map((cat) => (
                                        <Badge
                                            key={cat.id}
                                            variant="secondary"
                                            className="gap-1 pl-1"
                                        >
                                            {cat.name}
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    placeholder="جستجوی دسته‌بندی..."
                                    className="pr-9"
                                />
                            </div>

                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-1.5">
                                {filteredCategories.length === 0 ? (
                                    <p className="p-2 text-center text-sm text-muted-foreground">
                                        دسته‌بندی یافت نشد.
                                    </p>
                                ) : (
                                    filteredCategories.map((cat) => {
                                        const checked = form.category_ids.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                className={cn(
                                                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                                                    checked && "bg-primary/10 text-primary"
                                                )}
                                            >
                                                <span>{cat.name}</span>
                                                {checked && <Plus className="h-3.5 w-3.5 rotate-45" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
