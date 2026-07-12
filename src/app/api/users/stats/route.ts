// src/app/api/users/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";
import { verifyToken } from "../../../../lib/auth";

const INTERNSHIP_STATUSES = [
  "assigned",
  "started",
  "completed",
  "cancelled",
] as const;

// Last `count` calendar months (oldest first), e.g. [{key: "2026-02", label: "Feb 2026"}, ...]
function lastNMonths(count: number) {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    months.push({ key, label });
  }
  return months;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const isAdmin = decoded.type === "admin";
    // companyAdmin users only see stats for leads belonging to their own company
    const companyFilter =
      decoded.type === "companyAdmin" && decoded.company_id
        ? { company_id: decoded.company_id }
        : {};

    const months = lastNMonths(6);
    const today = new Date();
    const rangeStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const [result] = await User.aggregate([
      { $match: companyFilter },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
                recruiters: { $sum: { $cond: ["$isRecruiter", 1, 0] } },
              },
            },
          ],
          signupsByMonth: [
            { $match: { createdAt: { $gte: rangeStart } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
          ],
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            {
              $lookup: {
                from: "tags",
                localField: "_id",
                foreignField: "_id",
                as: "tag",
              },
            },
            { $unwind: "$tag" },
            { $project: { _id: 0, name: "$tag.name", count: 1 } },
          ],
          topUniversities: [
            { $unwind: "$assignedCourses" },
            {
              $group: { _id: "$assignedCourses.university", count: { $sum: 1 } },
            },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { _id: 0, name: "$_id", count: 1 } },
          ],
          topCourses: [
            { $unwind: "$assignedCourses" },
            { $group: { _id: "$assignedCourses.course", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { _id: 0, name: "$_id", count: 1 } },
          ],
          internshipStatus: [
            { $unwind: "$assignedInternships" },
            {
              $group: { _id: "$assignedInternships.status", count: { $sum: 1 } },
            },
            { $project: { _id: 0, status: "$_id", count: 1 } },
          ],
          byCompany: isAdmin
            ? [
                {
                  $group: {
                    _id: { $ifNull: ["$company_id", "Unassigned"] },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
                { $project: { _id: 0, company_id: "$_id", count: 1 } },
              ]
            : [],
        },
      },
    ]);

    const totals = result.totals[0] || { total: 0, verified: 0, recruiters: 0 };

    const signupsMap = new Map<string, number>(
      result.signupsByMonth.map((m: { _id: string; count: number }) => [
        m._id,
        m.count,
      ])
    );
    const signupsByMonth = months.map(({ key, label }) => ({
      month: key,
      label,
      count: signupsMap.get(key) || 0,
    }));

    const statusMap = new Map<string, number>(
      result.internshipStatus.map((s: { status: string; count: number }) => [
        s.status,
        s.count,
      ])
    );
    const internshipStatus = INTERNSHIP_STATUSES.map((status) => ({
      status,
      count: statusMap.get(status) || 0,
    }));

    return NextResponse.json({
      isAdmin,
      totals,
      signupsByMonth,
      topTags: result.topTags,
      topUniversities: result.topUniversities,
      topCourses: result.topCourses,
      internshipStatus,
      byCompany: result.byCompany,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
