import { NextRequest, NextResponse } from "next/server";

import { buildAdmissionEngineResult } from "@/lib/admission-engine";
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

    const result = buildAdmissionEngineResult(profile, selectedUniversityId);

    return NextResponse.json({
      success: true,
      message: "Admission prediction generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate admission prediction.",
      },
      { status: 400 }
    );
  }
}