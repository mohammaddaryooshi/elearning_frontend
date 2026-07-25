"use client";

import {
    useCallback,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";
import {
    AudioLines,
    Copy,
    File,
    FileArchive,
    Film,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    Search,
    Trash2,
    Upload,
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { showBackendError } from "@/lib/api/error-handler";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

type MediaCategory = "all" | "image" | "audio" | "video" | "archive" | "document" | "other";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    extension: string;
    createdAt: string;
}

interface ApiMediaItem {
    id?: string | number;
    _id?: string;
    file_id?: string;
    name?: string;
    original_name?: string;
    filename?: string;
    url?: string;
    file_url?: string;
    path?: string;
    mimeType?: string;
    mime_type?: string;
    size?: number | string;
    extension?: string;
    ext?: string;
    createdAt?: string;
    created_at?: string;
}

interface ApiMediaListResponse {
    data?: ApiMediaItem[];
    items?: ApiMediaItem[];
    files?: ApiMediaItem[];
}

const ACCEPTED_FILE_TYPES = [
    "image/*",
    "audio/*",
    "video/*",
    ".zip",
    ".rar",
    ".7z",
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
].join(",");

function detectCategory(mimeType: string, extension: string): MediaCategory {
    const ext = extension.toLowerCase();
    const mime = mimeType.toLowerCase();

    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("video/")) return "video";
    if (["zip", "rar", "7z", "gz", "tar"].includes(ext)) return "archive";
    if (
        ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv"].includes(ext)
    ) {
        return "document";
    }

    return "other";
}

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function normalizeMediaItem(raw: ApiMediaItem, index: number): MediaFile | null {
    const id = String(raw.id ?? raw._id ?? raw.file_id ?? `temp-${index}`);
    const name = String(raw.name ?? raw.original_name ?? raw.filename ?? "بدون نام");
    const rawUrl = String(raw.url ?? raw.file_url ?? raw.path ?? "").trim();
    if (!rawUrl) return null;

    const sizeValue = Number(raw.size ?? 0);
    const size = Number.isFinite(sizeValue) ? sizeValue : 0;
    const extension = String(raw.extension ?? raw.ext ?? name.split(".").at(-1) ?? "").replace(".", "");
    const mimeType = String(raw.mimeType ?? raw.mime_type ?? "application/octet-stream");
    const createdAt = String(raw.createdAt ?? raw.created_at ?? new Date().toISOString());

    return {
        id,
        name,
        url: rawUrl,
        mimeType,
        size,
        extension,
        createdAt,
    };
}

function resolveAbsoluteUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    const serverUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    if (serverUrl) {
        const prefixed = url.startsWith("/") ? url : `/${url}`;
        return `${serverUrl}${prefixed}`;
    }

    if (typeof window !== "undefined") {
        const prefixed = url.startsWith("/") ? url : `/${url}`;
        return `${window.location.origin}${prefixed}`;
    }

    return url;
}

function getPreviewIcon(file: MediaFile) {
    const category = detectCategory(file.mimeType, file.extension);
    if (category === "image") return <ImageIcon className="h-5 w-5" />;
    if (category === "audio") return <AudioLines className="h-5 w-5" />;
    if (category === "video") return <Film className="h-5 w-5" />;
    if (category === "archive") return <FileArchive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
}

async function fetchMediaFiles(): Promise<MediaFile[]> {
    const response = await api.get<ApiMediaListResponse | ApiMediaItem[]>(
        endpoints.admin.media.list
    );

    const payload = response.data;
    let rawItems: ApiMediaItem[] = [];

    if (Array.isArray(payload)) {
        rawItems = payload;
    } else if (Array.isArray(payload?.items)) {
        rawItems = payload.items;
    } else if (Array.isArray(payload?.files)) {
        rawItems = payload.files;
    } else if (Array.isArray(payload?.data)) {
        rawItems = payload.data;
    }

    return rawItems
        .map((item, index) => normalizeMediaItem(item, index))
        .filter((item): item is MediaFile => item !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function AdminMediasPage() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<MediaCategory>("all");
    const [isDragActive, setIsDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
    const [isDeletingSelected, setIsDeletingSelected] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const mediaQuery = useQuery({
        queryKey: ["admin-media-files"],
        queryFn: fetchMediaFiles,
    });

    const files = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data]);

    const uploadFiles = useCallback(
        async (incoming: FileList | File[]) => {
            const fileArray = Array.from(incoming);
            if (!fileArray.length) return;

            const body = new FormData();
            for (const item of fileArray) {
                body.append("files", item);
            }

            setIsUploading(true);
            setUploadProgress(0);
            try {
                await api.post(endpoints.admin.media.upload, body, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (event) => {
                        if (!event.total) return;
                        const progress = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(progress);
                    },
                });

                toast.success(`${fileArray.length} فایل با موفقیت آپلود شد.`);
                await mediaQuery.refetch();
            } catch (error) {
                showBackendError(error);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        },
        [mediaQuery]
    );

    const onInputFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const incoming = event.target.files;
        if (!incoming?.length) return;
        await uploadFiles(incoming);
        event.target.value = "";
    };

    const onDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
        if (!event.dataTransfer.files?.length) return;
        await uploadFiles(event.dataTransfer.files);
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
    };

    const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
    };

    const filteredFiles = useMemo(() => {
        const query = search.trim().toLowerCase();
        return files.filter((file) => {
            const category = detectCategory(file.mimeType, file.extension);
            if (activeTab !== "all" && activeTab !== category) return false;
            if (!query) return true;

            return (
                file.name.toLowerCase().includes(query) ||
                file.extension.toLowerCase().includes(query) ||
                file.mimeType.toLowerCase().includes(query)
            );
        });
    }, [activeTab, files, search]);

    const selectedCount = selectedIds.size;

    const totalStorageSize = useMemo(
        () => files.reduce((sum, item) => sum + item.size, 0),
        [files]
    );

    const countByType = useMemo(() => {
        const counts: Record<MediaCategory, number> = {
            all: files.length,
            image: 0,
            audio: 0,
            video: 0,
            archive: 0,
            document: 0,
            other: 0,
        };

        for (const file of files) {
            const type = detectCategory(file.mimeType, file.extension);
            counts[type] += 1;
        }

        return counts;
    }, [files]);

    const handleCopyLink = async (file: MediaFile) => {
        const absolute = resolveAbsoluteUrl(file.url);
        try {
            await navigator.clipboard.writeText(absolute);
            toast.success("لینک فایل کپی شد.");
        } catch {
            toast.error("امکان کپی لینک وجود ندارد.");
        }
    };

    const handleDeleteFile = async (file: MediaFile) => {
        setDeletingId(file.id);
        try {
            await api.delete(endpoints.admin.media.delete(file.id));
            await mediaQuery.refetch();
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(file.id);
                return next;
            });
            toast.success("فایل حذف شد.");
        } catch (error) {
            showBackendError(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedIds.size) return;
        const ids = Array.from(selectedIds);
        setIsDeletingSelected(true);
        try {
            await Promise.all(ids.map((id) => api.delete(endpoints.admin.media.delete(id))));
            await mediaQuery.refetch();
            setSelectedIds(new Set());
            toast.success(`${ids.length} فایل حذف شد.`);
        } catch (error) {
            showBackendError(error);
        } finally {
            setIsDeletingSelected(false);
        }
    };

    const toggleSelect = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const selectAllInView = (checked: boolean) => {
        if (!checked) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(new Set(filteredFiles.map((item) => item.id)));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">مدیریت فایل ها</h2>
                    <p className="text-sm text-muted-foreground">
                        آپلود، کپی لینک، جستجو و حذف فایل های رسانه ای برای استفاده در بلاگ، دوره ها و سایر بخش ها.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void mediaQuery.refetch()}
                    disabled={mediaQuery.isFetching}
                >
                    {mediaQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    بروزرسانی لیست
                </Button>
            </div>

            <div
                className={cn(
                    "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(event) => void onDrop(event)}
            >
                <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
                    <div className="rounded-full bg-muted p-3 text-muted-foreground">
                        <Upload className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            فایل ها را اینجا رها کنید یا از دکمه انتخاب فایل استفاده کنید.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            پشتیبانی از تصویر، صوت، ویدیو، فایل فشرده و اسناد.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_FILE_TYPES}
                            className="hidden"
                            onChange={(event) => void onInputFileChange(event)}
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            انتخاب فایل ها
                        </Button>
                        {isUploading ? (
                            <Badge variant="secondary">در حال آپلود: {uploadProgress}%</Badge>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">کل</p><p className="text-lg font-bold">{countByType.all}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">تصویر</p><p className="text-lg font-bold">{countByType.image}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">صدا</p><p className="text-lg font-bold">{countByType.audio}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">ویدیو</p><p className="text-lg font-bold">{countByType.video}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">فشرده</p><p className="text-lg font-bold">{countByType.archive}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">اسناد</p><p className="text-lg font-bold">{countByType.document}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">حجم کل</p><p className="text-lg font-bold">{formatBytes(totalStorageSize)}</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base">فایل های آپلود شده</CardTitle>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="جستجو بر اساس نام یا فرمت"
                                className="pr-9"
                            />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaCategory)}>
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all">همه</TabsTrigger>
                            <TabsTrigger value="image">تصویر</TabsTrigger>
                            <TabsTrigger value="audio">صدا</TabsTrigger>
                            <TabsTrigger value="video">ویدیو</TabsTrigger>
                            <TabsTrigger value="archive">فشرده</TabsTrigger>
                            <TabsTrigger value="document">اسناد</TabsTrigger>
                            <TabsTrigger value="other">سایر</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={filteredFiles.length > 0 && selectedCount === filteredFiles.length}
                                        onCheckedChange={(checked) => selectAllInView(Boolean(checked))}
                                    />
                                    <Label className="text-sm text-muted-foreground">
                                        انتخاب همه در این لیست
                                    </Label>
                                </div>

                                {selectedCount > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 text-destructive"
                                        onClick={() => void handleDeleteSelected()}
                                        disabled={isDeletingSelected}
                                    >
                                        {isDeletingSelected ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        حذف {selectedCount} فایل انتخاب شده
                                    </Button>
                                ) : null}
                            </div>

                            <Separator className="mb-4" />

                            {mediaQuery.isFetching ? (
                                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    در حال دریافت فایل ها...
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                                    <File className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        فایلی برای نمایش پیدا نشد.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredFiles.map((file) => {
                                        const absoluteUrl = resolveAbsoluteUrl(file.url);
                                        const isImage = detectCategory(file.mimeType, file.extension) === "image";
                                        const isVideo = detectCategory(file.mimeType, file.extension) === "video";
                                        const isAudio = detectCategory(file.mimeType, file.extension) === "audio";

                                        return (
                                            <Card key={file.id} className="overflow-hidden">
                                                <CardContent className="p-0">
                                                    <div className="relative flex h-40 items-center justify-center border-b bg-muted/30">
                                                        <Checkbox
                                                            className="absolute right-3 top-3 z-20 bg-background"
                                                            checked={selectedIds.has(file.id)}
                                                            onCheckedChange={(checked) =>
                                                                toggleSelect(file.id, Boolean(checked))
                                                            }
                                                        />

                                                        {isImage ? (
                                                            <Image
                                                                src={absoluteUrl}
                                                                alt={file.name}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                                className="object-cover"
                                                            />
                                                        ) : isVideo ? (
                                                            <video
                                                                src={absoluteUrl}
                                                                className="h-full w-full object-cover"
                                                                muted
                                                                controls={false}
                                                            />
                                                        ) : isAudio ? (
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                <AudioLines className="h-10 w-10" />
                                                                <audio src={absoluteUrl} controls className="max-w-[92%]" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                {getPreviewIcon(file)}
                                                                <span className="text-xs">{file.extension || "FILE"}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3 p-4">
                                                        <div className="space-y-1">
                                                            <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                                                                {file.name}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                <Badge variant="outline">{file.extension || "file"}</Badge>
                                                                <span>{formatBytes(file.size)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-md border bg-muted/20 p-2">
                                                            <p className="truncate text-xs text-muted-foreground" dir="ltr">
                                                                {absoluteUrl}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 gap-2"
                                                                onClick={() => void handleCopyLink(file)}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                                کپی لینک
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="gap-2 text-destructive"
                                                                onClick={() => setDeleteTarget(file)}
                                                                disabled={deletingId === file.id}
                                                            >
                                                                {deletingId === file.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                                حذف
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>حذف فایل</DialogTitle>
                        <DialogDescription>
                            آیا از حذف این فایل مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border bg-muted/20 p-3 text-sm text-foreground">
                        {deleteTarget?.name}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={async () => {
                                if (!deleteTarget) return;
                                const target = deleteTarget;
                                setDeleteTarget(null);
                                await handleDeleteFile(target);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            حذف فایل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
