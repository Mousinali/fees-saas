"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const menus = [
  {
    name: "Home",
    href: "/dashboard",
    icon: "ri-home-5-line",
    activeIcon: "ri-home-5-fill",
  },
  {
    name: "Students",
    href: "/students",
    icon: "ri-graduation-cap-line",
    activeIcon: "ri-graduation-cap-fill",
  },
  {
    name: "Fees",
    href: "/fees",
    icon: "ri-wallet-3-line",
    activeIcon: "ri-wallet-3-fill",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "ri-bar-chart-box-line",
    activeIcon: "ri-bar-chart-box-fill",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "ri-user-3-line",
    activeIcon: "ri-user-3-fill",
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const isRootPage = menus.some((menu) => menu.href === pathname);

  if (!isRootPage) {
    return null;
  }

  return (
    <nav className="sticky bottom-0 z-50 mt-auto flex pt-3 pb-6 w-full border-t border-slate-200 bg-white">
      {menus.map((item, index) => {
        const active = pathname === item.href;
        const isMiddle = index === 2;

        if (isMiddle) {
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={true}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 active:scale-95 transition-transform">
                <i className={clsx("text-2xl", item.icon)} />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            scroll={true}
            className={clsx(
              "flex flex-1 flex-col items-center justify-center transition-colors",
              active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <i
              className={clsx(
                "text-[22px]",
                active ? item.activeIcon : item.icon
              )}
            />

            <span className="text-[11px] font-semibold tracking-wide">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}