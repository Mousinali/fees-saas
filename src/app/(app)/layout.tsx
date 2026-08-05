import MobileLayout from "@/components/layout/MobileLayout";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <MobileLayout>{children}</MobileLayout>
    </ReactQueryProvider>
  );
}
