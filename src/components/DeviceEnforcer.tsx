"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DeviceEnforcer({
  role,
  children,
}: {
  role: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isPublicRoute = ["/login", "/register", "/"].includes(pathname);
  
  const [isDesktop, setIsDesktop] = useState(false);
  const [loggedOutMsg, setLoggedOutMsg] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const desktop = window.innerWidth >= 992;
      setIsDesktop(desktop);

      if (desktop && role !== "super_admin" && !isPublicRoute) {
        // If normal user on desktop, log them out immediately and redirect
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          window.location.href = "/login?kicked=desktop";
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [role, isPublicRoute]);

  // If super admin, allow everything everywhere
  if (role === "super_admin") {
    return <>{children}</>;
  }

  // If public route, allow everything everywhere (so admin can log in on desktop)
  // Normal users logging in on desktop will hit the dashboard and get kicked out immediately.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Wait for client to mount to know window size
  if (!mounted) {
    return <div className="invisible h-full">{children}</div>; 
  }

  // If normal user on desktop (or no role but somehow on private route)
  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Mobile App Only</h2>
          <p className="text-slate-500 font-medium">
            {loggedOutMsg
              ? "It's a mobile app, please login from a phone only. You have been automatically logged out."
              : "This is a mobile application. Please open it on a mobile device or reduce your browser window size (below 992px) to continue."}
          </p>
          {loggedOutMsg && (
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  // If mobile, allow children
  return <>{children}</>;
}
