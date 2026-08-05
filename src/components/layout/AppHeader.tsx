"use client";

import { usePathname, useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students List",
  "/fees": "Fees List",
  "/fees/collect": "Collect Fees",
  "/reports": "Reports",
  "/profile": "Profile Settings",
  "/courses": "Courses",
  "/batches": "Batches",
};

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount, openDrawer } = useNotification();

  let title = pageTitles[pathname] || "Fees Management";
  
  if (pathname === "/students/new") {
    title = "Add Student";
  } else if (pathname.match(/^\/students\/[^\/]+\/edit$/)) {
    title = "Edit Student";
  }

  const isRootPage = ["/dashboard", "/students", "/fees", "/reports", "/profile"].includes(pathname);

  if (
    pathname === "/dashboard" ||
    pathname === "/search" ||
    pathname.match(/^\/students\/[^\/]+$/) ||
    pathname.match(/^\/students\/[^\/]+\/fees$/)
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        {!isRootPage && (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 -ml-2"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {pathname === "/students" && (
          <>
            <button onClick={() => window.dispatchEvent(new Event('open-student-filter'))} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 relative">
              <i className="ri-filter-3-line text-xl"></i>
            </button>
            <button onClick={() => router.push('/search')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700">
              <i className="ri-search-line text-xl"></i>
            </button>
          </>
        )}
        <div className="relative">
          <button 
            onClick={openDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 relative"
          >
            <i className="ri-notification-3-line text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}