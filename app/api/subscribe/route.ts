import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { subscriptionQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

async function handlePOST(request: NextRequest) {
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

    console.log(
      `Processing subscription for email: ${email}, campaign: ${campaign}`
    );

    try {
      // Try to increment counter for existing subscription or create new one
      const subscription = await subscriptionQueries.incrementCounter(
        email.toLowerCase()
      );

      if (subscription.submittedCounter === 1) {
        // New subscription created
        // Update with campaign tracking ID if provided
        if (campaign !== "default") {
          await subscriptionQueries.update(subscription.id, {
            campaignTrackingId: campaign,
          });
        }

        return NextResponse.json(
          {
            message: "New subscription created successfully",
            email: email,
            submittedCounter: 1,
          },
          { status: 201 }
        );
      } else {
        // Existing subscription updated
        return NextResponse.json(
          {
            message: "Submission successfully incremented",
            email: email,
            submittedCounter: subscription.submittedCounter,
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}

// Export secured handler
export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.PUBLIC);
