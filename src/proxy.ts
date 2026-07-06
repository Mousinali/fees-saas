import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/register"];

  // If user is not logged in
  if (!token) {
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
      role: string;
      accountType: string;
    };

    // Prevent normal users from accessing Super Admin routes
    if (
      pathname.startsWith("/super-admin") &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Prevent logged-in users from visiting login/register
    if (publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("token");

    return response;
  }
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/students/:path*",
    "/courses/:path*",
    "/batches/:path*",
    "/fees/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/super-admin/:path*",
  ],
};
