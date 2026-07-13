// src/components/Sidebar.tsx
"use client";

import Link from "next/link";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75h6v6h-6v-6Zm10.5 0h6v6h-6v-6Zm-10.5 10.5h6v6h-6v-6Zm10.5 0h6v6h-6v-6Z"
      />
    ),
  },
  {
    name: "Users Table",
    href: "/users-table",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.649M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      />
    ),
  },
  {
    name: "Companies",
    href: "/companies",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    ),
  },
  {
    name: "Tags",
    href: "/tags",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.31a13.007 13.007 0 0 0 4.29-4.29c.563-.827.39-1.908-.31-2.607L10.24 3.66A2.25 2.25 0 0 0 8.65 3H9.568Z"
      />
    ),
  },
];

export default function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100">
        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          A
        </span>
        <span className="text-base font-semibold text-gray-900">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const current = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                current
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="w-5 h-5 shrink-0"
              >
                {item.icon}
              </svg>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
