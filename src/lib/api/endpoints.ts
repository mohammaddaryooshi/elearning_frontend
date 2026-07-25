export const endpoints = {
    auth: {
        sendOtp: "/api/v1/auth/otp/request",
        verifyOtp: "/api/v1/auth/otp/verify",
        register: "/api/v1/auth/register",
        refresh: "/api/v1/auth/refresh",
        logout: "/api/v1/auth/logout",
        session: "/api/v1/auth/session",
    },
    courses: {
        list: "/courses",
        details: (slug: string) => `/courses/${slug}`,
    },
    admin: {
        users: "/admin/users",
        courses: "/admin/courses",
    },
} as const;
