import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hasSession = Boolean(getSessionCookie(request));
	const isAuthRoute = AUTH_ROUTES.has(pathname);

	if (isAuthRoute && hasSession) {
		return NextResponse.redirect(
			new URL(DEFAULT_AUTHENTICATED_PATH, request.url),
		);
	}

	if (!isAuthRoute && !hasSession) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirectTo", pathname);

		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
