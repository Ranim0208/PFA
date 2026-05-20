// middleware.js
import { NextResponse } from "next/server";
import { apiBaseUrl } from "./utils/constants";
import { authenticateInMiddleware } from "./services/auth/refresh";

const protectedRoutes = {
  "/admin": ["admin"],
  "/incubation-coordinator": ["IncubationCoordinator"],
  "/component-coordinator": ["ComponentCoordinator"],
  "/regional-coordinator": ["RegionalCoordinator"],
  "/mentor": ["mentor"],
  "/project-holder": ["projectHolder"],
  "/dashboard": [],
};

const publicRoutes = [
  "/",
  "/login",
  "/auth/login",
  "/auth/activate-account",
  "/auth/reset_password",
  "/auth/register",
  "/forgot-password",
  "/about",
  "/contact",
  "/error",
  "/not-found",
  "/unauthorized",
  "/500",
];

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  // Skip middleware for specific paths
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route is protected
  const matchedRoute = findProtectedRoute(pathname);
  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Authentication check
  return await handleProtectedRoute(
    request,
    pathname,
    matchedRoute,
    searchParams
  );
}

function shouldSkipMiddleware(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/static")
  );
}

function isPublicRoute(pathname) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function findProtectedRoute(pathname) {
  return Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  );
}

async function handleProtectedRoute(
  request,
  pathname,
  matchedRoute,
  searchParams
) {
  const accessToken = getCookie(request, "access");
  const refreshToken = getCookie(request, "refresh");

  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, pathname);
  }

  try {
    const authResult = await authenticateInMiddleware(
      accessToken,
      refreshToken
    );

    if (!authResult.success) {
      return handleAuthenticationFailed(request, pathname);
    }

    if (!hasRequiredRole(authResult.user, protectedRoutes[matchedRoute])) {
      return redirectToUnauthorized(request);
    }

    return createAuthorizedResponse(request, authResult);
  } catch (error) {
    console.error("Middleware error:", error);
    return handleAuthenticationFailed(request, pathname);
  }
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  return cookies[name];
}

function hasRequiredRole(user, requiredRoles) {
  if (requiredRoles.length === 0) return true;

  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.role)
    ? user.role
    : user.role
    ? [user.role]
    : [];

  return requiredRoles.some((role) => userRoles.includes(role));
}

function createAuthorizedResponse(request, authResult) {
  const requestHeaders = new Headers(request.headers);
  const user = authResult.user;
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : [user.role].filter(Boolean);

  requestHeaders.set("x-user-id", user.id?.toString() || "");
  requestHeaders.set("x-user-roles", JSON.stringify(userRoles));
  requestHeaders.set("x-user-email", user.email || "");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Refresh access token if needed
  if (authResult.newAccessToken) {
    response.cookies.set("access", authResult.newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
  }

  return response;
}

function redirectToLogin(request, originalPath) {
  const loginUrl = new URL("/auth/login", request.url);

  if (originalPath !== "/auth/login" && !originalPath.startsWith("/auth/")) {
    loginUrl.searchParams.set("redirect", originalPath);
  }

  return NextResponse.redirect(loginUrl);
}

function redirectToUnauthorized(request) {
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

function handleAuthenticationFailed(request, pathname) {
  const response = redirectToLogin(request, pathname);
  response.cookies.delete("access");
  response.cookies.delete("refresh");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
