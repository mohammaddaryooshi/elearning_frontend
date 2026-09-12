import type { User } from "@/features/auth/types";

function normalize(value: string) {
    return value.trim().toLowerCase();
}

export function getRoleNames(user: User | null | undefined): string[] {
    return (user?.roles ?? []).map((r) => r.name);
}

export function getPermissions(user: User | null | undefined): Set<string> {
    return new Set((user?.roles ?? []).flatMap((r) => r.permissions ?? []));
}

export function hasAdminRole(user: User | null | undefined): boolean {
    return getRoleNames(user)
        .map(normalize)
        .some((name) => name === "admin" || name.startsWith("admin."));
}

export function hasAnyRole(user: User | null | undefined, roles?: string[]): boolean {
    if (!roles?.length) return false;
    const userRoles = new Set(getRoleNames(user).map(normalize));
    return roles.some((role) => userRoles.has(normalize(role)));
}

export function hasAnyPermission(user: User | null | undefined, permissions?: string[]): boolean {
    if (!permissions?.length) return false;
    const perms = getPermissions(user);
    return permissions.some((p) => perms.has(p));
}

export function canAccess(
    user: User | null | undefined,
    rule?: { permissions?: string[]; roles?: string[] }
): boolean {
    if (!user) return false;
    if (!rule) return hasAdminRole(user);

    const hasPermRule = !!rule.permissions?.length;
    const hasRoleRule = !!rule.roles?.length;

    if (!hasPermRule && !hasRoleRule) return hasAdminRole(user);

    // اگر هر دو تعریف شده‌اند، یکی کافی باشد
    if (hasPermRule && hasRoleRule) {
        return hasAnyPermission(user, rule.permissions) || hasAnyRole(user, rule.roles);
    }

    if (hasPermRule) return hasAnyPermission(user, rule.permissions);
    return hasAnyRole(user, rule.roles);
}
