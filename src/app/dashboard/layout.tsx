// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/login");
  }

  return <>{children}</>;
}
