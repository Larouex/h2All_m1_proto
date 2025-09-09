// Remove unused import

/**
 * H2All M1 Proto - Admin API Extensions
 * Additional OpenAPI paths for admin endpoints
 */

export const adminApiPaths = {
  // Admin APIs - Data Management
  "/api/admin/stats": {
    get: {
      tags: ["Admin - Data Management"],
      summary: "Admin dashboard statistics",
      description: "Get comprehensive statistics for admin dashboard",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Admin statistics",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_users: { type: "integer" },
                  total_campaigns: { type: "integer" },
                  total_redemptions: { type: "integer" },
                  total_projects: { type: "integer" },
                  recent_activity: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                        user: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized - Admin access required" },
      },
    },
  },
  "/api/admin/users": {
    get: {
      tags: ["Admin - Data Management"],
      summary: "List all users",
      description: "Get paginated list of all users",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        {
          name: "limit",
          in: "query",
          description: "Items per page",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
        {
          name: "search",
          in: "query",
          description: "Search term for email or name",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "List of users",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  users: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Admin - Data Management"],
      summary: "User management operations",
      description: "Perform various user management operations",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["action"],
              properties: {
                action: {
                  type: "string",
                  enum: [
                    "create",
                    "update",
                    "delete",
                    "activate",
                    "deactivate",
                  ],
                },
                user_id: { type: "string" },
                user_data: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    name: { type: "string" },
                    role: { type: "string", enum: ["user", "admin"] },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User operation completed successfully" },
        400: { description: "Invalid operation or parameters" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/admin/manage-user": {
    post: {
      tags: ["Admin - Data Management"],
      summary: "Individual user management",
      description: "Manage individual user account settings",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["user_id", "action"],
              properties: {
                user_id: { type: "string" },
                action: {
                  type: "string",
                  enum: ["suspend", "restore", "reset_password"],
                },
                reason: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User management action completed" },
        404: { description: "User not found" },
      },
    },
  },
  "/api/admin/promote-user": {
    post: {
      tags: ["Admin - Data Management"],
      summary: "Promote user permissions",
      description: "Promote user to admin or change role permissions",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["user_id", "new_role"],
              properties: {
                user_id: { type: "string" },
                new_role: {
                  type: "string",
                  enum: ["admin", "moderator", "user"],
                },
                permissions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User promoted successfully" },
        400: { description: "Invalid role or permissions" },
      },
    },
  },
  "/api/admin/campaigns-list": {
    get: {
      tags: ["Admin - Data Management"],
      summary: "Admin campaign listing",
      description: "Get detailed campaign list for admin management",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Admin campaign list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  allOf: [
                    { $ref: "#/components/schemas/Campaign" },
                    {
                      type: "object",
                      properties: {
                        total_redemptions: { type: "integer" },
                        total_value_redeemed: { type: "number" },
                        unique_users: { type: "integer" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/admin/projects": {
    get: {
      tags: ["Admin - Data Management"],
      summary: "Admin project management",
      description: "Get projects with admin management data",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Admin projects list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Project" },
              },
            },
          },
        },
      },
    },
  },
  "/api/admin/subscriptions": {
    get: {
      tags: ["Admin - Data Management"],
      summary: "Subscription management",
      description: "Manage email subscriptions and preferences",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Subscription data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_subscribers: { type: "integer" },
                  active_subscribers: { type: "integer" },
                  recent_subscriptions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        email: { type: "string" },
                        subscribed_at: { type: "string", format: "date-time" },
                        preferences: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Admin APIs - Email Claims
  "/api/admin/email-claims": {
    get: {
      tags: ["Admin - Email Claims"],
      summary: "Admin email claims dashboard",
      description: "Comprehensive email claims data for admin dashboard",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "start_date",
          in: "query",
          description: "Filter claims from date",
          schema: { type: "string", format: "date" },
        },
        {
          name: "end_date",
          in: "query",
          description: "Filter claims to date",
          schema: { type: "string", format: "date" },
        },
        {
          name: "campaign_id",
          in: "query",
          description: "Filter by campaign",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Email claims dashboard data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_claims: { type: "integer" },
                  unique_emails: { type: "integer" },
                  total_value: { type: "number" },
                  claims_by_campaign: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        campaign_id: { type: "string" },
                        count: { type: "integer" },
                        value: { type: "number" },
                      },
                    },
                  },
                  recent_claims: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        email: { type: "string" },
                        campaign_id: { type: "string" },
                        redemption_value: { type: "number" },
                        created_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/admin/emailclaims": {
    get: {
      tags: ["Admin - Email Claims"],
      summary: "Alternative email claims endpoint",
      description: "Alternative endpoint for email claims data",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Email claims data" },
      },
    },
  },
  "/api/admin/fix-email-timestamps": {
    post: {
      tags: ["Admin - Email Claims"],
      summary: "Fix timestamp issues",
      description: "Fix timestamp formatting issues in email claims",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Timestamps fixed successfully" },
        500: { description: "Error fixing timestamps" },
      },
    },
  },
  "/api/admin/diagnose-email-claims": {
    get: {
      tags: ["Admin - Email Claims"],
      summary: "Diagnose email claim issues",
      description: "Diagnostic information for email claims system",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Diagnostic information",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  database_status: { type: "string" },
                  schema_version: { type: "string" },
                  table_structure: { type: "object" },
                  sample_data: { type: "array" },
                  issues_found: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/admin/migrate-email-claims": {
    post: {
      tags: ["Admin - Email Claims"],
      summary: "Migrate email claims data",
      description: "Migrate email claims data between schema versions",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                migration_type: {
                  type: "string",
                  enum: ["add_columns", "update_schema", "data_cleanup"],
                },
                dry_run: { type: "boolean", default: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Migration completed successfully" },
        400: { description: "Invalid migration parameters" },
      },
    },
  },

  // Admin APIs - Data Operations
  "/api/admin/data/backup-info": {
    get: {
      tags: ["Admin - Data Operations"],
      summary: "Database backup information",
      description: "Get information about database backups",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Backup information",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  last_backup: { type: "string", format: "date-time" },
                  backup_size: { type: "string" },
                  backup_location: { type: "string" },
                  scheduled_backups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        frequency: { type: "string" },
                        next_run: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/admin/data/campaigns": {
    get: {
      tags: ["Admin - Data Operations"],
      summary: "Export campaign data",
      description: "Export campaign data in various formats",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "format",
          in: "query",
          description: "Export format",
          schema: {
            type: "string",
            enum: ["json", "csv", "xlsx"],
            default: "json",
          },
        },
      ],
      responses: {
        200: { description: "Campaign data export" },
      },
    },
  },
  "/api/admin/data/clean": {
    post: {
      tags: ["Admin - Data Operations"],
      summary: "Clean/purge data operations",
      description: "Perform data cleanup and purging operations",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["operation"],
              properties: {
                operation: {
                  type: "string",
                  enum: [
                    "remove_expired",
                    "cleanup_duplicates",
                    "purge_test_data",
                  ],
                },
                confirm: { type: "boolean", default: false },
                dry_run: { type: "boolean", default: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cleanup operation completed" },
        400: { description: "Invalid operation parameters" },
      },
    },
  },
  "/api/admin/data/codes": {
    get: {
      tags: ["Admin - Data Operations"],
      summary: "Export redemption codes",
      description: "Export redemption codes data",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Filter by code status",
          schema: { type: "string", enum: ["used", "unused", "expired"] },
        },
      ],
      responses: {
        200: { description: "Redemption codes export" },
      },
    },
  },
  "/api/admin/data/users": {
    get: {
      tags: ["Admin - Data Operations"],
      summary: "Export user data",
      description: "Export user data with privacy controls",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "include_pii",
          in: "query",
          description: "Include personally identifiable information",
          schema: { type: "boolean", default: false },
        },
      ],
      responses: {
        200: { description: "User data export" },
      },
    },
  },
  "/api/admin/unused-codes": {
    get: {
      tags: ["Admin - Data Operations"],
      summary: "List unused redemption codes",
      description: "Get list of unused redemption codes for cleanup",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Unused redemption codes",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unused: { type: "integer" },
                  codes: {
                    type: "array",
                    items: { $ref: "#/components/schemas/RedemptionCode" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Admin APIs - Utilities
  "/api/admin/generate-redeem-url": {
    post: {
      tags: ["Admin - Utilities"],
      summary: "Generate redemption URLs",
      description: "Generate secure redemption URLs for campaigns",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["campaign_id"],
              properties: {
                campaign_id: { type: "string" },
                expiry_hours: {
                  type: "integer",
                  minimum: 1,
                  maximum: 8760,
                  default: 24,
                },
                use_limit: { type: "integer", minimum: 1, default: 1 },
                custom_params: { type: "object" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Redemption URL generated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string", format: "uri" },
                  expires_at: { type: "string", format: "date-time" },
                  use_limit: { type: "integer" },
                  tracking_id: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },

  // Test & Development APIs
  "/api/test": {
    get: {
      tags: ["Test & Development"],
      summary: "Basic API test endpoint",
      description: "Simple endpoint for testing API connectivity",
      responses: {
        200: {
          description: "Test successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "API test successful" },
                  timestamp: { type: "string", format: "date-time" },
                  environment: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Test & Development"],
      summary: "Test POST operations",
      description: "Test endpoint for POST operations and request validation",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                test_data: { type: "string" },
                echo: { type: "boolean", default: true },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "POST test successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  received: { type: "object" },
                  processed: { type: "boolean" },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },
};
