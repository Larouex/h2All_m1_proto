import { NextRequest, NextResponse } from "next/server";
import { projectQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
