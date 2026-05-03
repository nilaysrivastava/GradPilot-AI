import { NextRequest, NextResponse } from "next/server";

import { buildLoanEngineResult } from "@/lib/loan-engine";
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

    const result = buildLoanEngineResult(profile, selectedUniversityId);

    return NextResponse.json({
      success: true,
      message: "Loan engine analysis generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate loan engine analysis.",
      },
      { status: 400 }
    );
  }
}