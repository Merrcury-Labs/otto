import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/signup", "/onboarding"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Keep login, signup, and onboarding reachable. Cookie presence alone does
  // not prove that a Better Auth session is still valid.
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // If user is NOT on an auth route and has NO session, redirect to login
  if (!isAuthRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("user_role");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
