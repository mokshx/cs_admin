// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Data-viz palette (see dataviz skill): single-hue blue for magnitude bars/
// trend line, fixed status colors for the pipeline chart, app grays for chrome.
const BLUE = "#2a78d6";
const BLUE_WASH = "rgba(42, 120, 214, 0.1)";
const GRIDLINE = "#eef0f2";
const AXIS_INK = "#898781";
const LABEL_INK = "#52514e";

const STATUS_COLORS: Record<string, string> = {
  assigned: "#898781",
  started: "#fab219",
  completed: "#0ca30c",
  cancelled: "#d03b3b",
};

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  started: "Started",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface CountItem {
  name: string;
  count: number;
}

interface StatsResponse {
  isAdmin: boolean;
  totals: { total: number; verified: number; recruiters: number };
  signupsByMonth: { month: string; label: string; count: number }[];
  topTags: CountItem[];
  topUniversities: CountItem[];
  topCourses: CountItem[];
  internshipStatus: { status: string; count: number }[];
  byCompany: { company_id: string; count: number }[];
}

function StatTile({
  label,
  value,
  sublabel,
  meterPercent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  meterPercent?: number;
}) {
  return (
    <div className="bg-white shadow sm:rounded-md p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
      {meterPercent !== undefined && (
        <div className="mt-3 h-2 w-full rounded-full bg-blue-100">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${Math.min(100, Math.max(0, meterPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  legend,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
}) {
  return (
    <div className="bg-white shadow sm:rounded-md p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-gray-400">
      {label}
    </div>
  );
}

function horizontalBarData(items: CountItem[]) {
  return {
    labels: items.map((i) => i.name),
    datasets: [
      {
        data: items.map((i) => i.count),
        backgroundColor: BLUE,
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  };
}

const horizontalBarOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"bar">) => ` ${(ctx.parsed.x ?? 0).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0, color: AXIS_INK },
      grid: { color: GRIDLINE },
    },
    y: {
      ticks: { color: LABEL_INK },
      grid: { display: false },
    },
  },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    setStatsLoading(true);
    fetch("/api/users/stats")
      .then((res) => res.json())
      .then((data: StatsResponse) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error))
      .finally(() => setStatsLoading(false));
  }, [loading]);

  const signupDelta = useMemo(() => {
    if (!stats || stats.signupsByMonth.length < 2) return null;
    const months = stats.signupsByMonth;
    const last = months[months.length - 1].count;
    const prev = months[months.length - 2].count;
    return last - prev;
  }, [stats]);

  if (loading || statsLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { totals } = stats;
  const verifiedPct = totals.total ? Math.round((totals.verified / totals.total) * 100) : 0;
  const recruiterPct = totals.total ? Math.round((totals.recruiters / totals.total) * 100) : 0;
  const placementsCompleted =
    stats.internshipStatus.find((s) => s.status === "completed")?.count ?? 0;
  const totalAssignments = stats.internshipStatus.reduce((sum, s) => sum + s.count, 0);

  const lineData = {
    labels: stats.signupsByMonth.map((m) => m.label),
    datasets: [
      {
        label: "New sign-ups",
        data: stats.signupsByMonth.map((m) => m.count),
        borderColor: BLUE,
        backgroundColor: BLUE_WASH,
        pointBackgroundColor: BLUE,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
        tension: 0.25,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) => ` ${(ctx.parsed.y ?? 0).toLocaleString()} sign-ups`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: LABEL_INK } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: AXIS_INK },
        grid: { color: GRIDLINE },
      },
    },
  };

  const pipelineData = {
    labels: stats.internshipStatus.map((s) => STATUS_LABELS[s.status] ?? s.status),
    datasets: [
      {
        data: stats.internshipStatus.map((s) => s.count),
        backgroundColor: stats.internshipStatus.map(
          (s) => STATUS_COLORS[s.status] ?? BLUE
        ),
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };

  const byCompanyItems: CountItem[] = stats.byCompany.map((c) => ({
    name: c.company_id,
    count: c.count,
  }));

  return (
    <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Lead growth, verification, and internship pipeline at a glance
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Total leads"
          value={totals.total.toLocaleString()}
          sublabel={
            signupDelta === null
              ? undefined
              : signupDelta > 0
              ? `+${signupDelta} vs last month`
              : signupDelta === 0
              ? "No change vs last month"
              : `${signupDelta} vs last month`
          }
        />
        <StatTile
          label="Verified rate"
          value={`${verifiedPct}%`}
          sublabel={`${totals.verified.toLocaleString()} of ${totals.total.toLocaleString()} verified`}
          meterPercent={verifiedPct}
        />
        <StatTile
          label="Recruiter share"
          value={`${recruiterPct}%`}
          sublabel={`${totals.recruiters.toLocaleString()} of ${totals.total.toLocaleString()} are recruiters`}
          meterPercent={recruiterPct}
        />
        <StatTile
          label="Placements completed"
          value={placementsCompleted.toLocaleString()}
          sublabel={`of ${totalAssignments.toLocaleString()} total internship assignments`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartCard
          title="New sign-ups"
          subtitle="Last 6 months"
        >
          <Line data={lineData} options={lineOptions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top tags" subtitle="Most-used lead tags">
          {stats.topTags.length ? (
            <Bar data={horizontalBarData(stats.topTags)} options={horizontalBarOptions} />
          ) : (
            <EmptyState label="No tags assigned yet" />
          )}
        </ChartCard>

        <ChartCard
          title="Internship pipeline"
          subtitle="Assignments by status"
          legend={
            <div className="flex flex-wrap gap-3">
              {stats.internshipStatus.map((s) => (
                <span key={s.status} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[s.status] ?? BLUE }}
                  />
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
              ))}
            </div>
          }
        >
          {totalAssignments ? (
            <Bar data={pipelineData} options={horizontalBarOptions} />
          ) : (
            <EmptyState label="No internships assigned yet" />
          )}
        </ChartCard>

        <ChartCard title="Top universities" subtitle="By assigned-course interest">
          {stats.topUniversities.length ? (
            <Bar
              data={horizontalBarData(stats.topUniversities)}
              options={horizontalBarOptions}
            />
          ) : (
            <EmptyState label="No courses assigned yet" />
          )}
        </ChartCard>

        <ChartCard title="Top courses" subtitle="By assigned-course interest">
          {stats.topCourses.length ? (
            <Bar data={horizontalBarData(stats.topCourses)} options={horizontalBarOptions} />
          ) : (
            <EmptyState label="No courses assigned yet" />
          )}
        </ChartCard>

        {stats.isAdmin && byCompanyItems.length > 0 && (
          <ChartCard
            title="Leads by company"
            subtitle="Across all company-admin tenants"
          >
            <Bar data={horizontalBarData(byCompanyItems)} options={horizontalBarOptions} />
          </ChartCard>
        )}
      </div>
    </div>
  );
}
