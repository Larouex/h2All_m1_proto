import { NextResponse } from "next/server";
import { adminApiPaths } from "@/app/lib/admin-api-spec";

/**
 * H2All M1 Proto - Complete OpenAPI 3.0 Specification
 * This endpoint serves the complete API documentation for all endpoints
 */

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "H2All M1 Proto API",
    version: "1.0.0",
    description:
      "Complete API documentation for H2All M1 Prototype application including all health, auth, email, campaign, admin, and utility endpoints.",
    contact: {
      name: "H2All Development Team",
      url: "https://h2all.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
    {
      url: "https://h2all-m1-proto.up.railway.app",
      description: "Production Server",
    },
  ],
  tags: [
    {
      name: "Health & Status",
      description: "Health check and status endpoints",
    },
    {
      name: "Authentication",
      description: "User authentication and authorization",
    },
    {
      name: "Email & Subscription",
      description: "Email claims and newsletter subscriptions",
    },
    { name: "Campaigns", description: "Campaign management and validation" },
    {
      name: "Redemption & Codes",
      description: "Redemption codes and statistics",
    },
    {
      name: "Projects & Impact",
      description: "Project management and user impact tracking",
    },
    {
      name: "Admin - Data Management",
      description: "Administrative data operations",
    },
    {
      name: "Admin - Email Claims",
      description: "Administrative email claims management",
    },
    {
      name: "Admin - Utilities",
      description: "Administrative utility functions",
    },
    {
      name: "Test & Development",
      description: "Testing and development endpoints",
    },
  ],
  paths: {
    ...adminApiPaths,
    // Health & Status APIs
    "/api/health": {
      get: {
        tags: ["Health & Status"],
        summary: "Health check endpoint",
        description:
          "Primary health check endpoint for Railway deployment monitoring",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", format: "date-time" },
                    environment: { type: "string", example: "development" },
                    railway: { type: "string", example: "production" },
                    service: { type: "string", example: "running" },
                    message: {
                      type: "string",
                      example: "Service is operational",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health & Status"],
        summary: "Alternative health check",
        description: "Alternative health check endpoint",
        responses: {
          200: { description: "Service is healthy" },
        },
      },
    },
    "/healthz": {
      get: {
        tags: ["Health & Status"],
        summary: "Kubernetes-style health check",
        description: "Kubernetes-style health check endpoint",
        responses: {
          200: { description: "Service is healthy" },
        },
      },
    },

    // Authentication APIs
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticate user with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "User logout",
        description: "Logout current user and invalidate session",
        responses: {
          200: { description: "Logout successful" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user info",
        description: "Get authenticated user information",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User information",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "User registration",
        description: "Register new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created successfully" },
          400: { description: "Invalid input or user already exists" },
        },
      },
    },

    // Email & Subscription APIs
    "/api/emailclaim": {
      get: {
        tags: ["Email & Subscription"],
        summary: "Get email claim status",
        description: "Get status of email claims for monitoring",
        parameters: [
          {
            name: "email",
            in: "query",
            description: "Email address to check",
            schema: { type: "string", format: "email" },
          },
        ],
        responses: {
          200: {
            description: "Email claim status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    claimed: { type: "boolean" },
                    campaign_id: { type: "string" },
                    redemption_value: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Email & Subscription"],
        summary: "Main email redemption upsert",
        description:
          "Primary endpoint for email redemption claims with production-safe fallbacks",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                  campaign_id: { type: "string" },
                  redemption_value: { type: "number", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Email claim processed successfully" },
          400: { description: "Invalid email or request data" },
          500: { description: "Internal server error" },
        },
      },
    },
    "/api/subscribe": {
      post: {
        tags: ["Email & Subscription"],
        summary: "Newsletter subscription",
        description: "Subscribe email to newsletter",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                  preferences: {
                    type: "object",
                    properties: {
                      marketing: { type: "boolean" },
                      updates: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Subscription successful" },
          400: { description: "Invalid email" },
        },
      },
    },

    // Campaign APIs
    "/api/campaigns": {
      get: {
        tags: ["Campaigns"],
        summary: "List all campaigns",
        description: "Get list of all available campaigns",
        responses: {
          200: {
            description: "List of campaigns",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Campaign" },
                },
              },
            },
          },
        },
      },
    },
    "/api/campaigns/{id}": {
      get: {
        tags: ["Campaigns"],
        summary: "Get specific campaign",
        description: "Get details of a specific campaign by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Campaign ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Campaign details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Campaign" },
              },
            },
          },
          404: { description: "Campaign not found" },
        },
      },
    },
    "/api/campaigns/seed": {
      post: {
        tags: ["Campaigns"],
        summary: "Seed campaign data",
        description: "Initialize database with sample campaign data",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Campaign data seeded successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/campaigns/validate": {
      post: {
        tags: ["Campaigns"],
        summary: "Validate campaign code",
        description: "Validate a campaign code without redeeming",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Code is valid" },
          400: { description: "Invalid or expired code" },
        },
      },
    },
    "/api/campaigns/redeem": {
      post: {
        tags: ["Campaigns"],
        summary: "Redeem campaign code",
        description: "Redeem a campaign code and apply benefits",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "email"],
                properties: {
                  code: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Code redeemed successfully" },
          400: { description: "Invalid code or already redeemed" },
        },
      },
    },

    // Redemption & Code APIs
    "/api/redemption-codes": {
      get: {
        tags: ["Redemption & Codes"],
        summary: "List redemption codes",
        description: "Get list of redemption codes",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of redemption codes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/RedemptionCode" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Redemption & Codes"],
        summary: "Create redemption codes",
        description: "Generate new redemption codes",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  count: { type: "integer", minimum: 1, maximum: 100 },
                  campaign_id: { type: "string" },
                  value: { type: "number", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Redemption codes created" },
          400: { description: "Invalid parameters" },
        },
      },
    },
    "/api/total-redeems": {
      get: {
        tags: ["Redemption & Codes"],
        summary: "Get total redemption stats",
        description: "Get total redemption statistics and counts",
        responses: {
          200: {
            description: "Redemption statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total_redeems: { type: "integer" },
                    total_value: { type: "number" },
                    unique_emails: { type: "integer" },
                    campaigns: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Projects & Impact APIs
    "/api/projects": {
      get: {
        tags: ["Projects & Impact"],
        summary: "List all projects",
        description: "Get list of all projects",
        responses: {
          200: {
            description: "List of projects",
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
      post: {
        tags: ["Projects & Impact"],
        summary: "Create new project",
        description: "Create a new project",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectInput" },
            },
          },
        },
        responses: {
          201: { description: "Project created successfully" },
          400: { description: "Invalid project data" },
        },
      },
    },
    "/api/user/impact": {
      get: {
        tags: ["Projects & Impact"],
        summary: "Get user impact data",
        description: "Get impact data for authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User impact data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserImpact" },
              },
            },
          },
        },
      },
    },
    "/api/user/impact/seed": {
      post: {
        tags: ["Projects & Impact"],
        summary: "Seed user impact data",
        description: "Initialize user impact data for testing",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "User impact data seeded" },
        },
      },
    },
    "/api/user/email-impact": {
      get: {
        tags: ["Projects & Impact"],
        summary: "Get email-based impact",
        description: "Get impact data based on email address",
        parameters: [
          {
            name: "email",
            in: "query",
            required: true,
            description: "Email address",
            schema: { type: "string", format: "email" },
          },
        ],
        responses: {
          200: {
            description: "Email-based impact data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserImpact" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Campaign: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "expired"] },
          start_date: { type: "string", format: "date-time" },
          end_date: { type: "string", format: "date-time" },
          redemption_value: { type: "number" },
        },
      },
      RedemptionCode: {
        type: "object",
        properties: {
          id: { type: "string" },
          code: { type: "string" },
          campaign_id: { type: "string" },
          value: { type: "number" },
          used: { type: "boolean" },
          used_by: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
          impact_metric: { type: "string" },
          target_value: { type: "number" },
          current_value: { type: "number" },
        },
      },
      ProjectInput: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          impact_metric: { type: "string" },
          target_value: { type: "number" },
        },
      },
      UserImpact: {
        type: "object",
        properties: {
          total_redemptions: { type: "integer" },
          total_value: { type: "number" },
          projects_supported: { type: "integer" },
          impact_score: { type: "number" },
          badges: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
