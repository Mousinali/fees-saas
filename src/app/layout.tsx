import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "remixicon/fonts/remixicon.css";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DeviceEnforcer from "@/components/DeviceEnforcer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fees Management SaaS",
  description: "Institute ERP & Fees Management",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Extract role from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let role: string | null = null;
  
  if (token) {
    try {
      const decodedPayload = jwt.decode(token) as any;
      if (decodedPayload && decodedPayload.role) {
        role = decodedPayload.role;
      }
    } catch (error) {
      // Ignore decode errors
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh" suppressHydrationWarning>
        <Toaster position="top-center" toastOptions={{ className: "!z-[9999999]" }} />
        <DeviceEnforcer role={role}>
          <div className="flex flex-col h-full">
            {children}
          </div>
        </DeviceEnforcer>
      </body>
    </html>
  );
}
