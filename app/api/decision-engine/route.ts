import { NextRequest, NextResponse } from "next/server";

import { buildDecisionEngineResult } from "@/lib/decision-engine";
import type { StudentProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profile = body.profile as StudentProfile;
    const selectedUniversityId = body.selectedUniversityId as string | undefined;

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing student profile.",
        },
        { status: 400 }
      );
    }

    const result = buildDecisionEngineResult(profile, selectedUniversityId);

    return NextResponse.json({
      success: true,
      message: "Decision intelligence generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate decision intelligence.",
      },
      { status: 400 }
    );
  }
}