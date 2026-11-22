import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "devvault-default-32-char-secret-key-change-in-prod";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const SESSION_COOKIE_NAME = "session_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;
  let sessionPayload: { userId: string; email: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload && payload.userId) {
        isValidSession = true;
        sessionPayload = payload as { userId: string; email: string };
      }
    } catch {
      isValidSession = false;
    }
  }

  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/api/resources");
  const isAuthPage = pathname === "/login";

  // Redirect unauthenticated requests on protected routes
  if (isProtectedPath && !isValidSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Pass userId to downstream route handlers via headers if authenticated
  const response = NextResponse.next();
  if (sessionPayload) {
    response.headers.set("x-user-id", sessionPayload.userId);
    response.headers.set("x-user-email", sessionPayload.email);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/resources/:path*", "/login"],
};
