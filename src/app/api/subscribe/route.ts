import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const tableName = "subscriptions";

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials and table client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableClient = new TableClient(tableEndpoint, tableName, credential);

// TypeScript interface for subscriber entity data model
interface SubscriberEntity {
  partitionKey: string;
  rowKey: string;
  EMail: string;
  SubmittedCounter: number;
  CreatedDateTime: Date;
  CampaignTrackingId?: string;
}

// Helper function to encode email to row key
function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body to get the email
    const body = await request.json();
    const { email } = body;

    // Use searchParams to read optional campaign query parameter with fallback
    const campaign = request.nextUrl.searchParams.get("campaign") || "default";

    // Check to ensure email was provided
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Define the partitionKey (using campaign ID) and rowKey (using helper function)
    const partitionKey = campaign;
    const rowKey = encodeEmailToRowKey(email);

    // Ensure the table exists (create if it doesn't)
    try {
      await tableClient.createTable();
    } catch (createTableError: unknown) {
      // Table might already exist, which is fine
      if ((createTableError as { statusCode?: number }).statusCode !== 409) {
        console.error("Error creating table:", createTableError);
      }
    }

    // Azure Table Storage logic
    try {
      // Try to find an existing subscriber
      const existingEntity = await tableClient.getEntity(partitionKey, rowKey);

      // If found, create an updated entity by incrementing the SubmittedCounter
      const updatedEntity = {
        ...existingEntity,
        partitionKey: partitionKey,
        rowKey: rowKey,
        SubmittedCounter: (existingEntity.SubmittedCounter as number) + 1,
      };

      // Update the entity in Azure Table Storage
      await tableClient.updateEntity(updatedEntity);

      // Return success response indicating submission was incremented
      return NextResponse.json(
        {
          message: "Submission successfully incremented",
          email: email,
          submittedCounter: updatedEntity.SubmittedCounter,
        },
        { status: 200 }
      );
    } catch (tableError: unknown) {
      // Handle case where entity doesn't exist or other table errors
      console.error("Azure Table Storage error:", tableError);

      // Check if the error is a 404 (entity not found)
      if ((tableError as { statusCode?: number }).statusCode === 404) {
        // Create a new entity with all required properties
        const newEntity: SubscriberEntity = {
          partitionKey: partitionKey,
          rowKey: rowKey,
          EMail: email,
          SubmittedCounter: 1,
          CreatedDateTime: new Date(),
          CampaignTrackingId: campaign,
        };

        // Create the new entity in Azure Table Storage
        await tableClient.createEntity(newEntity);

        // Return success response with 201 status code
        return NextResponse.json(
          {
            message: "New subscription created successfully",
            email: email,
            submittedCounter: 1,
          },
          { status: 201 }
        );
      } else {
        // If error is not a 404, re-throw it
        throw tableError;
      }
    }

    // TODO: Continue with Azure Table Storage logic
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
