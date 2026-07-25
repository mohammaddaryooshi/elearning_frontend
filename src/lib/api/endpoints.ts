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
        discountCodes: {
            list: "/admin/discount-codes",
            create: "/admin/discount-codes",
            update: (id: string | number) => `/admin/discount-codes/${id}`,
            delete: (id: string | number) => `/admin/discount-codes/${id}`,
        },
        orders: {
            list: "/admin/orders",
            details: (id: string | number) => `/admin/orders/${id}`,
            update: (id: string | number) => `/admin/orders/${id}`,
            delete: (id: string | number) => `/admin/orders/${id}`,
            markAsPaid: (id: string | number) => `/admin/orders/${id}/mark-paid`,
            cancel: (id: string | number) => `/admin/orders/${id}/cancel`,
        },
        media: {
            list: "/admin/media",
            upload: "/admin/media/upload",
            delete: (id: string | number) => `/admin/media/${id}`,
        },
    },
} as const;
