// src/app/layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { CompanyFilterProvider } from "../lib/companyFilter";
import { User } from "../lib/types";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsLoggingOut(false);
  };

  const showChrome = pathname !== "/login" && !!user;

  return (
    <html lang="en">
      <body className="antialiased">
        {showChrome ? (
          <CompanyFilterProvider enabled={user?.type === "admin"}>
            <div className="min-h-screen bg-gray-50 flex">
              <Sidebar pathname={pathname} user={user} />
              <div className="flex-1 flex flex-col min-w-0">
                <TopBar user={user} isLoggingOut={isLoggingOut} onLogout={handleLogout} />
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </CompanyFilterProvider>
        ) : (
          <div className="min-h-screen bg-gray-50">{children}</div>
        )}
      </body>
    </html>
  );
}
