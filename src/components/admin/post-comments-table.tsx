"use client";

import { useState } from "react";
import {
    ExternalLink,
    Trash2,
    MessageSquareReply,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { BadgeProps } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CommentStatus = "pending" | "approved" | "rejected";

export interface AdminCommentRow {
    id: string;
    author: string;
    content: string;
    created_at: string;
    post_title: string;
    post_slug: string;
    status: CommentStatus;
}

interface CommentsTableProps {
    data: AdminCommentRow[];
    onDelete: (comment: AdminCommentRow) => void;
    onReply: (comment: AdminCommentRow, reply: string) => void;
    onStatusChange: (id: string, status: CommentStatus) => void;
}

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
    CommentStatus,
    { label: string; variant: BadgeProps["variant"]; icon: React.ReactNode }
> = {
    pending: {
        label: "در انتظار",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
    },
    approved: {
        label: "تأیید شده",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
        label: "رد شده",
        variant: "outline",
        icon: <XCircle className="h-3 w-3" />,
    },
};

// ─── Reply Modal ──────────────────────────────────────────────────────────────
interface ReplyModalProps {
    comment: AdminCommentRow | null;
    open: boolean;
    onClose: () => void;
    onSubmit: (reply: string) => void;
}

function ReplyModal({ comment, open, onClose, onSubmit }: ReplyModalProps) {
    const [reply, setReply] = useState("");

    const handleSubmit = () => {
        if (!reply.trim()) return;
        onSubmit(reply.trim());
        setReply("");
        onClose();
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setReply("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquareReply className="h-5 w-5 text-primary" />
                        پاسخ به کامنت
                    </DialogTitle>
                </DialogHeader>

                {comment && (
                    <div className="space-y-4">
                        {/* original comment */}
                        <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    {comment.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {comment.created_at}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                {comment.content}
                            </p>
                        </div>

                        {/* reply textarea */}
                        <div className="space-y-1.5">
                            <Label htmlFor="reply-text">پاسخ شما</Label>
                            <Textarea
                                id="reply-text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!reply.trim()} className="gap-2">
                        <MessageSquareReply className="h-4 w-4" />
                        ارسال پاسخ
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        انصراف
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export function PostCommentsTable({
    data,
    onDelete,
    onReply,
    onStatusChange,
}: CommentsTableProps) {
    const [replyTarget, setReplyTarget] = useState<AdminCommentRow | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <MessageSquareReply className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">کامنتی یافت نشد.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right min-w-[120px]">نویسنده</TableHead>
                            <TableHead className="text-right min-w-[200px]">متن کامنت</TableHead>
                            <TableHead className="text-right min-w-[110px]">تاریخ ایجاد</TableHead>
                            <TableHead className="text-right min-w-[160px]">عنوان مقاله</TableHead>
                            <TableHead className="text-right min-w-[90px]">لینک</TableHead>
                            <TableHead className="text-right min-w-[130px]">وضعیت انتشار</TableHead>
                            <TableHead className="text-right min-w-[150px]">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((comment) => {
                            const cfg = statusConfig[comment.status];
                            return (
                                <TableRow key={comment.id}>
                                    {/* author */}
                                    <TableCell className="font-medium text-sm">
                                        {comment.author}
                                    </TableCell>

                                    {/* content — truncated */}
                                    <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                                        <span
                                            className="line-clamp-2 leading-relaxed"
                                            title={comment.content}
                                        >
                                            {comment.content}
                                        </span>
                                    </TableCell>

                                    {/* date */}
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {comment.created_at}
                                    </TableCell>

                                    {/* post title */}
                                    <TableCell className="text-sm max-w-[180px]">
                                        <span className="line-clamp-1">{comment.post_title}</span>
                                    </TableCell>

                                    {/* post link */}
                                    <TableCell>
                                        <a
                                            href={`/blog/${comment.post_slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            مشاهده
                                        </a>
                                    </TableCell>

                                    {/* status — inline select via buttons */}
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Badge
                                                variant={cfg.variant}
                                                className="flex items-center gap-1 text-xs"
                                            >
                                                {cfg.icon}
                                                {cfg.label}
                                            </Badge>
                                            {/* quick approve/reject toggles */}
                                            {comment.status !== "approved" && (
                                                <button
                                                    onClick={() =>
                                                        onStatusChange(comment.id, "approved")
                                                    }
                                                    title="تأیید"
                                                    className="rounded p-0.5 text-muted-foreground hover:text-green-600 transition-colors"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {comment.status !== "rejected" && (
                                                <button
                                                    onClick={() =>
                                                        onStatusChange(comment.id, "rejected")
                                                    }
                                                    title="رد"
                                                    className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* actions */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1.5 px-2.5 text-xs"
                                                onClick={() => setReplyTarget(comment)}
                                            >
                                                <MessageSquareReply className="h-3.5 w-3.5" />
                                                پاسخ
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(comment)}
                                                title="حذف کامنت"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <ReplyModal
                comment={replyTarget}
                open={!!replyTarget}
                onClose={() => setReplyTarget(null)}
                onSubmit={(reply) => {
                    if (replyTarget) onReply(replyTarget, reply);
                }}
            />
        </>
    );
}
