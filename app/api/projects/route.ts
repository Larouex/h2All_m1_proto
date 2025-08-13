import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { projectQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

async function handlePOST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching project data for ID: ${projectId}`);

    // Try to find the project
    try {
      const project = await projectQueries.findById(projectId);

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      console.log(`Project found: ${project.name}`);

      // Return project data
      return NextResponse.json({
        id: project.id,
        name: project.name,
        description: project.description,
        fundingGoal: Number(project.fundingGoal),
        currentFunding: Number(project.currentFunding),
        category: project.category,
        location: project.location,
        status: project.status,
        createdDate: project.createdAt,
        beneficiaries: project.beneficiaries,
        estimatedCompletion: project.estimatedCompletion,
        projectManager: project.projectManager,
        organization: project.organization,
      });
    } catch (error) {
      console.log("Error fetching project:", error);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in projects API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
// Export secured handler
export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.PUBLIC);

async function handleGET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handlePUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handlePATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleDELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withSecurity(handleGET, SECURITY_CONFIGS.PUBLIC);
export const PUT = withSecurity(handlePUT, SECURITY_CONFIGS.PUBLIC);
export const PATCH = withSecurity(handlePATCH, SECURITY_CONFIGS.PUBLIC);
export const DELETE = withSecurity(handleDELETE, SECURITY_CONFIGS.PUBLIC);
