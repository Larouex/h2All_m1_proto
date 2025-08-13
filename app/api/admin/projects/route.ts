import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get all projects for counting and stats
    const allProjects = await db.select().from(projects);

    // Get paginated results
    const projectsData = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(offset);

    // Calculate stats from all projects
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(
      (p) => p.isActive && p.status === "active"
    ).length;
    const totalFundingGoal = allProjects.reduce(
      (sum, project) => sum + parseFloat(project.fundingGoal),
      0
    );
    const totalCurrentFunding = allProjects.reduce(
      (sum, project) => sum + parseFloat(project.currentFunding),
      0
    );

    return NextResponse.json({
      projects: projectsData,
      pagination: {
        page,
        limit,
        totalCount: totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
      },
      stats: {
        totalProjects,
        activeProjects,
        totalFundingGoal,
        totalCurrentFunding,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID parameter is required" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Project deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

async function handlePUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Convert string values to appropriate types
    const processedData = {
      ...updateData,
      fundingGoal: updateData.fundingGoal?.toString(),
      beneficiaries: updateData.beneficiaries
        ? parseInt(updateData.beneficiaries)
        : null,
      updatedAt: new Date(),
    };

    const result = await db
      .update(projects)
      .set(processedData)
      .where(eq(projects.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: result[0],
      message: `Project updated successfully`,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// Export secured handlers
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
export const DELETE = withSecurity(handleDELETE, SECURITY_CONFIGS.ADMIN);
export const PUT = withSecurity(handlePUT, SECURITY_CONFIGS.ADMIN);
