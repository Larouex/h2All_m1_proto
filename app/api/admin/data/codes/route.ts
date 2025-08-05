import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { redemptionCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const codesData = await db.select().from(redemptionCodes);

    // Convert to CSV format
    const headers = [
      "id",
      "campaignId",
      "uniqueCode",
      "isUsed",
      "userId",
      "userEmail",
      "redemptionValue",
      "redemptionSource",
      "redemptionDevice",
      "redemptionLocation",
      "redemptionUrl",
      "createdAt",
      "redeemedAt",
      "expiresAt",
      "updatedAt",
    ];
    const csvRows = [
      headers.join(","),
      ...codesData.map((code) =>
        headers
          .map((header) => {
            const value = code[header as keyof typeof code];
            // Handle special cases for CSV formatting
            if (value === null || value === undefined) return "";
            if (typeof value === "string" && value.includes(",")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="redemption_codes_export_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export redemption codes error:", error);
    return NextResponse.json(
      { error: "Failed to export redemption codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Invalid CSV format - no data rows found" },
        { status: 400 }
      );
    }

    // Parse CSV with proper comma handling
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    }

    const headers = parseCSVLine(lines[0]).map((h) =>
      h.trim().replace(/"/g, "")
    );
    const dataLines = lines.slice(1);

    let imported = 0;
    let errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = parseCSVLine(dataLines[i]);
        const codeData = {} as Record<string, unknown>;

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, "").trim();
          if (value && value !== "") {
            switch (header) {
              case "is_used":
                // Force imported codes to be unused - they should only be marked as used when redeemed
                codeData.isUsed = false;
                break;
              case "campaign_id":
                codeData.campaignId = value;
                break;
              case "unique_code":
                codeData.uniqueCode = value;
                break;
              case "user_id":
                // Ignore user_id from CSV - should only be set when redeemed
                break;
              case "user_email":
                // Ignore user_email from CSV - should only be set when redeemed
                break;
              case "redemption_value":
                codeData.redemptionValue = value;
                break;
              case "redemption_source":
                codeData.redemptionSource = value;
                break;
              case "redemption_device":
                codeData.redemptionDevice = value;
                break;
              case "redemption_location":
                codeData.redemptionLocation = value;
                break;
              case "redemption_url":
                codeData.redemptionUrl = value;
                break;
              case "created_at":
                if (value && value !== "") {
                  codeData.createdAt = new Date(value);
                }
                break;
              case "redeemed_at":
                // Ignore redeemed_at from CSV - should only be set when actually redeemed
                // This ensures imported codes remain unredeemed until redeemed through the application
                break;
              case "expires_at":
                if (value && value !== "") {
                  codeData.expiresAt = new Date(value);
                }
                break;
              case "updated_at":
                if (value && value !== "") {
                  codeData.updatedAt = new Date(value);
                }
                break;
              default:
                codeData[header] = value;
            }
          }
        });

        // Ensure required fields
        if (!codeData.campaignId || !codeData.uniqueCode) {
          errors.push(
            `Row ${i + 2}: Missing required fields (campaignId, uniqueCode)`
          );
          continue;
        }

        // Set default expiresAt if not provided
        if (!codeData.expiresAt) {
          codeData.expiresAt = new Date("2025-12-31");
        }

        // Check if code exists
        if (codeData.id) {
          const existing = await db
            .select()
            .from(redemptionCodes)
            .where(eq(redemptionCodes.id, codeData.id as string));

          if (existing.length > 0) {
            // Update existing code
            await db
              .update(redemptionCodes)
              .set(codeData as any)
              .where(eq(redemptionCodes.id, codeData.id as string));
          } else {
            // Insert new code
            await db.insert(redemptionCodes).values(codeData as any);
          }
        } else {
          // Insert new code without ID (will be auto-generated)
          delete codeData.id;
          await db.insert(redemptionCodes).values(codeData as any);
        }

        imported++;
      } catch (error) {
        errors.push(
          `Row ${i + 2}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      message: `Successfully imported ${imported} redemption codes${
        errors.length > 0 ? ` with ${errors.length} errors` : ""
      }`,
    });
  } catch (error) {
    console.error("Import redemption codes error:", error);
    return NextResponse.json(
      { error: "Failed to import redemption codes" },
      { status: 500 }
    );
  }
}
