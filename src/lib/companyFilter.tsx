// src/lib/companyFilter.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Company } from "./types";

interface CompanyFilterContextValue {
  companies: Company[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
}

const CompanyFilterContext = createContext<CompanyFilterContextValue>({
  companies: [],
  selectedCompanyId: null,
  setSelectedCompanyId: () => {},
});

// Fetches the company list once (admin-only) so the org switcher in the top
// bar and any page that wants to filter by company share the same selection.
export function CompanyFilterProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/companies?limit=200")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.companies) setCompanies(data.companies);
      })
      .catch((error) => console.error("Error fetching companies:", error));
  }, [enabled]);

  return (
    <CompanyFilterContext.Provider
      value={{ companies, selectedCompanyId, setSelectedCompanyId }}
    >
      {children}
    </CompanyFilterContext.Provider>
  );
}

export function useCompanyFilter() {
  return useContext(CompanyFilterContext);
}
