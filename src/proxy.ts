import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/register"];

  // Allow Next.js assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow auth APIs
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // No token
  if (!token) {
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      accountType: string;
    };

    // Logged-in users cannot access login/register
    if (pathname === "/login" || pathname === "/register") {
      if (decoded.role === "super_admin") {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin pages
    if (pathname.startsWith("/admin")) {
      if (decoded.role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Admin APIs
    if (
      pathname.startsWith("/api/admin") &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    // Redirect super admin dashboard
    if (
      pathname === "/dashboard" &&
      decoded.role === "super_admin"
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT Error:", error);

    const response = pathname.startsWith("/api")
      ? NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        )
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("token");

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};