"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const { user, hydrateUser } = useAuth();

    useEffect(() => {
        hydrateUser().catch(() => undefined);
    }, [hydrateUser]);

    return (
        <main className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>داشبورد کاربر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>نام: {user?.fullName ?? "-"}</p>
                    <p>شماره: {user?.phone ?? "-"}</p>
                    <p>نقش: {user?.role ?? "student"}</p>
                </CardContent>
            </Card>
        </main>
    );
}
