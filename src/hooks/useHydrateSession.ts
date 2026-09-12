"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { clearAuth, setAuthReady, setUser } from "@/lib/store/slices/authSlice";
import { showBackendError } from "@/lib/api/error-handler";
import type { SessionResponse } from "@/features/auth/types";
import type { ApiResponse } from "@/types";

export function useHydrateSession() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let cancelled = false;

        const hydrate = async () => {
            try {
                const response = await api.get<ApiResponse<SessionResponse>>(endpoints.auth.session, {
                    withCredentials: true,
                });

                const result = response.data;

                if (cancelled) return;

                if (result.data.authenticated && result.data.user) {
                    dispatch(setUser(result.data.user));
                } else {
                    dispatch(clearAuth());
                }
            } catch (error) {
                if (!cancelled) {
                    dispatch(clearAuth());
                    // اگر نمی‌خوای روی هر رفرش ارور نشون بده، این خط رو کامنت کن
                    showBackendError(error);
                }
            } finally {
                if (!cancelled) {
                    dispatch(setAuthReady()); // بدون آرگومان
                }
            }
        };

        hydrate();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);
}
