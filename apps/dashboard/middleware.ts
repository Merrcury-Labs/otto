import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  // Allow public routes without session
  if (isPublicRoute) {
    // If user is on login page and already has a session, redirect to home
    if (hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If no session and not on a public route, redirect to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a session on /create-org, allow it regardless
  if (pathname === "/create-org") {
    return NextResponse.next();
  }

  // For all other routes, check if the user has an org
  // (org check is done client-side in the layout to avoid heavy middleware)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
