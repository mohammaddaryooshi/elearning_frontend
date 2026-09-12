export type UserRole = "student" | "admin" | "teacher";
export type AuthChannel = "email" | "phone";

export interface User {
    id: number;
    first_name: string;
    flast_name: string;
    phone_number: string;
    email?: string;
    roles: [{ name: string, permissions: string[] }]
}

export interface RequestOtpPayload {
    identifier: string;
}

export interface RequestOtpResponse {
    message: string;
    resend_after_seconds: number;
    identifier_type: AuthChannel;
}

export interface RequestOtpAuthenticatedResponse {
    authenticated: true;
    message: string;
    user: User;
    accessToken: string;
}

export type RequestOtpResult = RequestOtpResponse | RequestOtpAuthenticatedResponse;

export interface VerifyOtpPayload {
    identifier: string;
    otp: string;
}

export interface VerifyOtpLoginResponse {
    authenticated: true;
    user: User;
}

export interface VerifyOtpRegisterResponse {
    authenticated: false;
    needsRegistration: true;
    redirectTo: string;
}

export type VerifyOtpResponse = VerifyOtpLoginResponse | VerifyOtpRegisterResponse;

export interface CompleteRegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}

export interface CompleteRegisterResponse {
    authenticated: true;
    message: string;
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface SessionResponse {
    authenticated: boolean;
    message: string;
    user?: User;

}

export interface PendingOtpContact {
    identifier: string;
}


export interface Course {
    id: string;
    title: string;
    slug: string;
    teacher: string;
    price: number;
    enrolledCount: number;
}
