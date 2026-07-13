import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/signup", "/onboarding"]);
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Check for role cookie set during onboarding
  const roleCookie = request.cookies.get("user_role")?.value;
  const role = roleCookie || null;

  // If user is on an auth route and has a session
  if (isAuthRoute && hasSession) {
    if (pathname === "/onboarding" && role) {
      // User already has a role, redirect away from onboarding
      if (role === "org") {
        return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if ((pathname === "/login" || pathname === "/signup") && role) {
      if (role === "org") {
        return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if ((pathname === "/login" || pathname === "/signup") && !role) {
      return NextResponse.redirect(
        new URL("/onboarding", request.url),
      );
    }

    return NextResponse.next();
  }

  // If user is NOT on an auth route and has NO session, redirect to login
  if (!isAuthRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a session but no role cookie, redirect to onboarding
  if (!isAuthRoute && hasSession && !role && pathname !== "/onboarding") {
    return NextResponse.redirect(
      new URL("/onboarding", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
