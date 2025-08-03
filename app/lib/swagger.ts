import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "H2All M1 API",
      version: "1.0.0",
      description:
        "API documentation for H2All M1 campaign and redemption code system",
      contact: {
        name: "H2All M1 Team",
        email: "support@h2all.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        Campaign: {
          type: "object",
          required: ["name", "redemptionValue", "expiresAt"],
          properties: {
            id: {
              type: "string",
              description: "Unique campaign identifier",
              example: "1704067200000-abc123def",
            },
            name: {
              type: "string",
              description: "Campaign name",
              example: "Holiday Bonus 2024",
            },
            redemptionValue: {
              type: "number",
              minimum: 0.01,
              description: "Value added to user balance when code is redeemed",
              example: 25.0,
            },
            isActive: {
              type: "boolean",
              description: "Whether the campaign is currently active",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Campaign creation timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Campaign expiration timestamp",
              example: "2024-12-31T23:59:59.999Z",
            },
            description: {
              type: "string",
              description: "Optional campaign description",
              example: "Special holiday promotion offering bonus rewards",
            },
            maxRedemptions: {
              type: "integer",
              minimum: 1,
              description: "Maximum number of redemptions allowed",
              example: 1000,
            },
            currentRedemptions: {
              type: "integer",
              minimum: 0,
              description: "Current number of redemptions",
              example: 150,
            },
          },
        },
        CreateCampaignRequest: {
          type: "object",
          required: ["name", "redemptionValue", "expiresAt"],
          properties: {
            name: {
              type: "string",
              description: "Campaign name",
              example: "Holiday Bonus 2024",
            },
            redemptionValue: {
              type: "number",
              minimum: 0.01,
              description: "Value added to user balance when code is redeemed",
              example: 25.0,
            },
            description: {
              type: "string",
              description: "Optional campaign description",
              example: "Special holiday promotion offering bonus rewards",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Campaign expiration timestamp",
              example: "2024-12-31T23:59:59.999Z",
            },
            maxRedemptions: {
              type: "integer",
              minimum: 1,
              description: "Maximum number of redemptions allowed",
              example: 1000,
            },
          },
        },
        RedemptionCode: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique redemption code identifier",
              example: "1704067200000-xyz789abc",
            },
            campaignId: {
              type: "string",
              description: "Associated campaign identifier",
              example: "1704067200000-abc123def",
            },
            uniqueCode: {
              type: "string",
              description: "The actual redemption code",
              example: "ABC123XY",
            },
            isUsed: {
              type: "boolean",
              description: "Whether the code has been redeemed",
              example: false,
            },
            redeemedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when code was redeemed",
              example: null,
            },
            userId: {
              type: "string",
              nullable: true,
              description: "ID of user who redeemed the code",
              example: null,
            },
            userEmail: {
              type: "string",
              format: "email",
              nullable: true,
              description: "Email of user who redeemed the code",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Code creation timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        CreateRedemptionCodesRequest: {
          type: "object",
          required: ["campaignId", "quantity"],
          properties: {
            campaignId: {
              type: "string",
              description: "Campaign identifier for the codes",
              example: "1704067200000-abc123def",
            },
            quantity: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Number of codes to generate",
              example: 10,
            },
          },
        },
        RedeemCodeRequest: {
          type: "object",
          required: ["uniqueCode", "userId", "userEmail"],
          properties: {
            uniqueCode: {
              type: "string",
              description: "The redemption code to redeem",
              example: "ABC123XY",
            },
            userId: {
              type: "string",
              description: "ID of the user redeeming the code",
              example: "user-123",
            },
            userEmail: {
              type: "string",
              format: "email",
              description: "Email of the user redeeming the code",
              example: "user@example.com",
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique project identifier",
              example: "water-well-africa-001",
            },
            name: {
              type: "string",
              description: "Project name",
              example: "Water Well in Rural Africa",
            },
            description: {
              type: "string",
              description: "Project description",
              example:
                "Building clean water access for 500 families in rural Kenya",
            },
            fundingGoal: {
              type: "number",
              description: "Total funding goal amount",
              example: 25000,
            },
            currentFunding: {
              type: "number",
              description: "Current funding amount",
              example: 18750,
            },
            category: {
              type: "string",
              description: "Project category",
              example: "Water & Sanitation",
            },
            location: {
              type: "string",
              description: "Project location",
              example: "Kiambu County, Kenya",
            },
            status: {
              type: "string",
              description: "Project status",
              example: "active",
            },
            createdDate: {
              type: "string",
              format: "date-time",
              description: "Project creation date",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique user identifier",
              example: "user-123",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            firstName: {
              type: "string",
              description: "User first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User last name",
              example: "Doe",
            },
            country: {
              type: "string",
              description: "User country",
              example: "United States",
            },
            balance: {
              type: "number",
              description: "User account balance from redemptions",
              example: 75.0,
            },
            isActive: {
              type: "boolean",
              description: "Whether the user account is active",
              example: true,
            },
            totalRedemptions: {
              type: "integer",
              description: "Total number of codes redeemed",
              example: 3,
            },
            totalRedemptionValue: {
              type: "number",
              description: "Total value redeemed across all codes",
              example: 75.0,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Campaign not found",
            },
          },
        },
      },
    },
  },
  apis: ["./app/api/**/*.ts"], // Path to the API files
};

const specs = swaggerJSDoc(options);
export default specs;
