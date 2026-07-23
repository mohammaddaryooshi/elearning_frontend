const DEFAULT_REDIRECT = "/dashboard";

function isBlockedPath(pathname: string) {
    return (
        pathname.startsWith("/login") ||
        pathname.startsWith("/verify") ||
        pathname.startsWith("/register")
    );
}

export function getSafeRedirectPath(
    input: string | null | undefined,
    fallback = DEFAULT_REDIRECT
) {
    if (!input) {
        return fallback;
    }

    const value = input.trim();

    if (!value.startsWith("/")) {
        return fallback;
    }

    if (value.startsWith("//") || value.includes("\\") || value.includes("://")) {
        return fallback;
    }

    try {
        const parsed = new URL(value, "http://localhost");
        if (parsed.origin !== "http://localhost") {
            return fallback;
        }

        const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        if (isBlockedPath(parsed.pathname)) {
            return fallback;
        }

        return normalized;
    } catch {
        return fallback;
    }
}
