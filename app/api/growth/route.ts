import { NextRequest, NextResponse } from "next/server";

import { buildGrowthEngineResult } from "@/lib/growth-engine";
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

    const result = buildGrowthEngineResult(profile);

    return NextResponse.json({
      success: true,
      message: "Growth engine generated successfully.",
      result,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to generate growth engine." },
      { status: 400 }
    );
  }
}