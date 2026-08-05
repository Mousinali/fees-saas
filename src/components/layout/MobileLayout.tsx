"use client";

import { usePathname } from "next/navigation";
import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";
import NotificationDrawer from "@/components/ui/NotificationDrawer";
import { NotificationProvider, useNotification } from "@/context/NotificationContext";

type Props = {
  children: React.ReactNode;
};

function MobileLayoutContent({ children }: Props) {
  const { isDrawerOpen, closeDrawer, setUnreadCount } = useNotification();

  return (
    <div className="mx-auto w-full flex min-h-dvh max-w-4xl flex-col bg-white">
      <AppHeader />

      <main className="flex-1">{children}</main>

      <BottomNavigation />

      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer} 
        onUnreadCountChange={setUnreadCount} 
      />
    </div>
  );
}

export default function MobileLayout({ children }: Props) {
  return (
    <NotificationProvider>
      <MobileLayoutContent>{children}</MobileLayoutContent>
    </NotificationProvider>
  );
}
