import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        direction: "up" | "down";
    };
    iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconClassName }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-sm text-muted-foreground">{title}</span>
                    <span className="text-2xl font-bold text-foreground">{value}</span>
                    {trend && (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium",
                                trend.direction === "up" ? "text-emerald-500" : "text-destructive"
                            )}
                        >
                            {trend.direction === "up" ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {trend.value}
                        </span>
                    )}
                </div>

                <div
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
                        iconClassName
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}
