"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { clearAuth, setUser } from "@/lib/store/slices/authSlice";
import { showBackendError } from "@/lib/api/error-handler";
import type { SessionResponse } from "@/features/auth/types";

export function useHydrateSession() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let cancelled = false;

        const hydrate = async () => {
            try {
                const response = await api.get<SessionResponse>(endpoints.auth.session);
                if (!cancelled && response.data.authenticated && response.data.user) {
                    dispatch(setUser(response.data.user));
                }
            } catch (error) {
                if (!cancelled) {
                    dispatch(clearAuth());
                    showBackendError(error);
                }
            }
        };

        hydrate();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);
}
