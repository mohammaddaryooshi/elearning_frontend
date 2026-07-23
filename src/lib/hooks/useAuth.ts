"use client";

import { useMemo } from "react";
import { clearAuth, setUser } from "@/lib/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthResponse } from "@/types";

export function useAuth() {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    return useMemo(
        () => ({
            ...auth,
            hydrateUser: async () => {
                const response = await api.get<AuthResponse>(endpoints.auth.me);
                dispatch(setUser(response.data.user));
            },
            logout: async () => {
                await api.post(endpoints.auth.logout);
                dispatch(clearAuth());
            },
        }),
        [auth, dispatch]
    );
}
