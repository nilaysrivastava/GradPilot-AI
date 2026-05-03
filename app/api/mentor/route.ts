import { NextRequest, NextResponse } from "next/server";

import { buildMentorReply } from "@/lib/mentor-engine";
import type { StudentProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profile = body.profile as StudentProfile;
    const message = String(body.message ?? "");

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing student profile.",
        },
        { status: 400 }
      );
    }

    if (!message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing mentor message.",
        },
        { status: 400 }
      );
    }

    const reply = buildMentorReply(profile, message);

    return NextResponse.json({
      success: true,
      message: "Mentor response generated successfully.",
      reply,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate mentor response.",
      },
      { status: 400 }
    );
  }
}