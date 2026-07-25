"use client";

import { useMemo } from "react";
import { clearAuth } from "@/lib/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { showBackendError } from "@/lib/api/error-handler";

export function useAuth() {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    return useMemo(
        () => ({
            ...auth,
            logout: async () => {
                try {
                    await api.post(endpoints.auth.logout);
                } catch (error) {
                    showBackendError(error);
                } finally {
                    dispatch(clearAuth());
                }
            },
        }),
        [auth, dispatch]
    );
}
