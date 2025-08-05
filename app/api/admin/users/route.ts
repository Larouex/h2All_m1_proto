import { NextRequest, NextResponse } from "next/server";
import { userQueries } from "@/app/lib/database-pg";

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const offset = (page - 1) * limit;

    // Get users from database
    const users = await userQueries.list(limit, offset);

    // Filter by search term if provided
    let filteredUsers = users;
    if (search) {
      filteredUsers = users.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by status if provided
    if (status !== "all") {
      const isActive = status === "active";
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === isActive
      );
    }

    // Transform to match the frontend interface
    const transformedUsers = filteredUsers.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      isActive: user.isActive,
      lastLogin: user.lastLoginAt?.toISOString(),
      registrationDate: user.createdAt.toISOString(),
      totalRedemptions: user.totalRedemptions || 0,
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await userQueries.update(userId, updates);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform to match frontend interface
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName || "",
      lastName: updatedUser.lastName || "",
      isActive: updatedUser.isActive,
      lastLogin: updatedUser.lastLoginAt?.toISOString(),
      registrationDate: updatedUser.createdAt.toISOString(),
      totalRedemptions: updatedUser.totalRedemptions || 0,
    };

    return NextResponse.json({
      user: transformedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
