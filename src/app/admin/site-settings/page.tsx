"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Globe,
    Search,
    BookOpen,
    Bell,
    Shield,
    CreditCard,
    Save,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface GeneralSettings {
    site_name: string;
    site_description: string;
    site_url: string;
    support_email: string;
    support_phone: string;
    logo_url: string;
    favicon_url: string;
    footer_text: string;
    maintenance_mode: boolean;
}

interface SeoSettings {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    canonical_url: string;
    robots_txt: string;
    google_analytics_id: string;
    google_search_console: string;
}

interface LearningSettings {
    allow_free_courses: boolean;
    certificate_enabled: boolean;
    certificate_signature: string;
    max_file_upload_mb: number;
    video_quality_default: string;
    enrollment_approval: boolean;
    forum_enabled: boolean;
    review_enabled: boolean;
    preview_lessons_count: number;
    course_expiry_days: number;
}

interface NotificationSettings {
    email_on_enrollment: boolean;
    email_on_course_complete: boolean;
    email_on_new_comment: boolean;
    email_on_new_user: boolean;
    sms_on_enrollment: boolean;
    sms_on_otp: boolean;
    sms_provider: string;
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_pass: string;
}

interface PaymentSettings {
    currency: string;
    payment_gateway: string;
    zarinpal_merchant_id: string;
    idpay_api_key: string;
    sandbox_mode: boolean;
    tax_percent: number;
    discount_enabled: boolean;
    wallet_enabled: boolean;
    refund_enabled: boolean;
    refund_days: number;
}

interface SecuritySettings {
    otp_expiry_minutes: number;
    otp_length: number;
    max_login_attempts: number;
    session_expiry_days: number;
    two_factor_enabled: boolean;
    recaptcha_enabled: boolean;
    recaptcha_site_key: string;
    recaptcha_secret_key: string;
    ip_whitelist: string;
    otp_max_attempts: number;        // ← type اضافه شد
    lockout_duration_minutes: number; // ← type اضافه شد
    jwt_ttl_hours: number;            // ← type اضافه شد
    force_https: boolean;
    ip_whitelist_enabled: boolean;
}


// ─── section wrapper ──────────────────────────────────────────────────────────

function SettingsSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function FieldGroup({
    label,
    htmlFor,
    hint,
    full,
    children,
}: {
    label: string;
    htmlFor: string;
    hint?: string;
    full?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
            <Label htmlFor={htmlFor} className="text-sm">
                {label}
            </Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

// ─── save button ──────────────────────────────────────────────────────────────

function SaveBar({ onSave, isDirty }: { onSave: () => void; isDirty: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">
                {isDirty ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/40 gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                        تغییرات ذخیره نشده
                    </Badge>
                ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                        همه تغییرات ذخیره شده
                    </Badge>
                )}
            </span>
            <Button onClick={onSave} className="gap-2" disabled={!isDirty}>
                <Save className="h-4 w-4" />
                ذخیره تنظیمات
            </Button>
        </div>
    );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});

    const markDirty = (tab: string) =>
        setDirtyTabs((prev) => ({ ...prev, [tab]: true }));
    const markClean = (tab: string) =>
        setDirtyTabs((prev) => ({ ...prev, [tab]: false }));

    // ── general form ──────────────────────────────────────────────────────────
    const generalForm = useForm<GeneralSettings>({
        defaultValues: {
            site_name: "آکادمی آنلاین",
            site_description: "بهترین پلتفرم یادگیری آنلاین",
            site_url: "https://example.com",
            support_email: "support@example.com",
            support_phone: "021-12345678",
            logo_url: "",
            favicon_url: "",
            footer_text: "تمامی حقوق محفوظ است.",
            maintenance_mode: false,
        },
    });

    // ── seo form ──────────────────────────────────────────────────────────────
    const seoForm = useForm<SeoSettings>({
        defaultValues: {
            meta_title: "آکادمی آنلاین | بهترین دوره‌های آموزشی",
            meta_description:
                "با آکادمی آنلاین بهترین دوره‌های آموزشی را در حوزه‌های مختلف بیاموزید.",
            meta_keywords: "آموزش آنلاین, دوره آموزشی, یادگیری",
            og_title: "",
            og_description: "",
            og_image: "",
            canonical_url: "https://example.com",
            robots_txt: "User-agent: *\nAllow: /\nDisallow: /admin/",
            google_analytics_id: "",
            google_search_console: "",
        },
    });

    // ── learning form ─────────────────────────────────────────────────────────
    const learningForm = useForm<LearningSettings>({
        defaultValues: {
            allow_free_courses: true,
            certificate_enabled: true,
            certificate_signature: "",
            max_file_upload_mb: 100,
            video_quality_default: "720p",
            enrollment_approval: false,
            forum_enabled: true,
            review_enabled: true,
            preview_lessons_count: 2,
            course_expiry_days: 365,
        },
    });

    // ── notification form ─────────────────────────────────────────────────────
    const notificationForm = useForm<NotificationSettings>({
        defaultValues: {
            email_on_enrollment: true,
            email_on_course_complete: true,
            email_on_new_comment: false,
            email_on_new_user: true,
            sms_on_enrollment: false,
            sms_on_otp: true,
            sms_provider: "farazsms",
            smtp_host: "",
            smtp_port: "587",
            smtp_user: "",
            smtp_pass: "",
        },
    });

    // ── payment form ──────────────────────────────────────────────────────────
    const paymentForm = useForm<PaymentSettings>({
        defaultValues: {
            currency: "IRR",
            payment_gateway: "zarinpal",
            zarinpal_merchant_id: "",
            idpay_api_key: "",
            sandbox_mode: true,
            tax_percent: 0,
            discount_enabled: true,
            wallet_enabled: false,
            refund_enabled: false,
            refund_days: 7,
        },
    });

    // ── security form ─────────────────────────────────────────────────────────
    const securityForm = useForm<SecuritySettings>({
        defaultValues: {
            otp_expiry_minutes: 5,
            otp_length: 6,
            max_login_attempts: 5,
            session_expiry_days: 30,
            two_factor_enabled: false,
            recaptcha_enabled: false,
            recaptcha_site_key: "",
            recaptcha_secret_key: "",
            ip_whitelist: "",
            otp_max_attempts: 3,          // ← اضافه شد
            lockout_duration_minutes: 15, // ← اضافه شد
            jwt_ttl_hours: 24,            // ← اضافه شد
        },
    });


    // ── save handlers ─────────────────────────────────────────────────────────
    const handleSave = (tab: string) => {
        // TODO: call API with form.getValues()
        console.log(`Saving ${tab} settings`);
        markClean(tab);
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">تنظیمات سایت</h2>
                <p className="text-sm text-muted-foreground">
                    پیکربندی کامل سایت آموزشی از یک مکان.
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
                dir="rtl"
            >
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-6">
                    <TabsTrigger value="general" className="gap-1.5 text-xs">
                        <Globe className="h-3.5 w-3.5" />
                        عمومی
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="gap-1.5 text-xs">
                        <Search className="h-3.5 w-3.5" />
                        سئو
                    </TabsTrigger>
                    <TabsTrigger value="learning" className="gap-1.5 text-xs">
                        <BookOpen className="h-3.5 w-3.5" />
                        آموزشی
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-1.5 text-xs">
                        <Bell className="h-3.5 w-3.5" />
                        اعلان‌ها
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="gap-1.5 text-xs">
                        <CreditCard className="h-3.5 w-3.5" />
                        پرداخت
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-1.5 text-xs">
                        <Shield className="h-3.5 w-3.5" />
                        امنیت
                    </TabsTrigger>
                </TabsList>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: GENERAL
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                تنظیمات عمومی
                            </CardTitle>
                            <CardDescription>اطلاعات پایه و هویت سایت.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection
                                title="اطلاعات سایت"
                                description="نام و توضیحات سایت که در مرورگر و موتورهای جستجو نمایش داده می‌شود."
                            >
                                <FieldGroup label="نام سایت" htmlFor="site_name">
                                    <Input
                                        id="site_name"
                                        {...generalForm.register("site_name", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="آدرس سایت (URL)" htmlFor="site_url">
                                    <Input
                                        id="site_url"
                                        dir="ltr"
                                        placeholder="https://example.com"
                                        {...generalForm.register("site_url", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="توضیح کوتاه سایت"
                                    htmlFor="site_description"
                                    full
                                >
                                    <Textarea
                                        id="site_description"
                                        rows={3}
                                        {...generalForm.register("site_description", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="اطلاعات تماس"
                                description="اطلاعاتی که در فوتر و صفحه تماس نمایش داده می‌شود."
                            >
                                <FieldGroup label="ایمیل پشتیبانی" htmlFor="support_email">
                                    <Input
                                        id="support_email"
                                        dir="ltr"
                                        type="email"
                                        {...generalForm.register("support_email", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="شماره تماس" htmlFor="support_phone">
                                    <Input
                                        id="support_phone"
                                        {...generalForm.register("support_phone", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="متن فوتر"
                                    htmlFor="footer_text"
                                    full
                                >
                                    <Input
                                        id="footer_text"
                                        {...generalForm.register("footer_text", {
                                            onChange: () => markDirty("general"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="لوگو و فاویکون"
                                description="تصاویر برند سایت."
                            >
                                <FieldGroup
                                    label="آدرس لوگو"
                                    htmlFor="logo_url"
                                    hint="پیشنهاد: PNG با پس‌زمینه شفاف، حداقل ۲۰۰×۶۰ پیکسل"
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            id="logo_url"
                                            dir="ltr"
                                            placeholder="/images/logo.png"
                                            {...generalForm.register("logo_url", {
                                                onChange: () => markDirty("general"),
                                            })}
                                        />
                                        <Button type="button" variant="outline" size="sm">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FieldGroup>
                                <FieldGroup
                                    label="آدرس فاویکون"
                                    htmlFor="favicon_url"
                                    hint="فایل .ico یا PNG 32×32"
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            id="favicon_url"
                                            dir="ltr"
                                            placeholder="/favicon.ico"
                                            {...generalForm.register("favicon_url", {
                                                onChange: () => markDirty("general"),
                                            })}
                                        />
                                        <Button type="button" variant="outline" size="sm">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">حالت تعمیرات</Label>
                                    <p className="text-xs text-muted-foreground">
                                        در این حالت، سایت برای کاربران عادی غیرفعال می‌شود.
                                    </p>
                                </div>
                                <Switch
                                    checked={generalForm.watch("maintenance_mode")}
                                    onCheckedChange={(v) => {
                                        generalForm.setValue("maintenance_mode", v);
                                        markDirty("general");
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("general")}
                        isDirty={dirtyTabs["general"] ?? false}
                    />
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: SEO
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="seo" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                تنظیمات سئو
                            </CardTitle>
                            <CardDescription>
                                بهینه‌سازی برای موتورهای جستجو و اشتراک‌گذاری در شبکه‌های اجتماعی.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection
                                title="متا تگ‌های صفحه اصلی"
                                description="این اطلاعات در نتایج جستجوی گوگل نمایش داده می‌شود."
                            >
                                <FieldGroup
                                    label="عنوان صفحه (Meta Title)"
                                    htmlFor="meta_title"
                                    hint="بین ۵۰ تا ۶۰ کاراکتر توصیه می‌شود"
                                    full
                                >
                                    <div className="space-y-1">
                                        <Input
                                            id="meta_title"
                                            {...seoForm.register("meta_title", {
                                                onChange: () => markDirty("seo"),
                                            })}
                                        />
                                        <p className="text-xs text-muted-foreground text-left">
                                            {seoForm.watch("meta_title")?.length ?? 0} / 60
                                        </p>
                                    </div>
                                </FieldGroup>
                                <FieldGroup
                                    label="توضیحات متا (Meta Description)"
                                    htmlFor="meta_description"
                                    hint="بین ۱۵۰ تا ۱۶۰ کاراکتر توصیه می‌شود"
                                    full
                                >
                                    <div className="space-y-1">
                                        <Textarea
                                            id="meta_description"
                                            rows={3}
                                            {...seoForm.register("meta_description", {
                                                onChange: () => markDirty("seo"),
                                            })}
                                        />
                                        <p className="text-xs text-muted-foreground text-left">
                                            {seoForm.watch("meta_description")?.length ?? 0} / 160
                                        </p>
                                    </div>
                                </FieldGroup>
                                <FieldGroup
                                    label="کلمات کلیدی (Keywords)"
                                    htmlFor="meta_keywords"
                                    hint="با ویرگول جدا کنید"
                                    full
                                >
                                    <Input
                                        id="meta_keywords"
                                        placeholder="آموزش, برنامه‌نویسی, دوره آنلاین"
                                        {...seoForm.register("meta_keywords", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="آدرس Canonical"
                                    htmlFor="canonical_url"
                                >
                                    <Input
                                        id="canonical_url"
                                        dir="ltr"
                                        {...seoForm.register("canonical_url", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="Open Graph (شبکه‌های اجتماعی)"
                                description="اطلاعاتی که هنگام اشتراک‌گذاری لینک در شبکه‌های اجتماعی نمایش داده می‌شود."
                            >
                                <FieldGroup label="عنوان OG" htmlFor="og_title" full>
                                    <Input
                                        id="og_title"
                                        placeholder="در صورت خالی بودن، از Meta Title استفاده می‌شود"
                                        {...seoForm.register("og_title", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="توضیحات OG"
                                    htmlFor="og_description"
                                    full
                                >
                                    <Textarea
                                        id="og_description"
                                        rows={2}
                                        placeholder="در صورت خالی بودن، از Meta Description استفاده می‌شود"
                                        {...seoForm.register("og_description", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="تصویر OG"
                                    htmlFor="og_image"
                                    hint="ابعاد پیشنهادی: ۱۲۰۰×۶۳۰ پیکسل"
                                    full
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            id="og_image"
                                            dir="ltr"
                                            placeholder="/images/og-image.jpg"
                                            {...seoForm.register("og_image", {
                                                onChange: () => markDirty("seo"),
                                            })}
                                        />
                                        <Button type="button" variant="outline" size="sm">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="ابزارهای آنالیتیکس"
                                description="اتصال به سرویس‌های آنالیز ترافیک."
                            >
                                <FieldGroup
                                    label="Google Analytics ID"
                                    htmlFor="ga_id"
                                    hint="مثال: G-XXXXXXXXXX"
                                >
                                    <Input
                                        id="ga_id"
                                        dir="ltr"
                                        placeholder="G-XXXXXXXXXX"
                                        {...seoForm.register("google_analytics_id", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="Google Search Console"
                                    htmlFor="gsc"
                                    hint="کد تأیید مالکیت سایت"
                                >
                                    <Input
                                        id="gsc"
                                        dir="ltr"
                                        placeholder="verification code"
                                        {...seoForm.register("google_search_console", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection title="فایل Robots.txt" description="">
                                <FieldGroup
                                    label="محتوای robots.txt"
                                    htmlFor="robots_txt"
                                    full
                                    hint="صفحاتی که نباید توسط موتورهای جستجو ایندکس شوند را اینجا تعریف کنید."
                                >
                                    <Textarea
                                        id="robots_txt"
                                        rows={6}
                                        dir="ltr"
                                        className="font-mono text-xs"
                                        {...seoForm.register("robots_txt", {
                                            onChange: () => markDirty("seo"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("seo")}
                        isDirty={dirtyTabs["seo"] ?? false}
                    />
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: LEARNING
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="learning" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                تنظیمات آموزشی
                            </CardTitle>
                            <CardDescription>
                                پیکربندی دوره‌ها، ثبت‌نام، گواهینامه و تجربه یادگیری.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection title="دوره‌ها و ثبت‌نام">
                                <FieldGroup
                                    label="پیش‌نمایش درس‌های رایگان"
                                    htmlFor="preview_lessons"
                                    hint="تعداد درس‌هایی که قبل از خرید قابل مشاهده هستند"
                                >
                                    <Input
                                        id="preview_lessons"
                                        type="number"
                                        min={0}
                                        {...learningForm.register("preview_lessons_count", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("learning"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="مدت دسترسی به دوره (روز)"
                                    htmlFor="course_expiry"
                                    hint="۰ = بدون محدودیت زمانی"
                                >
                                    <Input
                                        id="course_expiry"
                                        type="number"
                                        min={0}
                                        {...learningForm.register("course_expiry_days", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("learning"),
                                        })}
                                    />
                                </FieldGroup>

                                <FieldGroup
                                    label="حداکثر حجم آپلود (MB)"
                                    htmlFor="max_upload"
                                >
                                    <Input
                                        id="max_upload"
                                        type="number"
                                        min={1}
                                        {...learningForm.register("max_file_upload_mb", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("learning"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="کیفیت پیش‌فرض ویدیو" htmlFor="video_quality">
                                    <Select
                                        value={learningForm.watch("video_quality_default")}
                                        onValueChange={(v) => {
                                            learningForm.setValue("video_quality_default", v);
                                            markDirty("learning");
                                        }}
                                    >
                                        <SelectTrigger id="video_quality">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="360p">360p</SelectItem>
                                            <SelectItem value="480p">480p</SelectItem>
                                            <SelectItem value="720p">720p (HD)</SelectItem>
                                            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection title="گواهینامه">
                                <FieldGroup
                                    label="امضای گواهینامه"
                                    htmlFor="cert_sig"
                                    hint="نام مدیر یا موسسه که روی گواهینامه چاپ می‌شود"
                                    full
                                >
                                    <Input
                                        id="cert_sig"
                                        {...learningForm.register("certificate_signature", {
                                            onChange: () => markDirty("learning"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <div className="space-y-3">
                                {(
                                    [
                                        {
                                            key: "allow_free_courses" as const,
                                            label: "دوره‌های رایگان",
                                            desc: "امکان ایجاد دوره‌های رایگان توسط مدرسان",
                                        },
                                        {
                                            key: "certificate_enabled" as const,
                                            label: "صدور گواهینامه",
                                            desc: "پس از تکمیل دوره، گواهینامه صادر شود",
                                        },
                                        {
                                            key: "enrollment_approval" as const,
                                            label: "تأیید دستی ثبت‌نام",
                                            desc: "ثبت‌نام‌ها نیاز به تأیید ادمین دارند",
                                        },
                                        {
                                            key: "forum_enabled" as const,
                                            label: "فروم بحث و گفتگو",
                                            desc: "دانشجویان می‌توانند در هر دوره بحث کنند",
                                        },
                                        {
                                            key: "review_enabled" as const,
                                            label: "نظرات و امتیازدهی",
                                            desc: "دانشجویان می‌توانند به دوره‌ها امتیاز دهند",
                                        },
                                    ] as const
                                ).map(({ key, label, desc }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">{label}</Label>
                                            <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={learningForm.watch(key)}
                                            onCheckedChange={(v) => {
                                                learningForm.setValue(key, v);
                                                markDirty("learning");
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("learning")}
                        isDirty={dirtyTabs["learning"] ?? false}
                    />
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: NOTIFICATIONS
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                تنظیمات اعلان‌ها
                            </CardTitle>
                            <CardDescription>پیکربندی ایمیل، پیامک و SMTP.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection title="اعلان‌های ایمیل">
                                {(
                                    [
                                        {
                                            key: "email_on_enrollment" as const,
                                            label: "ثبت‌نام در دوره",
                                        },
                                        {
                                            key: "email_on_course_complete" as const,
                                            label: "تکمیل دوره",
                                        },
                                        {
                                            key: "email_on_new_comment" as const,
                                            label: "نظر جدید",
                                        },
                                        {
                                            key: "email_on_new_user" as const,
                                            label: "ثبت‌نام کاربر جدید",
                                        },
                                    ] as const
                                ).map(({ key, label }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <Label className="text-sm">{label}</Label>
                                        <Switch
                                            checked={notificationForm.watch(key)}
                                            onCheckedChange={(v) => {
                                                notificationForm.setValue(key, v);
                                                markDirty("notifications");
                                            }}
                                        />
                                    </div>
                                ))}
                            </SettingsSection>

                            <Separator />

                            <SettingsSection title="اعلان‌های پیامک">
                                <FieldGroup label="سرویس پیامک" htmlFor="sms_provider">
                                    <Select
                                        value={notificationForm.watch("sms_provider")}
                                        onValueChange={(v) => {
                                            notificationForm.setValue("sms_provider", v);
                                            markDirty("notifications");
                                        }}
                                    >
                                        <SelectTrigger id="sms_provider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="farazsms">فراز اس‌ام‌اس</SelectItem>
                                            <SelectItem value="kavenegar">کاوه‌نگار</SelectItem>
                                            <SelectItem value="melipayamak">ملی پیامک</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <div className="sm:col-span-2 space-y-3">
                                    {(
                                        [
                                            {
                                                key: "sms_on_enrollment" as const,
                                                label: "پیامک ثبت‌نام در دوره",
                                            },
                                            {
                                                key: "sms_on_otp" as const,
                                                label: "پیامک کد OTP",
                                            },
                                        ] as const
                                    ).map(({ key, label }) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <Label className="text-sm">{label}</Label>
                                            <Switch
                                                checked={notificationForm.watch(key)}
                                                onCheckedChange={(v) => {
                                                    notificationForm.setValue(key, v);
                                                    markDirty("notifications");
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="تنظیمات SMTP"
                                description="برای ارسال ایمیل از سرور اختصاصی."
                            >
                                <FieldGroup label="SMTP Host" htmlFor="smtp_host">
                                    <Input
                                        id="smtp_host"
                                        dir="ltr"
                                        placeholder="smtp.example.com"
                                        {...notificationForm.register("smtp_host", {
                                            onChange: () => markDirty("notifications"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="SMTP Port" htmlFor="smtp_port">
                                    <Input
                                        id="smtp_port"
                                        dir="ltr"
                                        placeholder="587"
                                        {...notificationForm.register("smtp_port", {
                                            onChange: () => markDirty("notifications"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="نام کاربری SMTP" htmlFor="smtp_user">
                                    <Input
                                        id="smtp_user"
                                        dir="ltr"
                                        type="email"
                                        {...notificationForm.register("smtp_user", {
                                            onChange: () => markDirty("notifications"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="رمز عبور SMTP" htmlFor="smtp_pass">
                                    <Input
                                        id="smtp_pass"
                                        dir="ltr"
                                        type="password"
                                        {...notificationForm.register("smtp_pass", {
                                            onChange: () => markDirty("notifications"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("notifications")}
                        isDirty={dirtyTabs["notifications"] ?? false}
                    />
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: PAYMENT
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="payment" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                تنظیمات پرداخت
                            </CardTitle>
                            <CardDescription>درگاه پرداخت، ارز و تخفیف.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection title="درگاه پرداخت">
                                <FieldGroup label="واحد پول" htmlFor="currency">
                                    <Select
                                        value={paymentForm.watch("currency")}
                                        onValueChange={(v) => {
                                            paymentForm.setValue("currency", v);
                                            markDirty("payment");
                                        }}
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IRR">ریال (IRR)</SelectItem>
                                            <SelectItem value="IRT">تومان (IRT)</SelectItem>
                                            <SelectItem value="USD">دلار (USD)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label="درگاه پرداخت" htmlFor="gateway">
                                    <Select
                                        value={paymentForm.watch("payment_gateway")}
                                        onValueChange={(v) => {
                                            paymentForm.setValue("payment_gateway", v);
                                            markDirty("payment");
                                        }}
                                    >
                                        <SelectTrigger id="gateway">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="zarinpal">زرین‌پال</SelectItem>
                                            <SelectItem value="idpay">آیدی‌پی</SelectItem>
                                            <SelectItem value="nextpay">نکست‌پی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup
                                    label="Merchant ID زرین‌پال"
                                    htmlFor="zarinpal_mid"
                                >
                                    <Input
                                        id="zarinpal_mid"
                                        dir="ltr"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        {...paymentForm.register("zarinpal_merchant_id", {
                                            onChange: () => markDirty("payment"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup label="API Key آیدی‌پی" htmlFor="idpay_key">
                                    <Input
                                        id="idpay_key"
                                        dir="ltr"
                                        type="password"
                                        {...paymentForm.register("idpay_api_key", {
                                            onChange: () => markDirty("payment"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="درصد مالیات"
                                    htmlFor="tax"
                                    hint="۰ = بدون مالیات"
                                >
                                    <Input
                                        id="tax"
                                        type="number"
                                        min={0}
                                        max={100}
                                        {...paymentForm.register("tax_percent", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("payment"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="مدت استرداد (روز)"
                                    htmlFor="refund_days"
                                    hint="۰ = بدون استرداد"
                                >
                                    <Input
                                        id="refund_days"
                                        type="number"
                                        min={0}
                                        {...paymentForm.register("refund_days", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("payment"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <div className="space-y-3">
                                {(
                                    [
                                        {
                                            key: "sandbox_mode" as const,
                                            label: "حالت آزمایشی (Sandbox)",
                                            desc: "پرداخت‌ها واقعی نیستند — فقط برای تست",
                                        },
                                        {
                                            key: "discount_enabled" as const,
                                            label: "کدهای تخفیف",
                                            desc: "امکان استفاده از کوپن تخفیف",
                                        },
                                        {
                                            key: "wallet_enabled" as const,
                                            label: "کیف پول",
                                            desc: "کاربران می‌توانند موجودی کیف پول داشته باشند",
                                        },
                                        {
                                            key: "refund_enabled" as const,
                                            label: "استرداد وجه",
                                            desc: "امکان درخواست بازگشت وجه",
                                        },
                                    ] as const
                                ).map(({ key, label, desc }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">{label}</Label>
                                            <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={paymentForm.watch(key)}
                                            onCheckedChange={(v) => {
                                                paymentForm.setValue(key, v);
                                                markDirty("payment");
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("payment")}
                        isDirty={dirtyTabs["payment"] ?? false}
                    />
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════════
                    TAB: SECURITY
                ══════════════════════════════════════════════════════════════ */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                تنظیمات امنیت
                            </CardTitle>
                            <CardDescription>
                                احراز هویت، OTP و محافظت از حساب.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingsSection title="رمز یک‌بار مصرف (OTP)">
                                <FieldGroup
                                    label="مدت اعتبار OTP (ثانیه)"
                                    htmlFor="otp_ttl"
                                    hint="معمولاً ۱۲۰ ثانیه"
                                >
                                    <Input
                                        id="otp_ttl"
                                        type="number"
                                        min={60}
                                        max={600}
                                        {...securityForm.register("otp_expiry_minutes", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="حداکثر تلاش OTP"
                                    htmlFor="otp_max_attempts"
                                    hint="بعد از این تعداد، حساب موقتاً قفل می‌شود"
                                >
                                    <Input
                                        id="otp_max_attempts"
                                        type="number"
                                        min={1}
                                        max={10}
                                        {...securityForm.register("otp_max_attempts", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="مدت قفل حساب (دقیقه)"
                                    htmlFor="lockout_duration"
                                    hint="پس از تلاش‌های ناموفق"
                                >
                                    <Input
                                        id="lockout_duration"
                                        type="number"
                                        min={1}
                                        {...securityForm.register("lockout_duration_minutes", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="مدت اعتبار JWT (ساعت)"
                                    htmlFor="jwt_ttl"
                                >
                                    <Input
                                        id="jwt_ttl"
                                        type="number"
                                        min={1}
                                        {...securityForm.register("jwt_ttl_hours", {
                                            valueAsNumber: true,
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <SettingsSection
                                title="reCAPTCHA"
                                description="محافظت در برابر ربات‌ها."
                            >
                                <FieldGroup
                                    label="Site Key"
                                    htmlFor="recaptcha_site_key"
                                >
                                    <Input
                                        id="recaptcha_site_key"
                                        dir="ltr"
                                        placeholder="6Le..."
                                        {...securityForm.register("recaptcha_site_key", {
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                                <FieldGroup
                                    label="Secret Key"
                                    htmlFor="recaptcha_secret_key"
                                >
                                    <Input
                                        id="recaptcha_secret_key"
                                        dir="ltr"
                                        type="password"
                                        placeholder="6Le..."
                                        {...securityForm.register("recaptcha_secret_key", {
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>

                            <Separator />

                            <div className="space-y-3">
                                {(
                                    [
                                        {
                                            key: "two_factor_enabled" as const,
                                            label: "احراز هویت دو مرحله‌ای (2FA)",
                                            desc: "کاربران می‌توانند 2FA را فعال کنند",
                                        },
                                        {
                                            key: "recaptcha_enabled" as const,
                                            label: "reCAPTCHA",
                                            desc: "فعال‌سازی در صفحات ورود و ثبت‌نام",
                                        },
                                        {
                                            key: "force_https" as const,
                                            label: "اجبار HTTPS",
                                            desc: "تمام درخواست‌های HTTP به HTTPS ریدایرکت شوند",
                                        },
                                        {
                                            key: "ip_whitelist_enabled" as const,
                                            label: "محدودیت IP برای ادمین",
                                            desc: "فقط IPهای مجاز می‌توانند وارد پنل شوند",
                                        },
                                    ] as const
                                ).map(({ key, label, desc }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">{label}</Label>
                                            <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={Boolean(securityForm.watch(key))}

                                            onCheckedChange={(v) => {
                                                securityForm.setValue(key, v);
                                                markDirty("security");
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <SettingsSection
                                title="IP های مجاز ادمین"
                                description="هر IP در یک خط جداگانه وارد کنید."
                            >
                                <FieldGroup
                                    label="لیست IP"
                                    htmlFor="ip_whitelist"
                                    hint="مثال: 192.168.1.1"
                                    full
                                >
                                    <Textarea
                                        id="ip_whitelist"
                                        dir="ltr"
                                        rows={4}
                                        placeholder={"192.168.1.1\n10.0.0.1"}
                                        {...securityForm.register("ip_whitelist", {
                                            onChange: () => markDirty("security"),
                                        })}
                                    />
                                </FieldGroup>
                            </SettingsSection>
                        </CardContent>
                    </Card>

                    <SaveBar
                        onSave={() => handleSave("security")}
                        isDirty={dirtyTabs["security"] ?? false}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
