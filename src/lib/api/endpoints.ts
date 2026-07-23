export const endpoints = {
    auth: {
        sendOtp: "/auth/otp/send",
        verifyOtp: "/auth/otp/verify",
        register: "/auth/register",
        refresh: "/auth/refresh",
        logout: "/auth/logout",
        me: "/auth/me",
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
