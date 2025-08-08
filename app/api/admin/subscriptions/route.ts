import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get all subscriptions for counting and stats
    const allSubscriptions = await db.select().from(subscriptions);

    // Get paginated results
    const subscriptionsData = await db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.updatedAt))
      .limit(limit)
      .offset(offset);

    // Calculate stats from all subscriptions
    const totalSubscriptions = allSubscriptions.length;
    const activeSubscriptions = allSubscriptions.filter(
      (s) => s.isActive
    ).length;
    const totalSubmissions = allSubscriptions.reduce(
      (sum, sub) => sum + sub.submittedCounter,
      0
    );
    const avgSubmissions =
      totalSubscriptions > 0 ? totalSubmissions / totalSubscriptions : 0;

    return NextResponse.json({
      subscriptions: subscriptionsData,
      pagination: {
        page,
        limit,
        totalCount: totalSubscriptions,
        totalPages: Math.ceil(totalSubscriptions / limit),
      },
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        totalSubmissions,
        avgSubmissions: Number(avgSubmissions.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID parameter is required" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Subscription deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Process the data
    const processedData = {
      ...updateData,
      submittedCounter: parseInt(updateData.submittedCounter) || 0,
      updatedAt: new Date(),
    };

    const result = await db
      .update(subscriptions)
      .set(processedData)
      .where(eq(subscriptions.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: result[0],
      message: `Subscription updated successfully`,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
