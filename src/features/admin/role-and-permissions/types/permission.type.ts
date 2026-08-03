export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

export type PermissionResource = | "users"
    | "roles"
    | "courses"
    | "lessons"
    | "categories"
    | "orders"
    | "payments"
    | "coupons"
    | "comments"
    | "notifications"
    | "settings"
    | "reports";

export interface Permission {
    id: number;
    name: string;           // e.g. "courses:read"
    label: string;          // e.g. "مشاهده دوره‌ها"
    description?: string;
    resource: PermissionResource;
    action: PermissionAction;
    is_system: boolean;
    roles_count: number;
    created_at: string;
}

export interface PermissionGroup {
    resource: PermissionResource;
    label: string;
    icon: string;
    permissions: Permission[];
}

export interface CreatePermissionDto {
    name: string;
    label: string;
    description?: string;
    resource: PermissionResource;
    action: PermissionAction;
}

export type UpdatePermissionDto = Partial<CreatePermissionDto>;
