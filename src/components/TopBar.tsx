// src/components/TopBar.tsx
"use client";

import { useState } from "react";
import { User } from "../lib/types";
import { useCompanyFilter } from "../lib/companyFilter";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  companyAdmin: "Company Admin",
};

export default function TopBar({
  user,
  isLoggingOut,
  onLogout,
}: {
  user: User | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompanyFilter();
  const isAdmin = user?.type === "admin";
  const initials = (user?.username ?? "?").slice(0, 2).toUpperCase();
  const roleLabel = user?.type ? ROLE_LABELS[user.type] ?? user.type : "";

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gray-500">Welcome back,</p>
        <h2 className="text-sm font-semibold text-gray-900">{user?.username ?? "..."}</h2>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <select
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            className="text-sm border border-gray-200 rounded-md pl-3 pr-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-md hover:bg-gray-50"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </span>
            <span className="text-left leading-tight hidden sm:block">
              <span className="block text-sm font-medium text-gray-900">
                {user?.username}
              </span>
              {roleLabel && (
                <span className="block text-xs text-gray-500">{roleLabel}</span>
              )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-20">
                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
