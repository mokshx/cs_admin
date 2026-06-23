// src/components/Layout.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
// import { User } from "../lib/types";
import "./globals.css";

// interface LayoutProps {
//   children: React.ReactNode;
//   user?: User;
// }

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user if not provided (e.g. on client side navigation)
  if (typeof window !== 'undefined') {
    // We can try to rely on specific page logic or just fetch simple profile
    // But for now, let's just use what we have or try to fetch
    // Actually, let's try to fetch if we don't have it
    // But useEffect is better
  }

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

  const navigation = [
    {
      name: "User Management",
      href: "/dashboard",
      current: pathname === "/dashboard",
    },
    {
      name: "Companies",
      href: "/companies",
      current: pathname === "/companies",
    },
    {
      name: "Tags",
      href: "/tags",
      current: pathname === "/tags",
    },
  ];

  return (
    <html lang="en">
      <body className="antialiased">
        {" "}
        <div className="min-h-screen bg-gray-50">
          {true && (
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Admin Panel
                    </h1>

                    {/* Navigation */}
                    <nav className="flex space-x-4">
                      {navigation.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => router.push(item.href)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="flex items-center space-x-4">
                    Welcome!
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              </div>
            </header>
          )}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
