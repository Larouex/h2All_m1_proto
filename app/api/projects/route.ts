import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const tableName = "projects";

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials and table client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableClient = new TableClient(tableEndpoint, tableName, credential);

// TypeScript interface for project entity data model (for reference)
// interface ProjectEntity {
//   partitionKey: string;
//   rowKey: string;
//   Id: string;
//   Name: string;
//   Description: string;
//   FundingGoal: number;
//   CurrentFunding: number;
//   Category: string;
//   Location: string;
//   Status: string;
//   CreatedDateTime: Date;
//   IsActive: boolean;
// }

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

    // Define the partitionKey and rowKey
    const partitionKey = "projects";
    const rowKey = projectId;

    console.log(`Fetching project data for ID: ${projectId}`);

    // Ensure the table exists (create if it doesn't)
    try {
      await tableClient.createTable();
    } catch (createTableError: unknown) {
      // Table might already exist, which is fine
      const error = createTableError as { statusCode?: number };
      if (error.statusCode !== 409) {
        console.error("Error creating table:", createTableError);
      }
    }

    // Try to find the project
    try {
      const projectEntity = await tableClient.getEntity(partitionKey, rowKey);
      console.log(`Project found: ${projectEntity.Name}`);

      // Return project data
      return NextResponse.json({
        id: projectEntity.Id,
        name: projectEntity.Name,
        description: projectEntity.Description,
        fundingGoal: projectEntity.FundingGoal,
        currentFunding: projectEntity.CurrentFunding,
        category: projectEntity.Category,
        location: projectEntity.Location,
        status: projectEntity.Status,
        createdDate: projectEntity.CreatedDateTime,
      });
    } catch (error: unknown) {
      // Project not found
      console.log("Error fetching project:", error);
      const azureError = error as { statusCode?: number };

      if (azureError.statusCode === 404) {
        console.log("Project not found (404)");
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      // Other database error
      console.log("Other database error, rethrowing");
      throw error;
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
