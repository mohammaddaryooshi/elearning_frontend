"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/lib/store";
import { canAccess, hasAdminRole } from "@/lib/utils/authz";


type Props = {
    children: ReactNode;
    permissions?: string[];
    roles?: string[];
};

export function AdminRouteGuard({ children, permissions, roles }: Props) {
    const { isAuthenticated, user } = useAppSelector((s) => s.auth);

    if (!isAuthenticated || !user) {
        return <div className="p-6 text-sm">برای دسترسی، ابتدا وارد شوید.</div>;
    }

    // اول اینکه اصلاً ادمین پنل هست یا نه
    if (!hasAdminRole(user)) {
        return <div className="p-6 text-sm text-destructive">شما مجوز دسترسی به این صفحه را ندارید.</div>;
    }

    // بعد rule اختصاصی صفحه
    const allowed = canAccess(user, { permissions, roles });
    if (!allowed) {
        return <div className="p-6 text-sm text-destructive">شما مجوز دسترسی به این صفحه را ندارید.</div>;
    }

    return <>{children}</>;
}
