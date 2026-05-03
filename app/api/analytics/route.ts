import { NextRequest, NextResponse } from "next/server";

import { buildAnalyticsEngineResult } from "@/lib/analytics-engine";
import type { StudentProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body.profile as StudentProfile;

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing student profile.",
        },
        { status: 400 }
      );
    }

    const result = buildAnalyticsEngineResult(profile);

    return NextResponse.json({
      success: true,
      message: "Analytics generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate analytics.",
      },
      { status: 400 }
    );
  }
}