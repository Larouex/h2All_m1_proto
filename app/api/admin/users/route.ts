import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { userQueries } from "@/app/lib/database-pg";

// GET /api/admin/users - List all users
async function handleGET(request: NextRequest) {
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
      country: user.country || "",
      balance: user.balance || "0.00",
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLoginAt?.toISOString(),
      registrationDate: user.createdAt.toISOString(),
      totalRedemptions: user.totalRedemptions || 0,
      totalRedemptionValue: user.totalRedemptionValue || "0.00",
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
async function handlePUT(request: NextRequest) {
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
      country: updatedUser.country || "",
      balance: updatedUser.balance || "0.00",
      isActive: updatedUser.isActive,
      isAdmin: updatedUser.isAdmin,
      lastLogin: updatedUser.lastLoginAt?.toISOString(),
      registrationDate: updatedUser.createdAt.toISOString(),
      totalRedemptions: updatedUser.totalRedemptions || 0,
      totalRedemptionValue: updatedUser.totalRedemptionValue || "0.00",
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

// DELETE /api/admin/users - Delete user permanently
async function handleDELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await userQueries.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user from database
    const deletedUser = await userQueries.delete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser.id,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// Export secured admin endpoints - require API key and origin validation
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
export const PUT = withSecurity(handlePUT, SECURITY_CONFIGS.ADMIN);
export const DELETE = withSecurity(handleDELETE, SECURITY_CONFIGS.ADMIN);
