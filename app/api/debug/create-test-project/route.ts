import { NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const tableName = "projects";

// Only create client if environment is configured
let tableClient: TableClient | null = null;

if (accountName && accountKey) {
  const tableEndpoint = `https://${accountName}.table.core.windows.net`;
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  tableClient = new TableClient(tableEndpoint, tableName, credential);
}

export async function POST() {
  try {
    // Check if environment variables are available
    if (
      !process.env.AZURE_STORAGE_ACCOUNT_NAME ||
      !process.env.AZURE_STORAGE_ACCOUNT_KEY
    ) {
      return NextResponse.json(
        { error: "Service temporarily unavailable - configuration missing" },
        { status: 503 }
      );
    }

    if (!tableClient) {
      return NextResponse.json(
        { error: "Database service not available" },
        { status: 503 }
      );
    }

    console.log("Creating test project: Water Well in Africa");

    // Ensure the table exists (create if it doesn't)
    try {
      await tableClient!.createTable();
      console.log("Projects table created or already exists");
    } catch (createTableError: unknown) {
      // Table might already exist, which is fine
      const error = createTableError as { statusCode?: number };
      if (error.statusCode !== 409) {
        console.error("Error creating table:", createTableError);
      }
    }

    // Create test project data
    const testProject = {
      partitionKey: "projects",
      rowKey: "water-well-africa-001",
      Id: "water-well-africa-001",
      Name: "Clean Water Well in Rural Africa",
      Description:
        "Building a sustainable water well to provide clean drinking water for 500+ families in rural Kenya. This project includes drilling, pump installation, and community training for maintenance.",
      FundingGoal: 25000,
      CurrentFunding: 18750, // 75% funded
      Category: "Water & Sanitation",
      Location: "Nakuru County, Kenya",
      Status: "active",
      CreatedDateTime: new Date("2024-12-01"),
      IsActive: true,
      // Additional fields for more context
      Beneficiaries: 500,
      EstimatedCompletion: "March 2025",
      ProjectManager: "Sarah Kimani",
      Organization: "Water for All Foundation",
    };

    console.log("Inserting test project:", testProject);

    // Insert the test project
    await tableClient!.createEntity(testProject);

    console.log("Test project created successfully!");

    return NextResponse.json({
      success: true,
      message: "Test project 'Water Well in Africa' created successfully",
      projectId: testProject.Id,
      fundedPageUrl: `/funded?project=${testProject.Id}`,
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

    const projectEntity = await tableClient!.getEntity("projects", projectId);

    return NextResponse.json({
      exists: true,
      project: {
        id: projectEntity.Id,
        name: projectEntity.Name,
        fundingGoal: projectEntity.FundingGoal,
        currentFunding: projectEntity.CurrentFunding,
        status: projectEntity.Status,
      },
    });
  } catch (error: unknown) {
    const azureError = error as { statusCode?: number };
    if (azureError.statusCode === 404) {
      return NextResponse.json({
        exists: false,
        message: "Test project not found",
      });
    }

    console.error("Error checking test project:", error);
    return NextResponse.json(
      { error: "Failed to check test project" },
      { status: 500 }
    );
  }
}
