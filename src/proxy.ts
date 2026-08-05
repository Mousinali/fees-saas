import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/register", "/"];

  // If user is not logged in
  if (!token) {
    if (publicRoutes.includes(pathname) || pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }
    
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

    // Prevent normal users from accessing Admin routes
    if (
      pathname.startsWith("/admin") &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Prevent normal users from accessing Admin APIs
    if (
      pathname.startsWith("/api/admin") &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    
    if (pathname === "/dashboard" && decoded.role === "super_admin") {
       return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Prevent logged-in users from visiting login/register
    if (publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
