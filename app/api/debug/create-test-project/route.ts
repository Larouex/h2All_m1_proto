import { NextResponse } from "next/server";
import { projectQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

export async function POST() {
  try {
    console.log("Creating test project: Water Well in Africa");

    // Create test project data
    const testProjectData = {
      id: "water-well-africa-001",
      name: "Clean Water Well in Rural Africa",
      description:
        "Building a sustainable water well to provide clean drinking water for 500+ families in rural Kenya. This project includes drilling, pump installation, and community training for maintenance.",
      fundingGoal: "25000",
      currentFunding: "18750", // 75% funded
      category: "Water & Sanitation",
      location: "Nakuru County, Kenya",
      status: "active",
      isActive: true,
      beneficiaries: 500,
      estimatedCompletion: "March 2025",
      projectManager: "Sarah Kimani",
      organization: "Water for All Foundation",
    };

    console.log("Inserting test project:", testProjectData);

    // Check if project already exists
    const existingProject = await projectQueries.findById(testProjectData.id);
    if (existingProject) {
      return NextResponse.json({
        success: true,
        message: "Test project already exists",
        projectId: existingProject.id,
        fundedPageUrl: `/funded?project=${existingProject.id}`,
      });
    }

    // Insert the test project
    const newProject = await projectQueries.create(testProjectData);

    console.log("Test project created successfully!");

    return NextResponse.json({
      success: true,
      message: "Test project 'Water Well in Africa' created successfully",
      projectId: newProject.id,
      fundedPageUrl: `/funded?project=${newProject.id}`,
    });
  } catch (error) {
    console.error("Error creating test project:", error);
    return NextResponse.json(
      { error: "Failed to create test project", details: error },
      { status: 500 }
    );
  }
}

// Also allow GET to check if project exists
export async function GET() {
  try {
    const projectId = "water-well-africa-001";
    console.log("Checking if test project exists:", projectId);

    const project = await projectQueries.findById(projectId);

    if (project) {
      return NextResponse.json({
        exists: true,
        project: {
          id: project.id,
          name: project.name,
          fundingGoal: Number(project.fundingGoal),
          currentFunding: Number(project.currentFunding),
          status: project.status,
        },
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: "Test project not found",
      });
    }
  } catch (error) {
    console.error("Error checking test project:", error);
    return NextResponse.json(
      { error: "Failed to check test project" },
      { status: 500 }
    );
  }
}
