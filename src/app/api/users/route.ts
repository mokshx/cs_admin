// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";
import bcrypt from "bcrypt";
import { verifyToken } from "../../../lib/auth";
import "../../../lib/models/Tag"; // Ensure Tag model is registered

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // companyAdmin users only see leads belonging to their company
    const companyFilter =
      decoded.type === "companyAdmin" && decoded.company_id
        ? { company_id: decoded.company_id }
        : {};

    // Build search query
    const searchQuery = search
      ? {
          ...companyFilter,
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { companyEmail: { $regex: search, $options: "i" } },
            { officeEmail: { $regex: search, $options: "i" } },
          ],
        }
      : companyFilter;

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select("-password -forgotPasswordToken -verifyToken")
        .populate("tags")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchQuery),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userData = await request.json();

    // Automatically stamp company_id for companyAdmin users
    if (decoded.type === "companyAdmin" && decoded.company_id) {
      userData.company_id = decoded.company_id;
    }

    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: String(error) || "Internal server error" },
      { status: 400 }
    );
  }
}
