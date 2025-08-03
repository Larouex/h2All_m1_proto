import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/admin/test-cookies:
 *   get:
 *     summary: Test cookie utilities (Admin)
 *     description: Test campaign cookie functionality from the server side (Admin panel)
 *     tags:
 *       - Admin
 *       - Testing
 *     responses:
 *       200:
 *         description: Cookie test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 testResults:
 *                   type: object
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 */
export async function GET() {
  try {
    const instructions = [
      "1. Open browser console",
      "2. Import cookie utilities: import { runCookieTests, manualTests } from './lib/utils/cookieTests'",
      "3. Run all tests: await runCookieTests()",
      "4. Or test manually:",
      "   - manualTests.testSetCookie('test-123', 'CODE123')",
      "   - manualTests.testGetCookie()",
      "   - manualTests.testExpiration()",
      "   - manualTests.testClearCookie()",
      "   - manualTests.showDebugInfo()",
      "",
      "Cookie utilities are client-side only and must be tested in the browser.",
      "",
      "Use the admin test interface at /admin/test-cookies for full testing capabilities.",
    ];

    return NextResponse.json({
      message: "Admin cookie testing endpoint ready",
      testingInstructions: instructions,
      adminTestInterface: "/admin/test-cookies",
      cookieUtilities: {
        setCampaignCookie: "Set campaign data with UTM parameters",
        getCampaignCookie: "Retrieve and validate campaign data",
        clearCampaignCookie: "Clear campaign cookie",
        hasCampaignCookie: "Check if campaign cookie exists",
        getCampaignCookieExpiration: "Get expiration information",
        updateCampaignCookieUTM: "Update UTM parameters",
        cookieDebug: "Debug utilities and force clear",
      },
      testFeatures: [
        "Basic set/get/clear operations",
        "Cookie expiration (24-48 hours)",
        "UTM parameter management",
        "Data validation and error handling",
        "Automatic expired cookie cleanup",
        "Concurrent operation handling",
        "Debug utilities",
        "Interactive admin test interface",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to provide cookie testing information",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
