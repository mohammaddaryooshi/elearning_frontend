"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, User, ShieldCheck } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import type { TicketDetail, TicketStatus, TicketPriority } from "../../types/tickets.type";
import {
    STATUS_LABELS,
    STATUS_COLORS,
    PRIORITY_LABELS,
    PRIORITY_COLORS,
} from "@/constants/tickets";

const replySchema = z.object({
    body: z.string().min(5, "پاسخ باید حداقل ۵ کاراکتر باشد"),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface TicketReplySheetProps {
    ticket: TicketDetail | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (
        ticketId: string,
        values: ReplyFormValues
    ) => Promise<void> | void;
    isSubmitting?: boolean;
}

export function TicketReplySheet({
    ticket,
    open,
    onOpenChange,
    onSubmit,
    isSubmitting = false,
}: TicketReplySheetProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const form = useForm<ReplyFormValues>({
        resolver: zodResolver(replySchema),
        defaultValues: {
            body: "",
            status: ticket?.status ?? "open",
            priority: ticket?.priority ?? "medium",
        },
    });

    // reset when ticket changes
    useEffect(() => {
        if (ticket) {
            form.reset({
                body: "",
                status: ticket.status,
                priority: ticket.priority,
            });
        }
    }, [ticket, form]);

    // scroll to bottom of messages when opened
    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [open, ticket?.messages]);

    if (!ticket) return null;

    const handleSubmit = async (values: ReplyFormValues) => {
        await onSubmit(ticket.id, values);
        form.resetField("body");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-full sm:max-w-2xl flex flex-col gap-0 p-0"
            >
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <SheetTitle className="text-right">
                                {ticket.subject}
                            </SheetTitle>
                            <SheetDescription className="text-right">
                                {ticket.user_name} · {ticket.user_email}
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={STATUS_COLORS[ticket.status]}>
                                {STATUS_LABELS[ticket.status]}
                            </Badge>
                            <Badge className={PRIORITY_COLORS[ticket.priority]}>
                                {PRIORITY_LABELS[ticket.priority]}
                            </Badge>
                        </div>
                    </div>
                </SheetHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
                    <div className="flex flex-col gap-4">
                        {ticket.messages.map((msg) => {
                            const isAdmin = msg.sender_role === "admin";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium
                                        ${isAdmin
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {isAdmin ? (
                                            <ShieldCheck className="h-4 w-4" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`flex flex-col gap-1 max-w-[75%] ${isAdmin ? "items-end" : "items-start"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {msg.created_at}
                                            </span>
                                        </div>
                                        <div
                                            className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed
                                            ${isAdmin
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-muted text-foreground rounded-tl-sm"
                                                }`}
                                        >
                                            {msg.body}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <Separator />

                {/* Reply Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="px-6 py-4 flex flex-col gap-3"
                    >
                        {/* Status + Priority row */}
                        <div className="flex items-center gap-3">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue placeholder="وضعیت" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(
                                                    Object.entries(
                                                        STATUS_LABELS
                                                    ) as [TicketStatus, string][]
                                                ).map(([val, label]) => (
                                                    <SelectItem
                                                        key={val}
                                                        value={val}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue placeholder="اولویت" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(
                                                    Object.entries(
                                                        PRIORITY_LABELS
                                                    ) as [
                                                        TicketPriority,
                                                        string,
                                                    ][]
                                                ).map(([val, label]) => (
                                                    <SelectItem
                                                        key={val}
                                                        value={val}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Textarea */}
                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="پاسخ خود را بنویسید..."
                                            className="resize-none min-h-[100px] text-sm"
                                            dir="rtl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="self-end gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? "در حال ارسال..." : "ارسال پاسخ"}
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
