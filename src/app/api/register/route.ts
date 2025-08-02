import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const tableName = "users";

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials and table client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableClient = new TableClient(tableEndpoint, tableName, credential);

// TypeScript interface for user entity data model
interface UserEntity {
  partitionKey: string;
  rowKey: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Country: string;
  PasswordHash: string;
  CreatedDateTime: Date;
  IsActive: boolean;
}

// Helper function to encode email to row key
function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

// Simple password hashing (for demo purposes - use bcrypt in production)
function hashPassword(password: string): string {
  // In production, use bcrypt or another proper hashing library
  return Buffer.from(password + "salt").toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body
    const body = await request.json();
    const { email, firstName, lastName, country, password } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !country || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Define the partitionKey and rowKey
    const partitionKey = "users";
    const rowKey = encodeEmailToRowKey(email);

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

    // Check if user already exists
    try {
      await tableClient.getEntity(partitionKey, rowKey);
      // If we get here, user already exists
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    } catch (error: unknown) {
      // If error is 404, user doesn't exist - this is what we want
      const azureError = error as { statusCode?: number };
      if (azureError.statusCode !== 404) {
        throw error; // Re-throw if it's not a 404
      }
    }

    // Create new user entity
    const newUser: UserEntity = {
      partitionKey: partitionKey,
      rowKey: rowKey,
      Email: email.toLowerCase(),
      FirstName: firstName,
      LastName: lastName,
      Country: country,
      PasswordHash: hashPassword(password),
      CreatedDateTime: new Date(),
      IsActive: true,
    };

    // Create the new user in Azure Table Storage
    await tableClient.createEntity(newUser);

    // Return success response (don't include sensitive data)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          email: newUser.Email,
          firstName: newUser.FirstName,
          lastName: newUser.LastName,
          country: newUser.Country,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing registration:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}

// Explicitly prevent PUT/PATCH operations to ensure immutability
export async function PUT() {
  return NextResponse.json(
    {
      error: "User registration cannot be modified. Registration is immutable.",
    },
    { status: 405 } // Method Not Allowed
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "User registration cannot be modified. Registration is immutable.",
    },
    { status: 405 } // Method Not Allowed
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "User deletion not allowed through this endpoint." },
    { status: 405 } // Method Not Allowed
  );
}
