// app/admin/instructors/page.tsx  — part 1/2
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, UserX, Users, BookOpen, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { InstructorsTable } from "@/features/admin/courses/components/InstructorsTable";
import type { AdminInstructorRow } from "@/features/admin/courses/components/InstructorsTable";

// ─── Mock data ────────────────────────────────────────────────────────────────
const initialInstructors: AdminInstructorRow[] = [
    { id: "1", full_name: "محمد جواد داریوشی", slug: "mohammad-javad-daryoushi", headline: "مدرس NestJS و Next.js", bio: "توسعه‌دهنده فول‌استک با تخصص در NestJS و Next.js", is_active: true, user_id: 1, course_count: 4, created_at: "1404/10/01" },
    { id: "2", full_name: "رضا محمدی", slug: "reza-mohammadi", headline: "متخصص SEO و دیجیتال مارکتینگ", bio: "بیش از ۷ سال تجربه در حوزه بازاریابی دیجیتال", is_active: true, user_id: 2, course_count: 2, created_at: "1404/08/15" },
    { id: "3", full_name: "سارا کریمی", slug: "sara-karimi", headline: "طراح UI/UX و Figma", bio: "طراح رابط کاربری با تمرکز بر تجربه کاربری", is_active: true, user_id: null, course_count: 3, created_at: "1404/11/20" },
    { id: "4", full_name: "علی شفیعی", slug: "ali-shafiei", headline: "مدرس DevOps و Docker", bio: "مهندس DevOps با تجربه در محیط‌های ابری", is_active: false, user_id: 4, course_count: 2, created_at: "1403/06/10" },
    { id: "5", full_name: "نیلوفر احمدی", slug: "niloofar-ahmadi", headline: "متخصص هوش مصنوعی و Python", bio: "دکترای یادگیری ماشین از دانشگاه تهران", is_active: true, user_id: 5, course_count: 5, created_at: "1404/03/22" },
    { id: "6", full_name: "کاوه رستمی", slug: "kaveh-rostami", headline: "توسعه‌دهنده React و TypeScript", bio: "فرانت‌اند دولوپر با تخصص در اکوسیستم React", is_active: false, user_id: null, course_count: 1, created_at: "1403/12/05" },
];
// ─────────────────────────────────────────────────────────────────────────────

type ActiveFilter = "all" | "active" | "inactive";
type SortFilter = "all" | "most-courses" | "least-courses";

type FormValues = {
    full_name: string;
    slug: string;
    headline: string;
    bio: string;
    avatar_image: string;
    is_active: boolean;
    user_id: string;
};

function toSlug(text: string) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9\u0600-\u06FF-]/g, "");
}

// app/admin/instructors/page.tsx  — part 2/2  (ادامه همان فایل)

export default function AdminInstructorsPage() {
    const [instructors, setInstructors] = useState<AdminInstructorRow[]>(initialInstructors);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
    const [sortFilter, setSortFilter] = useState<SortFilter>("all");

    // modal state
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminInstructorRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminInstructorRow | null>(null);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
        useForm<FormValues>({ defaultValues: { is_active: true } });

    const fullNameValue = watch("full_name");

    // auto-slug از روی نام انگلیسی تایپ شده
    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue("full_name", e.target.value);
        // فقط اگر اسلاگ هنوز دست‌نخورده باشد auto-fill کن
        if (!editTarget) {
            setValue("slug", toSlug(e.target.value));
        }
    };

    // ─── Stats ───────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: instructors.length,
        active: instructors.filter((i) => i.is_active).length,
        totalCourses: instructors.reduce((s, i) => s + i.courses_count, 0),
    }), [instructors]);

    // ─── Filters ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...instructors];
        const q = search.trim();
        if (q) result = result.filter((i) => i.full_name.includes(q) || i.slug.includes(q));
        if (activeFilter === "active") result = result.filter((i) => i.is_active);
        if (activeFilter === "inactive") result = result.filter((i) => !i.is_active);
        if (sortFilter === "most-courses") result.sort((a, b) => b.courses_count - a.courses_count);
        if (sortFilter === "least-courses") result.sort((a, b) => a.courses_count - b.courses_count);
        return result;
    }, [instructors, search, activeFilter, sortFilter]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        reset({ full_name: "", slug: "", headline: "", bio: "", avatar_image: "", is_active: true, user_id: "" });
        setFormOpen(true);
    };

    const openEdit = (row: AdminInstructorRow) => {
        setEditTarget(row);
        reset({
            full_name: row.full_name,
            slug: row.slug,
            headline: row.headline ?? "",
            bio: row.bio ?? "",
            avatar_image: row.avatar_image ?? "",
            is_active: row.is_active,
            user_id: row.user_id?.toString() ?? "",
        });
        setFormOpen(true);
    };

    const onSubmit = (values: FormValues) => {
        if (editTarget) {
            setInstructors((prev) =>
                prev.map((i) =>
                    i.id === editTarget.id
                        ? {
                            ...i,
                            full_name: values.full_name,
                            slug: values.slug,
                            headline: values.headline || null,
                            bio: values.bio || null,
                            avatar_image: values.avatar_image || null,
                            is_active: values.is_active,
                            user_id: values.user_id ? Number(values.user_id) : null,
                        }
                        : i
                )
            );
        } else {
            const newRow: AdminInstructorRow = {
                id: Date.now().toString(),
                full_name: values.full_name,
                slug: values.slug,
                headline: values.headline || null,
                bio: values.bio || null,
                avatar_image: values.avatar_image || null,
                is_active: values.is_active,
                user_id: values.user_id ? Number(values.user_id) : null,
                course_count: 0,
                created_at: new Date().toLocaleDateString("fa-IR"),
            };
            setInstructors((prev) => [newRow, ...prev]);
        }
        setFormOpen(false);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setInstructors((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت مدرسان</h2>
                <p className="text-sm text-muted-foreground">
                    مشاهده، ایجاد و مدیریت پروفایل مدرسان پلتفرم.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <Users className="h-8 w-8 text-primary shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">کل مدرسان</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <UserCheck className="h-8 w-8 text-green-500 shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{stats.active}</p>
                            <p className="text-sm text-muted-foreground">مدرسان فعال</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <BookOpen className="h-8 w-8 text-blue-500 shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{stats.totalCourses}</p>
                            <p className="text-sm text-muted-foreground">مجموع دوره‌ها</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table card */}
            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>لیست مدرسان</CardTitle>
                        <Button onClick={openCreate} className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            افزودن مدرس
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {/* جستجو */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="جستجو بر اساس نام یا اسلاگ..."
                                className="pr-9"
                            />
                        </div>

                        {/* وضعیت */}
                        <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as ActiveFilter)}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه</SelectItem>
                                <SelectItem value="active">فعال</SelectItem>
                                <SelectItem value="inactive">غیرفعال</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* مرتب‌سازی */}
                        <Select value={sortFilter} onValueChange={(v) => setSortFilter(v as SortFilter)}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="مرتب‌سازی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">پیش‌فرض</SelectItem>
                                <SelectItem value="most-courses">بیشترین دوره</SelectItem>
                                <SelectItem value="least-courses">کمترین دوره</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <InstructorsTable
                        data={filtered}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        hasPagination
                    />
                </CardContent>
            </Card>

            {/* ─── Form Modal (create / edit) ─── */}
            <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "ویرایش مدرس" : "افزودن مدرس جدید"}</DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? `در حال ویرایش پروفایل «${editTarget.full_name}»`
                                : "اطلاعات مدرس جدید را وارد کنید."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        {/* نام کامل */}
                        <div className="space-y-1">
                            <Label htmlFor="full_name">نام کامل *</Label>
                            <Input
                                id="full_name"
                                {...register("full_name", { required: "نام کامل الزامی است" })}
                                onChange={handleFullNameChange}
                                placeholder="محمد جواد داریوشی"
                            />
                            {errors.full_name && (
                                <p className="text-xs text-destructive">{errors.full_name.message}</p>
                            )}
                        </div>

                        {/* اسلاگ */}
                        <div className="space-y-1">
                            <Label htmlFor="slug">اسلاگ (Slug) *</Label>
                            <Input
                                id="slug"
                                dir="ltr"
                                {...register("slug", { required: "اسلاگ الزامی است" })}
                                placeholder="mohammad-javad-daryoushi"
                                className="font-mono text-sm"
                            />
                            {errors.slug && (
                                <p className="text-xs text-destructive">{errors.slug.message}</p>
                            )}
                        </div>

                        {/* تخصص */}
                        <div className="space-y-1">
                            <Label htmlFor="headline">تخصص / عنوان</Label>
                            <Input
                                id="headline"
                                {...register("headline")}
                                placeholder="مدرس NestJS و Next.js"
                            />
                        </div>

                        {/* آدرس آواتار */}
                        <div className="space-y-1">
                            <Label htmlFor="avatar_image">آدرس تصویر (URL)</Label>
                            <Input
                                id="avatar_image"
                                dir="ltr"
                                {...register("avatar_image")}
                                placeholder="https://example.com/avatar.jpg"
                                className="text-sm"
                            />
                        </div>

                        {/* شناسه کاربر */}
                        <div className="space-y-1">
                            <Label htmlFor="user_id">شناسه کاربر (اختیاری)</Label>
                            <Input
                                id="user_id"
                                type="number"
                                dir="ltr"
                                {...register("user_id")}
                                placeholder="1"
                                className="text-sm"
                            />
                        </div>

                        {/* بیوگرافی */}
                        <div className="space-y-1">
                            <Label htmlFor="bio">بیوگرافی</Label>
                            <Textarea
                                id="bio"
                                {...register("bio")}
                                placeholder="توضیح کوتاهی درباره مدرس..."
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        {/* وضعیت */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="is_active" className="text-sm font-medium">وضعیت فعال</Label>
                                <p className="text-xs text-muted-foreground">مدرس در سایت نمایش داده شود</p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={watch("is_active")}
                                onCheckedChange={(v) => setValue("is_active", v)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full sm:w-auto">
                                {editTarget ? "ذخیره تغییرات" : "افزودن مدرس"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                انصراف
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ─── Delete confirm dialog ─── */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-destructive" />
                            حذف مدرس
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف مدرس «{deleteTarget?.full_name}» اطمینان دارید؟
                            این عملیات قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                        >
                            حذف مدرس
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

