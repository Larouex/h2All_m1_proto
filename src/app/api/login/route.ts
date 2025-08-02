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

// Helper function to encode email for rowKey (MUST match registration exactly)
function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

// Simple password hashing (same as registration)
function hashPassword(password: string): string {
  // In production, use bcrypt or another proper hashing library
  return Buffer.from(password + "salt").toString("base64");
}

// Simple password verification (in production, use proper bcrypt)
function verifyPassword(
  inputPassword: string,
  storedPasswordHash: string
): boolean {
  // Hash the input password and compare with stored hash
  const inputPasswordHash = hashPassword(inputPassword);
  return inputPasswordHash === storedPasswordHash;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Define the partitionKey and rowKey
    const partitionKey = "users";
    const rowKey = encodeEmailToRowKey(email); // Function handles lowercase conversion

    console.log(`Login attempt for email: ${email}`);
    console.log(`Encoded rowKey: ${rowKey}`);

    // Try to find the user
    try {
      const userEntity = await tableClient.getEntity(partitionKey, rowKey);
      console.log(`User found: ${userEntity.Email}`);
      console.log(`Stored password hash: ${userEntity.PasswordHash}`);

      // Debug password verification
      const inputPasswordHash = hashPassword(password);
      console.log(`Input password hash: ${inputPasswordHash}`);
      console.log(
        `Hashes match: ${inputPasswordHash === userEntity.PasswordHash}`
      );

      // Verify password
      if (verifyPassword(password, userEntity.PasswordHash as string)) {
        console.log("Password verification successful");
        // Login successful - return user data (without password)
        return NextResponse.json({
          email: userEntity.Email,
          firstName: userEntity.FirstName,
          lastName: userEntity.LastName,
          country: userEntity.Country,
        });
      } else {
        console.log("Password verification failed");
        // Invalid password
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    } catch (error: unknown) {
      // User not found
      console.log("Error fetching user:", error);
      const azureError = error as { statusCode?: number };
      console.log("Error status code:", azureError.statusCode);

      if (azureError.statusCode === 404) {
        console.log("User not found (404)");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      // Other database error
      console.log("Other database error, rethrowing");
      throw error;
    }
  } catch (error) {
    console.error("Error in login API:", error);
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
