export interface ApiResponse<T = unknown> {
    success: true;
    statusCode?: number;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    statusCode?: number;
}


export type ApiResult<T = unknown> = ApiResponse<T> | ApiErrorResponse;


export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// usage :
// ApiResponse<PaginatedData<User>>
