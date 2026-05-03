import { NextRequest, NextResponse } from "next/server";

import { buildApplicationTrackerResult } from "@/lib/application-tracker-engine";
import type { StudentProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body.profile as StudentProfile;

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Missing student profile." },
        { status: 400 }
      );
    }

    const result = buildApplicationTrackerResult(profile);

    return NextResponse.json({
      success: true,
      message: "Application tracker generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to generate application tracker." },
      { status: 400 }
    );
  }
}