import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtectedRoute = protectedPrefixes.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get("blog_access_token")?.value;
    const refreshToken = request.cookies.get("blog_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
