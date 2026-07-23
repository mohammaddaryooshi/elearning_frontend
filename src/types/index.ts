export type UserRole = "student" | "admin";
export type AuthChannel = "email" | "phone";

export interface User {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    role: UserRole;
}

export interface OtpRequestPayload {
    channel: AuthChannel;
    identifier: string;
}

export interface OtpVerifyPayload {
    channel: AuthChannel;
    identifier: string;
    code: string;
}

export interface PendingOtpContact {
    channel: AuthChannel;
    identifier: string;
}

export interface AuthResponse {
    user: User;
}

export interface OtpVerifyResponse {
    user?: User;
    requiresRegistration?: boolean;
    isRegistered?: boolean;
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    channel: AuthChannel;
    identifier: string;
}

export interface ApiErrorResponse {
    message?: string;
    statusCode?: number;
    error?: string;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    teacher: string;
    price: number;
    enrolledCount: number;
}
