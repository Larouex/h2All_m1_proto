import { NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import {
  campaigns,
  redemptionCodes,
  users,
  projects,
  subscriptions,
} from "@/db/schema";

async function handleGET() {
  try {
    // Get current database statistics for backup planning
    const stats = {
      campaigns: await db.select().from(campaigns),
      codes: await db.select().from(redemptionCodes),
      users: await db.select().from(users),
      projects: await db.select().from(projects),
      subscriptions: await db.select().from(subscriptions),
    };

    const counts = {
      campaigns: stats.campaigns.length,
      codes: stats.codes.length,
      users: stats.users.length,
      projects: stats.projects.length,
      subscriptions: stats.subscriptions.length,
    };

    const totalRecords = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    // Generate backup commands
    const backupCommands = {
      postgresql: [
        "# PostgreSQL Backup Commands",
        "# Replace with your actual database connection details",
        "",
        "# Full database backup:",
        "pg_dump -h localhost -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql",
        "",
        "# Table-specific backups:",
        "pg_dump -h localhost -U username -d database_name -t campaigns > campaigns_backup.sql",
        "pg_dump -h localhost -U username -d database_name -t redemption_codes > codes_backup.sql",
        "pg_dump -h localhost -U username -d database_name -t users > users_backup.sql",
        "pg_dump -h localhost -U username -d database_name -t projects > projects_backup.sql",
        "pg_dump -h localhost -U username -d database_name -t subscriptions > subscriptions_backup.sql",
      ].join("\n"),
      railway: [
        "# Railway Database Backup",
        "# Use Railway CLI or admin panel to create backups",
        "",
        "# Via Railway CLI:",
        "railway db backup create",
        "",
        "# Via Railway Admin Panel:",
        "# 1. Go to your Railway project dashboard",
        "# 2. Navigate to Database tab",
        "# 3. Click 'Create Backup'",
        "# 4. Download backup file",
      ].join("\n"),
    };

    return NextResponse.json({
      success: true,
      currentData: counts,
      totalRecords,
      backupRecommendations: {
        estimatedBackupSize: `~${Math.ceil(totalRecords / 1000)}MB (estimated)`,
        recommendedBackupFrequency: "Before any data operations",
        backupCommands,
        lastChecked: new Date().toISOString(),
      },
      warnings: [
        "Always verify backup integrity before proceeding with destructive operations",
        "Store backups in a secure location separate from your main database",
        "Test backup restoration process in a development environment first",
        "Consider creating multiple backup copies for critical data",
      ],
    });
  } catch (error) {
    console.error("Backup info error:", error);
    return NextResponse.json(
      {
        error: "Failed to get backup information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export secured handler
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
