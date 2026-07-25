"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import {
    BookOpen,
    Clock,
    Plus,
    Save,
    Send,
    Trash2,
    Video,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { cn } from "@/lib/cn";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { showBackendError } from "@/lib/api/error-handler";

interface CourseOption {
    id: string;
    name: string;
}

interface LessonFormState {
    id: string;
    title: string;
    content: string;
    order: string;
    duration_minutes: string;
    is_free: boolean;
    video_url: string;
}

interface ChapterFormState {
    id: string;
    chapter_label: string;
    title: string;
    description: string;
    sort_order: string;
    lessons: LessonFormState[];
}

interface CourseSeoState {
    seoTitle: string;
    seoDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
    noIndex: boolean;
    noFollow: boolean;
}

interface CourseFormState {
    title: string;
    slug: string;
    description: string;
    thumbnail_image: string;
    cover_image: string;
    duration_hourse: string;
    total_students_count: string;
    price: string;
    discounted_price: string;
    discount_percentage: string;
    has_active_discount: boolean;
    category_id: string;
    instructor_id: string;
    seo: CourseSeoState;
    chapters: ChapterFormState[];
}

const COURSE_CATEGORIES: CourseOption[] = [
    { id: "1", name: "برنامه نویسی" },
    { id: "2", name: "طراحی UI/UX" },
    { id: "3", name: "DevOps" },
    { id: "4", name: "هوش مصنوعی" },
];

const INSTRUCTORS: CourseOption[] = [
    { id: "11", name: "محمد رضایی" },
    { id: "12", name: "الهام کریمی" },
    { id: "13", name: "علی مرادی" },
    { id: "14", name: "شادی نیک پور" },
];

function slugify(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function toNullableNumber(value: string): number | null {
    const normalized = value.trim();
    if (!normalized) return null;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
}

function toRequiredNumber(value: string): number {
    const parsed = toNullableNumber(value);
    return parsed ?? 0;
}

function createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLesson(order = 1): LessonFormState {
    return {
        id: createId(),
        title: "",
        content: "",
        order: String(order),
        duration_minutes: "0",
        is_free: false,
        video_url: "",
    };
}

function createChapter(sortOrder = 1): ChapterFormState {
    return {
        id: createId(),
        chapter_label: `فصل ${sortOrder}`,
        title: "",
        description: "",
        sort_order: String(sortOrder),
        lessons: [createLesson(1)],
    };
}

const initialState: CourseFormState = {
    title: "",
    slug: "",
    description: "",
    thumbnail_image: "",
    cover_image: "",
    duration_hourse: "0",
    total_students_count: "0",
    price: "0",
    discounted_price: "",
    discount_percentage: "",
    has_active_discount: false,
    category_id: "",
    instructor_id: "",
    seo: {
        seoTitle: "",
        seoDescription: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: "",
        noIndex: false,
        noFollow: false,
    },
    chapters: [createChapter(1)],
};

export default function AdminCreateCoursePage() {
    const [form, setForm] = useState<CourseFormState>(initialState);
    const [slugTouched, setSlugTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = useCallback(
        <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const updateSeo = useCallback(
        <K extends keyof CourseSeoState>(key: K, value: CourseSeoState[K]) => {
            setForm((prev) => ({
                ...prev,
                seo: {
                    ...prev.seo,
                    [key]: value,
                },
            }));
        },
        []
    );

    const updateChapterField = useCallback(
        <K extends keyof ChapterFormState>(chapterId: string, key: K, value: ChapterFormState[K]) => {
            setForm((prev) => ({
                ...prev,
                chapters: prev.chapters.map((chapter) =>
                    chapter.id === chapterId ? { ...chapter, [key]: value } : chapter
                ),
            }));
        },
        []
    );

    const updateLessonField = useCallback(
        <K extends keyof LessonFormState>(
            chapterId: string,
            lessonId: string,
            key: K,
            value: LessonFormState[K]
        ) => {
            setForm((prev) => ({
                ...prev,
                chapters: prev.chapters.map((chapter) => {
                    if (chapter.id !== chapterId) return chapter;
                    return {
                        ...chapter,
                        lessons: chapter.lessons.map((lesson) =>
                            lesson.id === lessonId ? { ...lesson, [key]: value } : lesson
                        ),
                    };
                }),
            }));
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

    const addChapter = () => {
        setForm((prev) => ({
            ...prev,
            chapters: [...prev.chapters, createChapter(prev.chapters.length + 1)],
        }));
    };

    const removeChapter = (chapterId: string) => {
        setForm((prev) => {
            const chapters = prev.chapters.filter((chapter) => chapter.id !== chapterId);
            if (chapters.length === 0) {
                return {
                    ...prev,
                    chapters: [createChapter(1)],
                };
            }

            return {
                ...prev,
                chapters,
            };
        });
    };

    const addLesson = (chapterId: string) => {
        setForm((prev) => ({
            ...prev,
            chapters: prev.chapters.map((chapter) => {
                if (chapter.id !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: [...chapter.lessons, createLesson(chapter.lessons.length + 1)],
                };
            }),
        }));
    };

    const removeLesson = (chapterId: string, lessonId: string) => {
        setForm((prev) => ({
            ...prev,
            chapters: prev.chapters.map((chapter) => {
                if (chapter.id !== chapterId) return chapter;
                const nextLessons = chapter.lessons.filter((lesson) => lesson.id !== lessonId);
                return {
                    ...chapter,
                    lessons: nextLessons.length > 0 ? nextLessons : [createLesson(1)],
                };
            }),
        }));
    };

    const totalLessons = useMemo(
        () => form.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
        [form.chapters]
    );

    const totalLessonDuration = useMemo(
        () =>
            form.chapters.reduce(
                (duration, chapter) =>
                    duration +
                    chapter.lessons.reduce(
                        (inner, lesson) => inner + (toNullableNumber(lesson.duration_minutes) ?? 0),
                        0
                    ),
                0
            ),
        [form.chapters]
    );

    const canSubmit = useMemo(() => {
        if (!form.title.trim() || !form.slug.trim()) return false;
        if (!form.chapters.length) return false;

        return form.chapters.every((chapter) => {
            if (!chapter.title.trim()) return false;
            if (!chapter.lessons.length) return false;
            return chapter.lessons.every((lesson) => lesson.title.trim().length > 0);
        });
    }, [form]);

    const buildPayload = useCallback(() => {
        const payload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || null,
            thumbnail_image: form.thumbnail_image.trim() || null,
            cover_image: form.cover_image.trim() || null,
            duration_hourse: toRequiredNumber(form.duration_hourse),
            total_students_count: toRequiredNumber(form.total_students_count),
            price: toRequiredNumber(form.price),
            discounted_price: form.has_active_discount
                ? toNullableNumber(form.discounted_price)
                : null,
            discount_percentage: form.has_active_discount
                ? toNullableNumber(form.discount_percentage)
                : null,
            has_active_discount: form.has_active_discount,
            category_id: toNullableNumber(form.category_id),
            instructor_id: toNullableNumber(form.instructor_id),
            chapters: form.chapters.map((chapter, chapterIndex) => ({
                chapter_label: chapter.chapter_label.trim() || `فصل ${chapterIndex + 1}`,
                title: chapter.title.trim(),
                description: chapter.description.trim() || null,
                sort_order: toNullableNumber(chapter.sort_order) ?? chapterIndex + 1,
                lessons: chapter.lessons.map((lesson, lessonIndex) => ({
                    title: lesson.title.trim(),
                    content: lesson.content.trim() || null,
                    order: toNullableNumber(lesson.order) ?? lessonIndex,
                    duration_minutes: toNullableNumber(lesson.duration_minutes) ?? 0,
                    is_free: lesson.is_free,
                    video_url: lesson.video_url.trim() || null,
                })),
            })),
            seo: {
                seo_title: form.seo.seoTitle.trim() || null,
                seo_description: form.seo.seoDescription.trim() || null,
                og_title: form.seo.ogTitle.trim() || null,
                og_description: form.seo.ogDescription.trim() || null,
                og_image: form.seo.ogImage.trim() || null,
                canonical_url: form.seo.canonicalUrl.trim() || null,
                no_index: form.seo.noIndex,
                no_follow: form.seo.noFollow,
            },
        };

        return payload;
    }, [form]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            toast.error("لطفا عنوان دوره، اسلاگ و عنوان تمام فصل ها و درس ها را تکمیل کنید.");
            return;
        }

        const payload = buildPayload();

        setIsSubmitting(true);
        try {
            await api.post(endpoints.admin.courses, payload);
            toast.success("دوره با موفقیت ایجاد شد.");
            setForm({
                ...initialState,
                chapters: [createChapter(1)],
            });
            setSlugTouched(false);
        } catch (error) {
            showBackendError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">ایجاد دوره آموزشی</h2>
                    <p className="text-sm text-muted-foreground">
                        اطلاعات اصلی، فصل ها، درس ها و متای سئو را تکمیل کنید.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={!canSubmit || isSubmitting} className="gap-2">
                        {isSubmitting ? <Save className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
                        {isSubmitting ? "در حال ثبت..." : "ثبت دوره"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">اطلاعات پایه دوره</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">عنوان دوره</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(event) => handleTitleChange(event.target.value)}
                                    placeholder="مثال: آموزش جامع Next.js"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={form.slug}
                                    onChange={(event) => handleSlugChange(event.target.value)}
                                    placeholder="nextjs-masterclass"
                                    dir="ltr"
                                    required
                                />
                                <p className="text-xs text-muted-foreground" dir="ltr">
                                    /courses/{form.slug || "course-slug"}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description">توضیحات دوره</Label>
                                <RichTextEditor
                                    value={form.description}
                                    onChange={(html) => updateField("description", html)}
                                    placeholder="توضیح کامل دوره را وارد کنید..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">ساختار آموزشی دوره</CardTitle>
                            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addChapter}>
                                <Plus className="h-4 w-4" />
                                افزودن فصل
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Accordion type="multiple" className="w-full">
                                {form.chapters.map((chapter, chapterIndex) => (
                                    <AccordionItem key={chapter.id} value={chapter.id}>
                                        <AccordionTrigger>
                                            <div className="flex min-w-0 items-center gap-2 text-right">
                                                <Badge variant="secondary">فصل {chapterIndex + 1}</Badge>
                                                <span className="truncate">
                                                    {chapter.title.trim() || "فصل بدون عنوان"}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div className="space-y-1.5">
                                                        <Label>برچسب فصل</Label>
                                                        <Input
                                                            value={chapter.chapter_label}
                                                            onChange={(event) =>
                                                                updateChapterField(
                                                                    chapter.id,
                                                                    "chapter_label",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="فصل اول"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <Label>عنوان فصل</Label>
                                                        <Input
                                                            value={chapter.title}
                                                            onChange={(event) =>
                                                                updateChapterField(
                                                                    chapter.id,
                                                                    "title",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="مثال: مبانی و شروع کار"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div className="space-y-1.5">
                                                        <Label>ترتیب نمایش</Label>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={chapter.sort_order}
                                                            onChange={(event) =>
                                                                updateChapterField(
                                                                    chapter.id,
                                                                    "sort_order",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <Label>توضیح فصل</Label>
                                                        <Textarea
                                                            value={chapter.description}
                                                            onChange={(event) =>
                                                                updateChapterField(
                                                                    chapter.id,
                                                                    "description",
                                                                    event.target.value
                                                                )
                                                            }
                                                            rows={2}
                                                            placeholder="توضیح کوتاه درباره اهداف این فصل"
                                                        />
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold text-foreground">
                                                            درس های فصل
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2"
                                                            onClick={() => addLesson(chapter.id)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            افزودن درس
                                                        </Button>
                                                    </div>

                                                    {chapter.lessons.map((lesson, lessonIndex) => (
                                                        <Card key={lesson.id} className="border-dashed">
                                                            <CardContent className="space-y-3 pt-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline">
                                                                            درس {lessonIndex + 1}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {lesson.title.trim() || "بدون عنوان"}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-destructive"
                                                                        onClick={() =>
                                                                            removeLesson(chapter.id, lesson.id)
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label>عنوان درس</Label>
                                                                    <Input
                                                                        value={lesson.title}
                                                                        onChange={(event) =>
                                                                            updateLessonField(
                                                                                chapter.id,
                                                                                lesson.id,
                                                                                "title",
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        placeholder="مثال: نصب و راه اندازی پروژه"
                                                                        required
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label>ترتیب</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            value={lesson.order}
                                                                            onChange={(event) =>
                                                                                updateLessonField(
                                                                                    chapter.id,
                                                                                    lesson.id,
                                                                                    "order",
                                                                                    event.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <Label>مدت (دقیقه)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            value={lesson.duration_minutes}
                                                                            onChange={(event) =>
                                                                                updateLessonField(
                                                                                    chapter.id,
                                                                                    lesson.id,
                                                                                    "duration_minutes",
                                                                                    event.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center justify-between rounded-md border p-3">
                                                                        <div>
                                                                            <p className="text-sm font-medium">درس رایگان</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                بدون خرید قابل مشاهده باشد
                                                                            </p>
                                                                        </div>
                                                                        <Switch
                                                                            checked={lesson.is_free}
                                                                            onCheckedChange={(checked) =>
                                                                                updateLessonField(
                                                                                    chapter.id,
                                                                                    lesson.id,
                                                                                    "is_free",
                                                                                    checked
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label>لینک ویدیو</Label>
                                                                    <Input
                                                                        value={lesson.video_url}
                                                                        onChange={(event) =>
                                                                            updateLessonField(
                                                                                chapter.id,
                                                                                lesson.id,
                                                                                "video_url",
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        placeholder="https://..."
                                                                        dir="ltr"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label>محتوای متنی درس</Label>
                                                                    <Textarea
                                                                        value={lesson.content}
                                                                        onChange={(event) =>
                                                                            updateLessonField(
                                                                                chapter.id,
                                                                                lesson.id,
                                                                                "content",
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        rows={3}
                                                                        placeholder="نکات یا توضیحات تکمیلی درس"
                                                                    />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="gap-2 text-destructive"
                                                        onClick={() => removeChapter(chapter.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        حذف این فصل
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">تنظیمات سئو (SEO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="general">عمومی</TabsTrigger>
                                    <TabsTrigger value="social">Open Graph</TabsTrigger>
                                    <TabsTrigger value="advanced">پیشرفته</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="seo-title">SEO Title</Label>
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    form.seo.seoTitle.length > 70
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {form.seo.seoTitle.length}/70
                                            </span>
                                        </div>
                                        <Input
                                            id="seo-title"
                                            value={form.seo.seoTitle}
                                            onChange={(event) =>
                                                updateSeo("seoTitle", event.target.value)
                                            }
                                            placeholder="عنوان سئو صفحه دوره"
                                            maxLength={70}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="seo-description">SEO Description</Label>
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    form.seo.seoDescription.length > 160
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {form.seo.seoDescription.length}/160
                                            </span>
                                        </div>
                                        <Textarea
                                            id="seo-description"
                                            value={form.seo.seoDescription}
                                            onChange={(event) =>
                                                updateSeo("seoDescription", event.target.value)
                                            }
                                            rows={3}
                                            maxLength={160}
                                            placeholder="توضیحات سئو برای نتایج جستجو"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="canonical-url">Canonical URL</Label>
                                        <Input
                                            id="canonical-url"
                                            value={form.seo.canonicalUrl}
                                            onChange={(event) =>
                                                updateSeo("canonicalUrl", event.target.value)
                                            }
                                            placeholder="https://example.com/courses/nextjs-masterclass"
                                            dir="ltr"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="og-title">OG Title</Label>
                                        <Input
                                            id="og-title"
                                            value={form.seo.ogTitle}
                                            onChange={(event) => updateSeo("ogTitle", event.target.value)}
                                            placeholder="عنوان شبکه های اجتماعی"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="og-description">OG Description</Label>
                                        <Textarea
                                            id="og-description"
                                            value={form.seo.ogDescription}
                                            onChange={(event) =>
                                                updateSeo("ogDescription", event.target.value)
                                            }
                                            rows={3}
                                            placeholder="توضیحات شبکه های اجتماعی"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="og-image">OG Image</Label>
                                        <Input
                                            id="og-image"
                                            value={form.seo.ogImage}
                                            onChange={(event) => updateSeo("ogImage", event.target.value)}
                                            placeholder="https://example.com/og-course.jpg"
                                            dir="ltr"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-4">
                                    <div className="rounded-md border p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">No Index</p>
                                                <p className="text-xs text-muted-foreground">
                                                    جلوگیری از ایندکس شدن صفحه توسط موتورهای جستجو
                                                </p>
                                            </div>
                                            <Switch
                                                checked={form.seo.noIndex}
                                                onCheckedChange={(checked) =>
                                                    updateSeo("noIndex", checked)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-md border p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">No Follow</p>
                                                <p className="text-xs text-muted-foreground">
                                                    جلوگیری از دنبال کردن لینک های این صفحه
                                                </p>
                                            </div>
                                            <Switch
                                                checked={form.seo.noFollow}
                                                onCheckedChange={(checked) =>
                                                    updateSeo("noFollow", checked)
                                                }
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">تنظیمات انتشار و قیمت</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>دسته بندی دوره</Label>
                                <Select
                                    value={form.category_id || undefined}
                                    onValueChange={(value) => updateField("category_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب دسته بندی" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURSE_CATEGORIES.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>مدرس دوره</Label>
                                <Select
                                    value={form.instructor_id || undefined}
                                    onValueChange={(value) => updateField("instructor_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب مدرس" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INSTRUCTORS.map((instructor) => (
                                            <SelectItem key={instructor.id} value={instructor.id}>
                                                {instructor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>مدت دوره (ساعت)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.duration_hourse}
                                        onChange={(event) =>
                                            updateField("duration_hourse", event.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>تعداد دانشجو</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.total_students_count}
                                        onChange={(event) =>
                                            updateField("total_students_count", event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>قیمت اصلی (تومان)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.price}
                                    onChange={(event) => updateField("price", event.target.value)}
                                />
                            </div>

                            <div className="rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">تخفیف فعال</p>
                                        <p className="text-xs text-muted-foreground">
                                            در صورت فعال بودن، قیمت تخفیفی و درصد را وارد کنید.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={form.has_active_discount}
                                        onCheckedChange={(checked) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                has_active_discount: checked,
                                                discounted_price: checked
                                                    ? prev.discounted_price
                                                    : "",
                                                discount_percentage: checked
                                                    ? prev.discount_percentage
                                                    : "",
                                            }))
                                        }
                                    />
                                </div>

                                {form.has_active_discount ? (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>قیمت تخفیفی</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={form.discounted_price}
                                                onChange={(event) =>
                                                    updateField("discounted_price", event.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>درصد تخفیف</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={form.discount_percentage}
                                                onChange={(event) =>
                                                    updateField("discount_percentage", event.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">رسانه دوره</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="thumbnail-image">تصویر بندانگشتی</Label>
                                <Input
                                    id="thumbnail-image"
                                    value={form.thumbnail_image}
                                    onChange={(event) =>
                                        updateField("thumbnail_image", event.target.value)
                                    }
                                    placeholder="https://example.com/thumb.jpg"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="cover-image">تصویر کاور</Label>
                                <Input
                                    id="cover-image"
                                    value={form.cover_image}
                                    onChange={(event) => updateField("cover_image", event.target.value)}
                                    placeholder="https://example.com/cover.jpg"
                                    dir="ltr"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">خلاصه ساختار</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                                <span className="text-muted-foreground">تعداد فصل ها</span>
                                <span className="font-semibold">{form.chapters.length}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                                <span className="text-muted-foreground">تعداد درس ها</span>
                                <span className="font-semibold">{totalLessons}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                                <span className="text-muted-foreground">مجموع زمان درس ها</span>
                                <span className="font-semibold">{totalLessonDuration} دقیقه</span>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    هر فصل و هر درس باید عنوان داشته باشد.
                                </p>
                                <p className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    مدت زمان را برای گزارش گیری دقیق وارد کنید.
                                </p>
                                <p className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    اگر ویدیو هنوز آماده نیست، لینک را خالی بگذارید.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
