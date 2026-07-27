import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const LOGIN_ROUTE = "/login";
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

function requestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function safeInternalDestination(value: string | null, fallback = "/") {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    if (pathname === LOGIN_ROUTE) {
      return NextResponse.next();
    }

    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("redirectTo", requestedPath(request));
    return NextResponse.redirect(loginUrl);
  }

  if (!session.user.role) {
    return NextResponse.redirect(new URL("/onboarding", WEB_APP_URL));
  }

  if (session.user.role !== "org") {
    return NextResponse.redirect(new URL("/", WEB_APP_URL));
  }

  if (pathname === LOGIN_ROUTE) {
    const destination = safeInternalDestination(
      request.nextUrl.searchParams.get("redirectTo"),
    );
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
