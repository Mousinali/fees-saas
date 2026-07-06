"use client";

import { usePathname } from "next/navigation";
import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

type Props = {
  children: React.ReactNode;
};

export default function MobileLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full flex min-h-dvh max-w-4xl flex-col bg-white">
      <AppHeader />

      <main className="flex-1 pb-6">{children}</main>

      <BottomNavigation />
    </div>
  );
}
