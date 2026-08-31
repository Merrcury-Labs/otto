import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

function requestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function safeInternalDestination(value: string | null, fallback = "/") {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function appDestination(request: NextRequest) {
  return safeInternalDestination(request.nextUrl.searchParams.get("redirectTo"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (!session) {
    if (isAuthRoute) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", requestedPath(request));
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("user_role");
    return response;
  }

  if (pathname === "/onboarding") {
    if (!session.user.role) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      session.user.role === "org"
        ? new URL("/", DASHBOARD_URL)
        : new URL("/", request.url),
    );
  }

  if (isAuthRoute) {
    if (!session.user.role) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(
      new URL(appDestination(request), request.url),
    );
  }

  if (!session.user.role) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
