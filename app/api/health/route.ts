import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "GradPilot AI",
    message: "Backend health check is running.",
    modules: [
      "auth",
      "student-profile",
      "recommendation-engine",
      "roi-engine",
      "admission-predictor",
      "timeline-generator",
      "decision-engine",
      "ai-mentor",
      "loan-engine",
      "growth-engine",
    ],
  });
}
