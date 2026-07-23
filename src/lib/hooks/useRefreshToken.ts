"use client";

import { useCallback } from "react";
import axios from "axios";
import { endpoints } from "@/lib/api/endpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function useRefreshToken() {
    return useCallback(async () => {
        await axios.post(
            `${API_BASE_URL}${endpoints.auth.refresh}`,
            {},
            {
                withCredentials: true,
            }
        );
    }, []);
}
