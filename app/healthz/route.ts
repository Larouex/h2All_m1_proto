import { NextResponse } from "next/server";

/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Kubernetes-style health check endpoint
 *     description: Returns the health status of the application for Kubernetes/Railway
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
  });
}
