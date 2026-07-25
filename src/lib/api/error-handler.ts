import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

export function getBackendErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse | undefined;
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors.join("\n");
        }

        if (data?.message) {
            return data.message;
        }
    }

    return "یک خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.";
}

export function showBackendError(error: unknown) {
    const message = getBackendErrorMessage(error);
    toast.error(message);
}

function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return typeof error === "object" && error !== null && "isAxiosError" in error;
}
