import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Pages that require a signed-in user.
const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/findings",
  "/analysis",
  "/reports",
  "/ask",
  "/settings",
];

// Pages a signed-in user shouldn't land back on.
const authOnlyRoutes = ["/login", "/register"];

function matches(pathname, routes) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = matches(pathname, protectedRoutes);
  const isAuthOnly = matches(pathname, authOnlyRoutes);

  // Public route — nothing to check.
  if (!isProtected && !isAuthOnly) {
    return NextResponse.next();
  }

  // Lightweight session check.
  // Do NOT call auth() here because that loads Prisma/database code.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  // Not signed in → login.
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);

    return NextResponse.redirect(loginUrl);
  }

  // Already signed in → dashboard.
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*$).*)"],
};
