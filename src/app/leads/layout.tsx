// src/app/leads/layout.tsx
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import { redirect } from "next/navigation";

interface LeadsLayoutProps {
  children: React.ReactNode;
}

export default async function LeadsLayout({ children }: LeadsLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    redirect("/login");
  }

  // Leads are admin-only — companyAdmin has no scoped subset to see here.
  if (decoded.type !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
