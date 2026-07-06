import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "remixicon/fonts/remixicon.css";
import { Toaster } from "react-hot-toast";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh" suppressHydrationWarning>
        <Toaster position="top-center" />
        <div className="min-[992px]:hidden flex flex-col h-full">
          {children}
        </div>
        <div className="hidden min-[992px]:flex fixed inset-0 z-[9999] bg-slate-50 items-center justify-center p-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-smartphone-line text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Mobile App Only</h2>
            <p className="text-slate-500">
              This is a mobile application. Please open it on a mobile device or reduce your browser window size (below 992px) to continue.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
