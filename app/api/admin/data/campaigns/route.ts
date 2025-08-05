import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const campaignData = await db.select().from(campaigns);

    // Convert to CSV format
    const headers = [
      "id",
      "name",
      "redemptionValue",
      "isActive",
      "description",
      "maxRedemptions",
      "currentRedemptions",
      "totalRedemptions",
      "totalRedemptionValue",
      "status",
      "createdAt",
      "expiresAt",
      "updatedAt",
    ];

    const csvRows = [
      headers.join(","),
      ...campaignData.map((campaign) =>
        headers
          .map((header) => {
            const value = campaign[header as keyof typeof campaign];
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
        "Content-Disposition": `attachment; filename="campaigns_export_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to export campaigns" },
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
        const campaignData: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, "").trim();
          if (value && value !== "") {
            switch (header) {
              case "is_active":
                campaignData.isActive = value.toLowerCase() === "true";
                break;
              case "redemption_value":
                campaignData.redemptionValue = value;
                break;
              case "total_redemption_value":
                campaignData.totalRedemptionValue = value;
                break;
              case "max_redemptions":
                campaignData.maxRedemptions = parseInt(value) || null;
                break;
              case "current_redemptions":
                campaignData.currentRedemptions = parseInt(value) || 0;
                break;
              case "total_redemptions":
                campaignData.totalRedemptions = parseInt(value) || 0;
                break;
              case "created_at":
                if (value && value !== "") {
                  campaignData.createdAt = new Date(value);
                }
                break;
              case "expires_at":
                if (value && value !== "") {
                  campaignData.expiresAt = new Date(value);
                }
                break;
              case "updated_at":
                if (value && value !== "") {
                  campaignData.updatedAt = new Date(value);
                }
                break;
              default:
                campaignData[header] = value;
            }
          }
        });

        // Ensure required fields
        if (!campaignData.name || !campaignData.redemptionValue) {
          errors.push(
            `Row ${i + 2}: Missing required fields (name, redemptionValue)`
          );
          continue;
        }

        // Set default expiresAt if not provided
        if (!campaignData.expiresAt) {
          campaignData.expiresAt = new Date("2025-12-31");
        }

        // Check if campaign exists
        if (campaignData.id) {
          const existing = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, campaignData.id));

          if (existing.length > 0) {
            // Update existing campaign
            await db
              .update(campaigns)
              .set(campaignData)
              .where(eq(campaigns.id, campaignData.id));
          } else {
            // Insert new campaign
            await db.insert(campaigns).values(campaignData);
          }
        } else {
          // Insert new campaign without ID (will be auto-generated)
          delete campaignData.id;
          await db.insert(campaigns).values(campaignData);
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
      message: `Successfully imported ${imported} campaigns${
        errors.length > 0 ? ` with ${errors.length} errors` : ""
      }`,
    });
  } catch (error) {
    console.error("Import campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to import campaigns" },
      { status: 500 }
    );
  }
}
