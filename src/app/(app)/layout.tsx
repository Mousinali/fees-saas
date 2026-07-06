import MobileLayout from "@/components/layout/MobileLayout";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
}