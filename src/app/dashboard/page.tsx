// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCompanyFilter } from "../../lib/companyFilter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
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

// Fixed-order categorical palette (see dataviz skill) — used for the tags
// pie, the one chart here where each slice is its own distinct identity.
const CATEGORICAL_COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];

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

const TILE_ICON_STYLES: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
};

function StatTile({
  label,
  value,
  sublabel,
  meterPercent,
  icon,
  iconTone = "blue",
}: {
  label: string;
  value: string;
  sublabel?: string;
  meterPercent?: number;
  icon: React.ReactNode;
  iconTone?: keyof typeof TILE_ICON_STYLES;
}) {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-5">
      <span
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${TILE_ICON_STYLES[iconTone]}`}
      >
        {icon}
      </span>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
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
  heightClassName = "h-72",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
  heightClassName?: string;
}) {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <div className={heightClassName}>{children}</div>
    </div>
  );
}

function TileIcon({ path }: { path: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICON_PATHS = {
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.649M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  badgeCheck:
    "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  briefcase:
    "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.653v-1.4c0-1.056-.75-1.988-1.803-2.15a45.4 45.4 0 0 0-1.194-.164M18.75 14.15v-1.4a2.18 2.18 0 0 0-.75-1.653m0 3.053a45.4 45.4 0 0 1-15.05 0m15.05 0a2.18 2.18 0 0 1-.75 1.653m-14.3-1.653a2.18 2.18 0 0 1-.75-1.653v-1.4c0-1.056.75-1.988 1.803-2.15a45.4 45.4 0 0 1 1.194-.164M4.5 14.15v-1.4c0-1.056.75-1.988 1.803-2.15M15 6.75a3 3 0 1 0-6 0m6 0v.75a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.75m6 0h-6",
  cap: "M4.26 10.147a60.44 60.44 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443",
};

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

function pieData(items: CountItem[]) {
  return {
    labels: items.map((i) => i.name),
    datasets: [
      {
        data: items.map((i) => i.count),
        backgroundColor: items.map((_, i) => CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length]),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: LABEL_INK, boxWidth: 10, font: { size: 11 }, padding: 8 },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"pie">) => ` ${ctx.label}: ${(ctx.parsed ?? 0).toLocaleString()}`,
      },
    },
  },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const { selectedCompanyId, companies } = useCompanyFilter();

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
    const url = selectedCompanyId
      ? `/api/users/stats?company_id=${selectedCompanyId}`
      : "/api/users/stats";
    fetch(url)
      .then((res) => res.json())
      .then((data: StatsResponse) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error))
      .finally(() => setStatsLoading(false));
  }, [loading, selectedCompanyId]);

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

  const companyNameById = new Map(companies.map((c) => [c._id, c.name]));
  const byCompanyItems: CountItem[] = stats.byCompany.map((c) => ({
    name: companyNameById.get(c.company_id) ?? c.company_id,
    count: c.count,
  }));
  const selectedCompanyName = selectedCompanyId
    ? companyNameById.get(selectedCompanyId) ?? null
    : null;

  return (
    <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-600">
          {selectedCompanyName
            ? `Lead growth, verification, and internship pipeline for ${selectedCompanyName}`
            : "Lead growth, verification, and internship pipeline at a glance"}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Total leads"
          value={totals.total.toLocaleString()}
          icon={<TileIcon path={ICON_PATHS.users} />}
          iconTone="indigo"
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
          icon={<TileIcon path={ICON_PATHS.badgeCheck} />}
          iconTone="green"
          sublabel={`${totals.verified.toLocaleString()} of ${totals.total.toLocaleString()} verified`}
          meterPercent={verifiedPct}
        />
        <StatTile
          label="Recruiter share"
          value={`${recruiterPct}%`}
          icon={<TileIcon path={ICON_PATHS.briefcase} />}
          iconTone="amber"
          sublabel={`${totals.recruiters.toLocaleString()} of ${totals.total.toLocaleString()} are recruiters`}
          meterPercent={recruiterPct}
        />
        <StatTile
          label="Placements completed"
          value={placementsCompleted.toLocaleString()}
          icon={<TileIcon path={ICON_PATHS.cap} />}
          iconTone="blue"
          sublabel={`of ${totalAssignments.toLocaleString()} total internship assignments`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ChartCard title="New sign-ups" subtitle="Last 6 months">
            <Line data={lineData} options={lineOptions} />
          </ChartCard>
        </div>
        <ChartCard title="Top tags" subtitle="Most-used lead tags">
          {stats.topTags.length ? (
            <Pie data={pieData(stats.topTags)} options={pieOptions} />
          ) : (
            <EmptyState label="No tags assigned yet" />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {stats.isAdmin && !selectedCompanyId && byCompanyItems.length > 0 && (
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
