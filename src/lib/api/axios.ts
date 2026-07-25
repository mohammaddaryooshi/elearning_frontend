import axios, {
    AxiosError,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from "axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiErrorResponse } from "@/types";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error?: unknown) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
            return;
        }

        promise.resolve();
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Avoid refresh loops for auth endpoints themselves.
        if (
            originalRequest.url?.includes(endpoints.auth.refresh) ||
            originalRequest.url?.includes(endpoints.auth.verifyOtp) ||
            originalRequest.url?.includes(endpoints.auth.sendOtp)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest as AxiosRequestConfig));
        }

        isRefreshing = true;

        try {
            await axios.post(
                `${API_BASE_URL}${endpoints.auth.refresh}`,
                {},
                {
                    withCredentials: true,
                }
            );

            processQueue();
            return api(originalRequest as AxiosRequestConfig);
        } catch (refreshError) {
            processQueue(refreshError);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
